---
title: Collections split into groups
description: Serve a collection split into groups, such as the museums of one institution, with records, filters and related sources.
---

A collection built by your own pipeline can be split into groups, such as the museums of one institution, with a vector shard for each group. The site serves it from this layout and lets every search name the groups it covers:

```
my-collection/
  collection.json        "group_label" names a group to visitors, e.g. "Museum"
  embeddings/
    index_info.json      {"format": 2, "models": [...], "groups": [{"id": "nmah", "label": "..."}]}
    vectors/<model key>/<group id>.npy       float32, one L2-normalized row per image
    vectors/<model key>/<group id>.ids.npy   the id of the image in each row
    metadata.sqlite      items(id, group_id, record_id, file_name, width, height,
                               thumbnail, processed, original)
                         records(record_id, title, source_url)
                         optional: record_fields(record_id, position, label, value)
                                   record_facets(record_id, facet, value)
                                   related_sources(record_id, source_id, source, link_type,
                                                   image_id, url, title, thumbnail, rights,
                                                   rights_url, counts)
                                   related_tags(source_id, position, tag)
                                   items.view_orbit, records.model_url  for 3D models
  thumbnails/  processed/   the image files that items point to, relative to my-collection
  related/                  thumbnails of related photos, relative to my-collection
```

## Models

Each entry in `models` has a `key` (its folder under `vectors/`), a `type` (`clip`, `siglip` or `siglip2`), a `name`, a `revision` and its `dimensions`. The site searches with the model named by `default_model`, loading the recorded revision, so queries and stored vectors come from the same weights. Set `DCE_MODEL` to the key or name of another of its models to search with that one. The site refuses to start if the index holds no vectors from the model it would use.

Images of the same record are shown as one object, and the record's `source_url` is the link back. `original` may be a web address, in which case `/static/<id>` sends the visitor there.

## Searching some groups

Searches, samples and similar images take `groups=nmah,saam`; leave it out to cover every group. Images in the chosen groups are ranked together exactly as one index would rank them. `/api/collection` lists the groups with their numbers of images and objects. The site shows each image's group and offers a filter that keeps the chosen groups in the address, so a filtered search can be shared.

## Records

When `record_fields` is present, an item page lists its record's fields in their `position` order, with repeated labels grouped together, and `/api/items/<id>` returns them with the record's facets under `record`.

When `record_facets` is present, searches, samples and similar images can also keep only objects whose record holds some values: `object_type`, `place`, `culture`, `topic` and `name`, each repeated to accept any of several (`place=Ohio&place=England`), and `year_from` and `year_to`, read against the `date` facet. Case does not matter, every category asked for must match, and images without a record are left out.

Dates count as the catalog files them: a decade such as `1860s`, a span such as `1914-1918`, or a year; `1000s` to `1400s` are centuries. An object a catalog dates only by century but files under one decade, as the Smithsonian files both the 18th and the 19th century under `1800s`, counts as that decade.

Unlike a field term in the query, such as `date:1860s`, which leaves only the keyword channel, these filters hold for both channels, so they also narrow a search by appearance. `/api/categories/<category>` lists the values of one category, `date` included, the most common first with how many records hold each, and `contains=` narrows the list. `/api/collection` says whether the filters are available as `catalog_filters`.

## Related sources

When `related_sources` is present, an item page also notes where else its record appears, such as the same object on Flickr Commons: one line per photo, those showing one of the record's images first, its title linking to it, followed by its faves and comments from the `counts` JSON. `/api/items/<id>` returns them under `record.related`, together with what the page leaves out: the photo's thumbnail, served from `/images/related/<source_id>`, its galleries, its tags from `related_tags` in `position` order, and its rights. Name each source for visitors in `collection.json`, for example `"sources": {"flickr": {"label": "Flickr Commons"}}`: the lines are headed "Also on Flickr Commons".

## 3D models

A record's `model_url` names its 3D model, a `.glb` file relative to the collection folder or a web address. Images rendered from the model carry the camera position in `items.view_orbit`; they are searched with the photographs but stand for the object only when it has no photograph. A shape index in `embeddings/shape/` lists objects of a similar shape. See [Kinds of material](../kinds-of-material/).
