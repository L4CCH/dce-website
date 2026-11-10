---
title: Mapping your data
description: "Bring any catalog into a collection, from a spreadsheet to a museum's collection system or Smithsonian EDAN: the manifest, how each column is read, and what each part of the site needs."
---

A site searches what the images show and, where a catalog exists, what the records say. A folder of images needs nothing else. A catalog reaches the site through a manifest, and this page says how to map yours onto it. [Collection format](../collection-format/) describes what indexing then writes.

## The manifest

A manifest is a parquet table with one row per file, which may be an image, a PDF or a 3D model, and the catalog in columns beside it:

| Column | Holds | Needed for |
| --- | --- | --- |
| `image_url`, or `url`, `path`, `file`, `uri` | the file's address: a web address, or a path relative to the manifest | the file itself, unless `iiif` names its image |
| `iiif`, or `iiif_url`, `iiif_service`, `iiif_info` | its IIIF image service, as the service's address, its `info.json` or any image request to it | deep zoom, and sizes asked of the service |
| `thumbnail_url` | a thumbnail the source already makes | showing it without a copy |
| `object_id`, or `record_id`, `item_id` | the object the file shows | showing an object's files together |
| `group` | the group it belongs to, such as a museum | the filter by group, and each group's institution and license |
| `model_url`, `view_orbit` | a 3D model, the camera of a view drawn from it | [3D models](../kinds-of-material/#3d-models) |
| any other column | the catalog | the fields on the object's page, search over the catalog, and the filters |

The rows of one object repeat its `object_id`, and its catalog is read from its files, each column from the first file that fills it. A file with catalog text but no `object_id` is an object of its own. A spreadsheet lying next to the images is not read: save it as parquet first, as in the examples below. A `group_id` column still names objects, as it did in earlier versions, and indexing says so; name the column `group` to split the collection into groups.

## How columns are read

Columns are read by name, whatever their case, with spaces as underscores and plurals too:

| Read as | Columns | On the page | Searched as | Filter |
| --- | --- | --- | --- | --- |
| Title | `title`, `label` | as the title | title | |
| Link back | `source_url`, `guid`, `record_url`, `landing_page`, `permalink` | as the link | | |
| Names | `creator`, `author`, `artist`, `maker`, `photographer`, `contributor`, `publisher`, `people`, `sitter` | yes | names | `name` |
| Dates | `date`, `year`, `date_created`, `created`, `creation_date`, `production_date`, `period` | yes | dates, with each year's decade | `date` |
| Places | `place`, `location`, `geography`, `spatial`, `coverage`, `country`, `region`, `state`, `county`, `city` | yes | places | `place` |
| Cultures | `culture`, `nationality`, `people_group` | yes | subjects | `culture` |
| Subjects | `subject`, `topic`, `keyword`, `tag`, `theme` | yes | subjects | `topic` |
| Kinds of object | `object_type`, `genre`, `classification`, `kind`, `work_type` | yes | kinds of object | `object_type` |
| Materials | `medium`, `material`, `technique`, `dimensions`, `measurements`, `extent`, `physical_description` | yes | materials | |
| Catalog numbers | `identifier`, `accession_number`, `object_number`, `call_number`, `catalog_number`, `inventory_number` | yes | catalog numbers | |
| Notes | `description`, `notes`, `summary`, `abstract`, `caption`, `inscription`, `transcription`, and any other column of text | yes | notes | |

- Several values in one cell are separated by `;` or `|`.
- Web addresses, file names, media types and columns of numbers are not catalog text, and `type` and `format` are read as notes, since they often name a file's type; rename them when they describe the object.
- Filters list values as the catalog spells them, without the square brackets and closing marks of cataloging rules, so `[Japan],` is filed as `Japan`. Dates are read as years, spans or decades.
- A page shows each field under its column name, as `Date created` for `date_created`, unless `field_labels` in `collection.json` gives it another: `"field_labels": {"creation_date": "Date"}`.
- Names, places, subjects and kinds of object also teach Auto search which words of a query to look up in the catalog.

## What each part of the site needs

| The site can | when the data has |
| --- | --- |
| search by description and by image | images, PDFs or 3D models |
| show titles and link back | `title`, a link column |
| search the catalog as well | any catalog text |
| filter by date, place, kind of object, culture, subject or name | the columns read as those |
| show an object's images together | an object column |
| filter by group | a `group` column |
| show 3D models, PDFs, deep zoom | `.glb` models, PDF files, an IIIF column |

The profile says this of every collection before it is indexed, with the rules indexing uses. Its report lists what the site will do, and what it does with each column:

```bash
python -m src.profiling manifest.parquet
```

```
  The site will:
      - search by description
      - search the catalog text as well
      - show an object's images together
      - filter by group
      - filter by culture, date, name, object type, place, topic

  What the site does with each column:
      [catalog] creators   52% filled   names: on the page, searched, filter by name
      [catalog] department 71% filled   notes: on the page, searched
               Read as notes, since the site does not know this column name.
```

## A spreadsheet catalog

A catalog kept in a spreadsheet becomes a manifest in one query. Save the sheet as CSV, then rename its columns to names the site reads:

```python
import duckdb

duckdb.sql("""
COPY (
  SELECT "File" AS image_url, "Object number" AS object_id, "Title" AS title,
         "Maker" AS creator, "Date" AS date, "Place made" AS place,
         "Materials" AS medium, "Description" AS description
  FROM read_csv('catalog.csv')
) TO 'manifest.parquet' (FORMAT parquet)
""")
```

Paths such as `images/a.jpg` are read relative to the manifest. Columns the site already reads, such as `Title` or `Description`, need no renaming; `Place made` does, or it is read as notes.

## A Dublin Core export

An export from CONTENTdm, Omeka or an OAI-PMH feed in Dublin Core maps onto the manifest mostly as it is:

| Dublin Core | Column |
| --- | --- |
| `title` | `title` |
| `creator`, `contributor`, `publisher` | as they are, read as names |
| `date` | `date` |
| `subject` | `subject` |
| `coverage`, `spatial` | as they are, read as places |
| `type` | `object_type`, when it names a kind of object rather than `StillImage` |
| `format` | `extent`, when it describes the object rather than the file |
| `identifier` | `identifier`, or `source_url` when it is the record's web address |
| `description`, `rights`, `relation`, `source`, `language` | as they are, read as notes |

## IIIF manifests

A IIIF Presentation manifest gives each canvas's image service, its label and its metadata. One row per canvas, with the manifest's metadata as columns:

```python
import json
import urllib.request

import duckdb


def first(language_map):
    return next(iter(language_map.values()))[0]


rows = []
for address in ["https://iiif.example.org/object/1/manifest.json"]:
    manifest = json.load(urllib.request.urlopen(address))
    record = {
        "object_id": manifest["id"],
        "title": first(manifest["label"]),
        "source_url": manifest.get("homepage", [{}])[0].get("id"),
        **{first(m["label"]): first(m["value"]) for m in manifest.get("metadata", [])},
    }
    for canvas in manifest["items"]:
        body = canvas["items"][0]["items"][0]["body"]
        rows.append({**record, "iiif": body["service"][0]["id"]})

with open("rows.jsonl", "w") as handle:
    handle.writelines(json.dumps(row) + "\n" for row in rows)
duckdb.sql("COPY (SELECT * FROM read_json('rows.jsonl')) TO 'manifest.parquet' (FORMAT parquet)")
```

This reads version 3 of the Presentation API; in version 2 the service is at `sequences[0].canvases[].images[0].resource.service["@id"]`. Metadata labels such as `Creator` or `Date` become columns read by name. Since every row names an IIIF service, index with `--images thumbnails` to keep only small previews and let the server send the larger views. See [What the site keeps of each image](../indexing/#what-the-site-keeps-of-each-image).

## An export from a collection management system

Systems such as TMS, CollectiveAccess or PastPerfect export objects and their media apart. Join them on the object number, one row per image, and rename the object's columns:

```python
import duckdb

duckdb.sql("""
COPY (
  SELECT m.FilePath AS image_url, o.ObjectNumber AS object_id, o.Title AS title,
         o.DisplayName AS creator, o.Dated AS date, o.Medium AS medium,
         o.Dimensions AS dimensions, o.Classification AS classification,
         o.CreditLine AS credit_line
  FROM read_csv('media.csv') AS m JOIN read_csv('objects.csv') AS o USING (ObjectNumber)
) TO 'manifest.parquet' (FORMAT parquet)
""")
```

The images of one object share its `object_id`, so the site shows them together. `credit_line` is read as notes and shown as "Credit line"; `field_labels` in `collection.json` can call it "Credit".

## Several institutions

Give each row the institution it comes from in a `group` column, for example by joining the manifests of two institutions:

```sql
SELECT *, 'cma' AS "group" FROM read_parquet('cleveland.parquet')
UNION ALL BY NAME
SELECT *, 'wellcome' AS "group" FROM read_parquet('wellcome.parquet')
```

Each keeps its own column names. Then give each group its label, institution and license in `collection.json`, as in [Several institutions in one site](../collection-format/#several-institutions-in-one-site).

## A pipeline of its own: Smithsonian EDAN

A source with more structure than a table can carry is read by a pipeline of its own, which hands DCE a manifest and its own vectors. A search of the Smithsonian's Open Access images is built this way, from the EDAN records and images of 19 units:

- **files**: each image, its museum as its group, its record, and the thumbnails the pipeline made;
- **records**: each record's title and its permanent link;
- **fields**: EDAN's `freetext` fields, under EDAN's own labels and in its order;
- **facets**: EDAN's `indexedStructured` dates, names, places, subjects, kinds of object and cultures;
- **text**: the words each searched field matches, such as names from both `indexedStructured` and `freetext`, and the record id among the catalog numbers;
- **related sources**: the photos of Flickr Commons matched to each record, with their tags and counts;
- **vectors**: from SigLIP 2 and CLIP, one shard per museum.

```bash
python -m src.collection build manifest/ --vectors manifest/vectors \
  --data-dir si-oa/ --check-files
```

The manifest is a folder of parquet tables:

| Table | Columns | Notes |
| --- | --- | --- |
| `files.parquet` | `id`, `group`, `object_id`, `file_name`, `width`, `height`, `thumbnail`, `processed`, `original`, `iiif`, `page`, `view_orbit`, then any catalog columns | required; `id` is the image id the vectors carry, and a file without `group` is in the group of its vector shard |
| `records.parquet` | `object_id`, `title`, `source_url`, `model_url`, `document`, `pages`, then the catalog | without it, the catalog columns of `files.parquet` are read |
| `fields.parquet` | `object_id`, `position`, `field`, `label`, `value` | the page's fields and their order |
| `facets.parquet` | `object_id`, `facet`, `value` | the filters |
| `text.parquet` | `object_id`, `field`, `value` | what search matches in `title`, `names`, `dates`, `places`, `topics`, `object_types`, `notes`, `physical` or `identifiers` |
| `related_sources.parquet`, `related_tags.parquet` | as in the [collection format](../collection-format/#related-sources), with `object_id` for `record_id` | |
| `groups.parquet` | `group`, `label` | the groups, in the order the filter lists them |
| `source.json` | anything | kept as `source` in `index_info.json` |

A table given replaces what would otherwise be read from the catalog columns, for every record. The vectors folder holds `models.json`, `{"default_model": "siglip2", "models": [{"key", "type", "name", "revision", "dimensions"}]}`, and `<key>/<group>.npy` with `<key>/<group>.ids.npy` for each model. Paths are relative to the collection folder, where the pipeline puts the files; `--check-files` refuses a manifest that names one that is not there. Records whose object has no file are left out, and the command says how many.
