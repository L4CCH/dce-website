---
title: Writing a source
description: "Bring a museum's API, or anything else Digital Collections Explorer does not read itself, into a site with a short program that writes a manifest."
---

DCE reads a folder, an S3 bucket, or a [manifest](../mapping-your-data/#the-manifest). A collection kept anywhere else, such as behind a museum's API, in a collection management system, or with an aggregator of several institutions, reaches a site through a source: a short program, in any language, that reads it and writes a manifest. DCE does the rest: it fetches the images, keeps what the site shows of them, computes their vectors, and builds the collection. A source is best kept in a repository of its own, so that it can be run again when the collection changes.

## An example

This program reads the public-domain works of the Statens Museum for Kunst (SMK), Denmark's national gallery, from its open API, and writes a manifest of about 39,000 images beside itself, each named by its IIIF image service. It needs Python and DuckDB, which DCE installs, and sends about 400 requests, at most one a second.

```python
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import duckdb

API = (
    "https://api.smk.dk/api/v1/art/search/?keys=*"
    "&filters=[has_image:true],[public_domain:true]&rows=100&offset={}"
)
HEADERS = {"User-Agent": "dce-source-smk/1.0"}
HERE = Path(__file__).resolve().parent
LIMIT = int(sys.argv[1]) if len(sys.argv) > 1 else None


def fetch(url):
    for wait in (2, 4, 8, 16, None):
        time.sleep(1)
        try:
            request = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(request, timeout=120) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            if (error.code != 429 and error.code < 500) or wait is None:
                raise
        except (urllib.error.URLError, TimeoutError):
            if wait is None:
                raise
        time.sleep(wait)


def joined(values, key=None):
    found = (value.get(key) if key else value for value in values or [])
    return "; ".join(value for value in found if value)


def row_of(work):
    if not work.get("image_iiif_id"):
        return None
    titles = [t["title"] for t in work.get("titles") or [] if t.get("title")]
    return {
        "iiif": work["image_iiif_id"],
        "object_id": work["object_number"],
        "title": titles[0] if titles else None,
        "date": joined(work.get("production_date"), "period"),
        "creator": joined(work.get("production"), "creator"),
        "object_type": joined(work.get("object_names"), "name"),
        "technique": joined(work.get("techniques")),
        "source_url": work.get("frontend_url"),
    }


rows, read = [], 0
while LIMIT is None or read < LIMIT:
    works = fetch(API.format(read))["items"]
    if not works:
        break
    read += len(works)
    rows += [row for row in map(row_of, works) if row]

(HERE / "rows.json").write_text(json.dumps(rows))
duckdb.sql(
    f"COPY (SELECT * FROM read_json_auto('{HERE / 'rows.json'}')) "
    f"TO '{HERE / 'manifest.parquet'}' (FORMAT PARQUET)"
)
print(f"{len(rows):,} images of {read:,} works")
```

Saved as `data/sources/smk/source.py` in the DCE folder, it can be tried on the first 300 works, checked, run in full, and indexed:

```bash
python data/sources/smk/source.py 300
python -m src.profiling data/sources/smk/manifest.parquet
python data/sources/smk/source.py
python -m src.ingest data/sources/smk/manifest.parquet --images link \
  --requests-per-second 4 --data-dir data/collections/smk
```

The profile says what the site will do with each column and, under "Must fix before indexing," what keeps the manifest from being indexed. With `--images link`, the site keeps no copies, and visitors' browsers load each image from the museum's IIIF server. SMK states no pace for either, so the program waits a second before each request, and indexing keeps to four requests a second.

The example does what any source should:

- It names itself in a `User-Agent` header, since many APIs refuse Python's default one.
- It tries a request again after a pause when the failure may pass, as with a lost connection or a busy server that answers 429 or 5xx, but not when the API refuses it.
- It takes a number of works on its command line, so that it can be tried on a few hundred first.
- It skips records without an image and reads each field with `.get`, since real records leave fields out.
- It gives each field the name of a column the site knows, such as `object_type` for SMK's `object_names`, and puts several values in one cell, separated by `;`. [Mapping your data](../mapping-your-data/#how-columns-are-read) lists the names.

Read an API's terms of use before running a source in full. They may limit how often the API may be asked, how long what it returns may be kept, and whether its images may be copied or only shown from its own servers. Send one request at a time, as the example does, at the pace they allow, or a second apart when they give none. Index with `--images link` when they forbid copies, and with `--requests-per-second` when they ask for a slow pace; when they say nothing about the image server, keep to a few requests a second, such as 4. Credit the API in [`collection.json`](../describing-a-collection/) as they ask. When licenses differ from image to image, give each row its license and credit line in columns such as `license` and `credit_line`, which each object's page shows.

## Running it again

Running the source and then the same indexing command again brings the site up to date. New records are indexed, the catalog text of those already indexed is read again, and records gone from the source, such as a work an institution has taken down, leave the site. No vector is computed twice, so an image changed at the same address keeps its old one until the collection is indexed anew into a new folder. Files that leave the site stay indexed, and any copies of them stay in the collection folder, so they come back at no cost if the source lists them again. When more than a tenth of the indexed files are gone at once, indexing stops instead, since a source that loses so many is more often broken than pruned; `--allow-removals` lets it go ahead.

## With an AI coding agent

The [`dce-setup` skill](../indexing/#with-an-ai-coding-agent) writes a source on its own when a collection can be read only through an API: it asks for the address of the API and of its documentation, reads the API's terms, tries the program on a few hundred records, and runs the profile until nothing must be fixed. Without the skill, an AI coding agent, such as Claude Code, Codex, Gemini CLI, or Cursor, can follow this page in the same way.

## Vectors made elsewhere

When the images already have vectors, as when a collection was indexed before, a manifest can give them in a `vector` column: a list of numbers in each row, made by the model that `config.json` names (see [Models](../models/)). Indexing then computes vectors only for the rows without one. Before it starts, it embeds 20 of the given images again with that model and stops if their vectors do not match, as happens when they come from another model or belong to other rows. With `--images link` and an `iiif` column, an image with a vector is not downloaded at all: indexing reads only its size from the IIIF service.

## Related items

`--related related.parquet` adds items elsewhere that show the manifest's objects, such as the same photograph on Flickr Commons. An object's page lists them, those showing one of its images first, under the name `collection.json` gives their source, for example `"sources": {"flickr": {"label": "Flickr Commons"}}`; see [Describing a collection to visitors](../describing-a-collection/).

| Column | Holds |
| --- | --- |
| `object_id` | the manifest's object it shows; required |
| `source` | where it is, such as `flickr`; required |
| `source_id` | an id of its own, unique in the table, such as `flickr:2535935153`; required |
| `url` | its page |
| `title` | its title |
| `thumbnail` | a web address or a path to a small image of it, which indexing keeps in the collection folder |
| `rights`, `rights_url` | its license, and the license's address |
| `counts` | a JSON object, such as `{"faves": 3, "comments": 1}`; the page shows faves and comments |
| `tags` | a list of words |
| `image` | the address of the image it shows, as the manifest gives it |
| `link_type` | `same_image` when it is that very image, otherwise `same_record`, the default |

Indexing refuses a related table that lacks a required column, leaves one empty, or repeats a `source_id`, and leaves out a row that names an object the manifest does not have. The profile checks the table as well:

```bash
python -m src.profiling data/sources/smk/manifest.parquet \
  --related data/sources/smk/related.parquet
python -m src.ingest data/sources/smk/manifest.parquet \
  --related data/sources/smk/related.parquet --data-dir data/collections/smk
```
