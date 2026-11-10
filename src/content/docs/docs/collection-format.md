---
title: Collection format
description: The folder a site serves, index_info.json and every table of metadata.sqlite with what each powers, and sites that hold the collections of several institutions.
---

Every collection a site serves is one folder in the same format, whether `python -m src.ingest` indexed it or your own pipeline prepared it with `python -m src.collection build`. [Mapping your data](../mapping-your-data/) shows how a catalog gets there.

```
my-collection/
  collection.json        title, introduction, suggested searches, links, groups, field labels
  embeddings/
    index_info.json      {"format": 3, "default_model": "...", "models": [...], "groups": [...]}
    vectors/<model key>/<group id>.npy       float32, one L2-normalized row per image
    vectors/<model key>/<group id>.ids.npy   the id of the image in each row
    metadata.sqlite      the images, the records, and what the site shows and searches
    shape/               optional, the shape index of 3D models
  thumbnails/  processed/  models3d/  related/   files the database points to
```

## index_info.json

- `format` is 3. The site also reads format 2, which is format 3 without its optional columns, so collections prepared for earlier versions keep working.
- `models` lists each model the vectors come from: its `key`, the folder under `vectors/`; its `type`, `clip`, `siglip` or `siglip2`; its `name`, `revision` and `dimensions`; and anything else a pipeline records, such as how its images were prepared. The site searches with `default_model`, loading the recorded revision, so queries and stored vectors come from the same weights. Set `DCE_MODEL` to the key or name of another of its models to search with that one. The site refuses to start if the collection holds no vectors from the model it would use.
- `groups` lists each group with its `id`, `label` and number of images. A collection that is not split has one group, and the site then shows no group filter.
- `built_at` and `source` say when and from what it was written.

## metadata.sqlite

| Table | Columns | What it powers |
| --- | --- | --- |
| `items` | `id`, `group_id`, `record_id`, `file_name`, `width`, `height`, `thumbnail`, `processed`, `original` | every image: where its sizes are kept and the object it shows |
| | `iiif`, `page`, `view_orbit` | optional: deep zoom and sizes from an IIIF service, the page of a PDF, the camera of a view drawn from a 3D model |
| `records` | `record_id`, `title`, `source_url` | one row per object: its title and the link back to its record |
| | `model_url`, `document`, `pages` | optional: its 3D model, or the PDF it is and its number of pages |
| `record_fields` | `record_id`, `position`, `field`, `label`, `value` | the catalog fields on the object's page, in order |
| `record_facets` | `record_id`, `facet`, `value` | the filters: `date`, `object_type`, `place`, `culture`, `topic`, `name` |
| `records_fts`, `entity_vocab` | the searched fields of each record; terms with their numbers of records | [search over the catalog](../search/), and the names, places, subjects and kinds of object Auto search recognizes |
| `related_sources`, `related_tags` | see below | where else a record appears, such as on Flickr Commons |

- Images of the same record are shown together as one object, and the record's `source_url` is the link back. An image without a record is its own object, shown as having no catalog record.
- `thumbnail`, `processed` and `original` are paths relative to the collection folder or web addresses. They may be empty when `iiif` names a service that serves every size. When `original` is a web address, `/static/<id>` sends the visitor there.
- Tables without content are left out, and the site then offers less: no fields on the page, no filters, or no search over the catalog.
- The site leaves alone any column or table it does not know, so a pipeline may keep its own beside them.

## Several institutions in one site

A site for several institutions is one collection split into groups, such as museums or libraries: one index, one ranking, and a filter by group. The groups come from a `group` column of the [manifest](../mapping-your-data/), or from a pipeline that hands over its vectors group by group. A group's id is its value in lowercase, with anything but letters and digits turned into hyphens, so `Cleveland Museum of Art` becomes `cleveland-museum-of-art`. Files without a group are in the group `collection`.

`collection.json` can give each group its own name, institution and license, named by its id or by its value, in the order the filter should list them:

