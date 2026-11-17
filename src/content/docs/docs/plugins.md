---
title: Writing a source plugin
description: "Bring a museum's API, or any source Digital Collections Explorer does not read itself, into a site by writing a collection package that it checks and builds."
sidebar:
  label: Plugins
---

A source plugin is a program, in any language, that writes a collection package from a source that DCE does not read itself, such as a museum's API, a collection management system, or an aggregator of several institutions. It runs on its own schedule and on its own machine, and hands DCE a folder of tables and vectors. `python -m src.collection check` says whether the package can be built, and `python -m src.collection build` writes the collection from it, with the same writer as `python -m src.ingest`. A plugin is best kept in a repository of its own.

## The package

A collection package is a folder with a `datapackage.json` that follows version 2 of the [Data Package](https://datapackage.org/standard/data-package/) standard. Each table is a resource: a parquet file, with a Table Schema of its columns. What only DCE reads is under `dce`: the version of this contract, the plugin that wrote the package, and the models whose vectors it holds.

```
harbor-museum/
  datapackage.json                    the tables, the models, and the plugin that wrote them
  files.parquet                       one row per image, page of a PDF, or view of a 3D model
  records.parquet                     one row per object; the other tables are optional too
  vectors/siglip2/paintings.npy       float32, one row per file
  vectors/siglip2/paintings.ids.npy   the id of the file in each row
  shape/                              optional: the shape index of the 3D models
  collection.json                     optional: the title, groups, institutions, and licenses
```

```json
{
  "$schema": "https://datapackage.org/profiles/2.0/datapackage.json",
  "name": "harbor-museum",
  "title": "Harbor Museum",
  "version": "2026.11.11",
  "created": "2026-11-11T09:30:00Z",
  "resources": [
    {
      "name": "files",
      "type": "table",
      "path": "files.parquet",
      "format": "parquet",
      "mediatype": "application/vnd.apache.parquet",
      "schema": {
        "fields": [
          {"name": "id", "type": "string"},
          {"name": "group", "type": "string"},
          {"name": "object_id", "type": "string"},
          {"name": "file_name", "type": "string"},
          {"name": "width", "type": "integer"},
          {"name": "height", "type": "integer"},
          {"name": "thumbnail", "type": "string"},
          {"name": "iiif", "type": "string"}
        ]
      }
    },
    {
      "name": "records",
      "type": "table",
      "path": "records.parquet",
      "format": "parquet",
      "mediatype": "application/vnd.apache.parquet",
      "schema": {
        "fields": [
          {"name": "object_id", "type": "string"},
          {"name": "title", "type": "string"},
          {"name": "source_url", "type": "string"},
          {"name": "creator", "type": "string"},
          {"name": "date", "type": "string"}
        ]
      }
    }
  ],
  "dce": {
    "contract": 1,
    "producer": {
      "name": "dce-source-harbor",
      "version": "0.3.0",
      "url": "https://github.com/example/dce-source-harbor"
    },
    "provenance": {"api_export": "2026-11-10", "commit": "4f2a9c1"},
    "default_model": "siglip2",
    "models": [
      {
        "key": "siglip2",
        "type": "siglip2",
        "name": "google/siglip2-base-patch16-224",
        "revision": "75de2d55ec2d0b4efc50b3e9ad70dba96a7b2fa2",
        "dimensions": 768,
        "vectors": ["vectors/siglip2/paintings.npy", "vectors/siglip2/maps.npy"]
      }
    ]
  }
}
```

- `$schema` names version 2 of the standard, as DCE requires. `name`, `title`, `version`, `created`, and the standard's other properties are optional, and DCE does not read them.
- Each table is a resource named after it, with `"type": "table"`, the `path` of one parquet file inside the package, and a `schema` whose `fields` list every column of the file in the file's order, each with a [Table Schema](https://datapackage.org/standard/table-schema/) type such as `string` or `integer`.
- `dce.contract` is the version of this contract, `1`. `dce.producer` gives the `name` and `version` of the plugin, and its `url` if it has one. `dce.provenance` is optional and free-form: what the plugin read, such as which export of the API or which commit of its own code. The collection keeps both in `index_info.json`, as `producer` and `provenance`.
- `dce.models` lists each model whose vectors the package holds: its `key`, in lowercase letters, digits, and hyphens; its `type`, `clip`, `siglip`, or `siglip2`; its `name` and `revision` on Hugging Face; its `dimensions`; and `vectors`, the files that hold them. The site searches with `default_model`, or with the first model, at the recorded revision. Without a revision, the site may load another version of the model than the one that made the vectors, and `check` notes it.

## Tables

| Table | Columns | Notes |
| --- | --- | --- |
| `files` | `id`, `group`, `object_id`, `file_name`, `width`, `height`, `thumbnail`, `processed`, `original`, `iiif`, `page`, `view_orbit` | required; `id` is the id the vectors carry |
| `records` | `object_id`, `title`, `source_url`, `model_url`, `document`, `pages` | one row per object |
| `fields` | `object_id`, `position`, `field`, `label`, `value` | the fields on the object's page, in order |
| `facets` | `object_id`, `facet`, `value` | the filters: `facet` is `date`, `name`, `place`, `culture`, `topic`, or `object_type`, and year filters read only dates written as a year, a span, or a decade |
| `text` | `object_id`, `field`, `value` | what search matches in `title`, `names`, `dates`, `places`, `topics`, `object_types`, `notes`, `physical`, or `identifiers` |
| `related_sources`, `related_tags` | as in the [collection format](../collection-format/#related-sources), with `object_id` for `record_id` | |

Only `files` is required, and of its columns only `id`.

- The columns in the table are read by these exact names. Another name that a manifest for `python -m src.ingest` may use, such as `record_id`, `group_id`, `iiif_url`, `glb`, `thumbnail_url`, `guid`, or `Group`, is refused with the name to use instead, since the catalog would otherwise hide the column.
- Any other column of `records` is the catalog, read as [How columns are read](../mapping-your-data/#how-columns-are-read) describes: the fields on an object's page, search over the catalog, and the filters. In a package without `records`, the other columns of `files` are the catalog instead, and each object's catalog is read from its files, as from a manifest. With `records`, they are not read.
- The `fields`, `facets`, and `text` tables, when given, replace what would otherwise be read from the catalog columns, for every record.
- A file's `group` is an id in lowercase letters, digits, and hyphens, as `python -m src.ingest` makes them, such as `cleveland-museum-of-art`. A file without a group is in the group `collection`.
- `source_url` is the `http://` or `https://` address of the record's page. `iiif` is the web address of the file's IIIF image service, its `info.json`, or any image request to it, and the collection keeps the address of its `info.json`.
- `thumbnail`, `processed`, `original`, `model_url`, `document`, and the thumbnails of related sources are web addresses, absolute paths, or paths relative to the collection folder, not to the package: the plugin puts those files there itself. `--check-files` refuses a package that names a file that is not there.
- A record whose object has no file is left out, a file whose object has no row in `records` is shown without a catalog record, and a vector whose id no file has is left out. `check` and `build` count each.

## Vectors

Each file in a model's `vectors` is a NumPy array of float32, one row per file. Beside it, a file of the same name ending in `.ids.npy` holds the id of the file in each row, as strings. Split a model's vectors as suits the plugin, for example one file per group; `build` sorts them into groups itself. Every file needs a vector from every model, with the model's `dimensions`. The vectors need not be normalized.

## The shape index

A collection with [3D models](../kinds-of-material/#3d-models) can list objects of a similar shape on each object's page. `"shape": "shape"` under `dce` names a folder of the package that holds the shape index as `python -m src.render3d` writes it: `vectors.npy`, one row per object; `objects.json`, the id of the object in each row; and `info.json`, the model that made them. `build` copies it into `embeddings/shape/`, and removes the one there when the package has none. The views drawn from a model are rows of `files` with their `view_orbit`, and the model is the `model_url` of its record, so 3D models need nothing else.

## collection.json

An optional `collection.json` in the package is copied into the collection folder, replacing one already there. It gives the title, the introduction, the suggested searches, the institution, and the license, as in [Describing a collection to visitors](../describing-a-collection/), and under `groups` each group's label, institution, and license, named by its id, in the order the filter lists them:

```json
{
  "title": "Harbor Museum",
  "institution": "the Harbor Museum",
  "license": {"name": "CC0 1.0", "url": "https://creativecommons.org/publicdomain/zero/1.0/"},
  "group_label": "Department",
  "groups": {
    "paintings": {"label": "Paintings"},
    "maps": {"label": "Maps and Charts"}
  }
}
```

A group that `collection.json` does not name is labeled with its id. A package without `collection.json` leaves the collection's own as it is.

## Writing a package in Python

A plugin in Python can write each table with DuckDB, then describe it from the file, so that its Table Schema always matches the columns:

```python
import json

import duckdb
import numpy as np

TYPES = {"VARCHAR": "string", "BIGINT": "integer", "INTEGER": "integer", "DOUBLE": "number", "BOOLEAN": "boolean"}


def table(package, name):
    columns = duckdb.sql(f"DESCRIBE SELECT * FROM '{package}/{name}.parquet'").fetchall()
    return {
        "name": name,
        "type": "table",
        "path": f"{name}.parquet",
        "format": "parquet",
        "mediatype": "application/vnd.apache.parquet",
        "schema": {"fields": [{"name": c[0], "type": TYPES.get(c[1], "any")} for c in columns]},
    }


np.save("harbor-museum/vectors/siglip2/paintings.npy", vectors.astype(np.float32))
np.save("harbor-museum/vectors/siglip2/paintings.ids.npy", np.array(ids))
descriptor = {
    "$schema": "https://datapackage.org/profiles/2.0/datapackage.json",
    "resources": [table("harbor-museum", "files"), table("harbor-museum", "records")],
    "dce": dce,
}
with open("harbor-museum/datapackage.json", "w") as handle:
    json.dump(descriptor, handle, indent=2)
```

Here `vectors` and `ids` are what the plugin's model made of the paintings, and `dce` is the section of the example above.

## Checking and building

```bash
python -m src.collection check harbor-museum/
python -m src.collection build harbor-museum/ --data-dir data/collections/harbor-museum --check-files
```

`check` says in plain sentences whether the package can be built and what it holds, and notes what the site will not use, such as a resource that DCE does not read. With `--json report.json`, it also writes the report as JSON. It exits with 2 when it refuses a package, as `python -m src.ingest` does when it refuses to run.

`build` checks the package the same way, then writes the collection into `--data-dir`, replacing the one there. It never changes the package, and refuses a `--data-dir` inside it. It replaces a collection that `python -m src.ingest` wrote only with `--overwrite`, which also removes `ingest_state.sqlite`, so that running ingest there later does not write its own collection over this one. With `--json counts.json`, it also writes its counts as JSON.

The checks refuse a package, each saying what to write instead, when:

- it names no contract, or a newer one than this DCE reads;
- `datapackage.json` does not follow version 2 of the standard, or a Table Schema does not list the columns of its file;
- a group is not an id in lowercase letters, digits, and hyphens;
- a column has another name than the one `build` reads, such as `record_id` for `object_id`;
- a `source_url` is not an `http://` or `https://` address, or an `iiif` value is not a web address;
- a model's `type` is not one that DCE can search with;
- a facet is not one of the six the site filters by: a group already gives a filter by institution;
- the `text` table names a field that search does not match;
- a file has no vector from one of the models, or a model's vectors do not have its dimensions;
- a file, a record, or a related source of one record is listed twice.

## Versioning

This page describes collection package contract 1. A package names its contract in `dce.contract`, and DCE refuses a package that names none, or one newer than it reads, saying which contract it reads. A plugin should pin the version of DCE it was tested with, a release or a commit, and run that version's `check` in its own tests.

A package is always complete: contract 1 has no packages that hold only what changed. Each package holds every file, record, and vector of the collection, and `build` replaces the collection with it.

## The Smithsonian Open Access search

The search of the Smithsonian's Open Access images is built by such a plugin, from the EDAN records and images of 19 units:

- **files**: each image, its museum as its group, its record, and the thumbnails the plugin made;
- **records**: each record's title and its permanent link;
- **fields**: EDAN's `freetext` fields, under EDAN's own labels and in its order;
- **facets**: EDAN's `indexedStructured` dates, names, places, subjects, kinds of object, and cultures;
- **text**: the words each searched field matches, such as names from both `indexedStructured` and `freetext`, and the record id among the catalog numbers;
- **related sources**: the photos of Flickr Commons matched to each record, with their tags and counts;
- **vectors**: from SigLIP 2 and CLIP, one file per museum;
- **3D models**: the views drawn from each model among the files, and their shape index.
