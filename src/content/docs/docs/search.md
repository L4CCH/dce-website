---
title: Searching by appearance and by catalog
description: How text search fuses search by appearance with BM25 over the catalog, how Auto reads a query, and what each result explains.
---

Every collection can be searched by appearance: a multimodal model compares the visitor's words, or picture, with every image. When a [collection split into groups](../groups/) also holds catalog records in a full-text index, text search runs two channels and fuses them.

The `metadata.sqlite` of such a collection holds `records_fts`, an FTS5 table with one row per record (`record_id` and text columns such as `title`, `names`, `dates`, `places`, `topics`, `object_types`, `notes`, `physical` and `identifiers`), and `entity_vocab(term, field, record_count)`, the collection's names, places, topics and object types.

- **Visual:** the model compares the query with every image.
- **Keyword:** SQLite full-text search ranked by BM25, with titles, names and catalog numbers weighing most. Every meaningful word must match, small words such as "a" or "of" are not required, and a word also matches its plural or singular when the catalog uses that form.
- **Fusion:** reciprocal rank fusion, with a weight for each channel and a tunable constant (60 by default). Each object is shown once.

## How Auto reads a query

With `mode=auto`, the default, the site reads the query first and weighs the channels:

| Query | Read as | Visual, keyword |
|---|---|---|
| `"exact phrase"`, with straight or curly quotation marks | phrase | 0, 1 |
| `name:Muybridge`, also `title:`, `place:`, `topic:`, `type:`, `date:`, `id:` | one field | 0, 1 |
| `NPG.87.109`, in a pattern the collection's own catalog numbers follow | catalog number | 0, 1 |
| `1885`, `1880s` | date | 0.3, 1 |
| a name from the catalog, such as `mathew brady` | name | 0.3, 1 |
| a place, subject or kind of object from the catalog | place, topic, object type | 1, 1 |
| a catalog term inside a longer query, such as `portrait of abraham lincoln` | that term | 1, 1 |
| anything else | description | 1, 0.3 |

`mode=visual`, `mode=keyword` and `mode=hybrid` (equal weights) decide for it. A word that no record uses is corrected to a close, common word from the catalog; the response says so, and `correct_spelling=false` searches the words as typed.

## What each result says

Every result carries its rank in each channel, the record fields that matched and an explanation such as "Matches the title and name", or "Looks similar" when only its appearance brought it there. The response's `search` tells how the query was read and, when the catalog matched nothing, why: "No records mention both “quilt” and “airplane”; showing visually similar items".

## On the site

The site keeps this out of the way of the pictures. A switch under the search bar offers Auto, Appearance and Catalog, so searching otherwise is one click, and "With catalog records only" leaves out images that have no record. Above the results appear only a spelling correction, with "Search instead for", how Auto read the query ("Read as a name", saying more when pointed at; a plain description gets no remark), and why the catalog found nothing. Pointing at a result shows its title, its group and why it is there. In Catalog mode the group filter shows how many matches each group holds. The choices are kept in the address (`mode=visual`, `exact=1`).