```json
{
  "title": "Flowers, Gardens and Seeds",
  "group_label": "Institution",
  "groups": {
    "cma": {
      "label": "Cleveland Museum of Art",
      "institution": "the Cleveland Museum of Art",
      "license": {"name": "CC0 1.0", "url": "https://creativecommons.org/publicdomain/zero/1.0/"}
    },
    "wellcome": {
      "label": "Wellcome Collection",
      "institution": "Wellcome Collection",
      "license": {"name": "Public Domain Mark 1.0", "url": "https://creativecommons.org/publicdomain/mark/1.0/"}
    }
  }
}
```

An object's page links to "the full record at" its group's institution and shows its group's license, or the collection's `institution` and `license` when its group names none. `institution` is the new name of `source_name`, which still works. The MCP server and `llms.txt` name each group's institution and license too.

What institutions share is the format, not their catalogs. Each maps its own columns onto the same searched fields and the same six filters, so one's `creator` and another's `artist` are both names, and the fields on an object's page are each record's own.

## Searching some groups

Searches, samples and similar images take `groups=nmah,saam`; leave it out to cover every group. Images in the chosen groups are ranked together exactly as one index would rank them. `/api/collection` lists the groups with their numbers of images and objects. The site shows each image's group and offers a filter that keeps the chosen groups in the address, so a filtered search can be shared.

## Records, filters and dates

An object's page lists its record's fields in their `position` order, with repeated labels grouped together, under the label `collection.json` gives the field in `field_labels`, if any. `/api/items/<id>` returns them with the record's facets under `record`.

Searches, samples and similar images can keep only objects whose record holds some values: `object_type`, `place`, `culture`, `topic` and `name`, each repeated to accept any of several (`place=Ohio&place=England`), and `year_from` and `year_to`, read against the `date` facet. Case does not matter, every category asked for must match, and images without a record are left out.

Dates count as the catalog files them: a decade such as `1860s`, a span such as `1914-1918`, or a year; `1000s` to `1400s` are centuries. An object a catalog dates only by century but files under one decade, as the Smithsonian files both the 18th and the 19th century under `1800s`, counts as that decade.

Unlike a field term in the query, such as `date:1860s`, which leaves only the catalog channel, these filters hold for both channels, so they also narrow a search by appearance. `/api/categories/<category>` lists the values of one category, `date` included, the most common first with how many records hold each, and `contains=` narrows the list. `/api/collection` says whether the filters are available as `catalog_filters`.

## Related sources

`related_sources` holds, for each record, where else it appears: `record_id`, `source_id`, `source`, `link_type`, `image_id`, `url`, `title`, `thumbnail`, `rights`, `rights_url` and `counts`, a JSON object; `related_tags` holds `source_id`, `position` and `tag`. An item page then notes, for example, the same object on Flickr Commons: one line per photo, those showing one of the record's images first, its title linking to it, followed by its faves and comments from `counts`. `/api/items/<id>` returns them under `record.related`, together with what the page leaves out: the photo's thumbnail, served from `/images/related/<source_id>`, its tags and its rights. Name each source for visitors in `collection.json`, for example `"sources": {"flickr": {"label": "Flickr Commons"}}`: the lines are headed "Also on Flickr Commons".

## 3D models and PDFs

A record's `model_url` names its 3D model, a `.glb` file relative to the collection folder or a web address. Images drawn from the model carry the camera position in `items.view_orbit`; they are searched with the photographs but stand for the object only when it has no photograph. A shape index in `embeddings/shape/` lists objects of a similar shape.

A PDF is one record, its `document` naming the file and `pages` counting them, and each page is an item with its `page`. See [Kinds of material](../kinds-of-material/).

## Collections from earlier versions

A collection indexed by v2.0.0-beta.2 or earlier, in `embeddings.pt`, `item_ids.pt` and `metadata.json`, is not read any more: the site refuses to start and says what to do. Run the same `python -m src.ingest` command again; every file is already indexed, so it only writes the collection anew, from the vectors it kept. A collection in that layout made another way can be served with v2.0.0-beta.2.
