---
title: Searching by appearance and by catalog
description: How text search fuses search by appearance with BM25 over the catalog, how Auto reads a query, and what each result explains.
---

Every collection can be searched by appearance: a multimodal model compares the visitor's words, or picture, with every image. When the catalog holds text, text search also reads the records: it runs two channels and fuses them, which is hybrid search.

Indexing builds the catalog's full-text index in `metadata.sqlite` from the [catalog columns](../mapping-your-data/#how-columns-are-read) of a manifest, and leaves it out when no column holds text other than catalog numbers. A pipeline of its own can give the words of each field itself, in the `text` table of its [manifest](../mapping-your-data/#a-pipeline-of-its-own-smithsonian-edan).

The index is two tables. `records_fts` is an FTS5 table with one row per object: `record_id` and the text columns `title`, `names`, `dates`, `places`, `topics`, `object_types`, `notes`, `physical`, and `identifiers`. `entity_vocab(term, field, record_count)` holds the names, places, subjects, and kinds of object that Auto recognizes, with `field` set to `name`, `place`, `topic`, or `object_type`.

- **Visual:** the model compares the query with every image.
- **Keyword:** SQLite full-text search ranked by BM25, with titles, names and catalog numbers weighing most. Every meaningful word must match, small words such as "a" or "of" are not required, and a word also matches its plural or singular when the catalog uses that form. Case and accents do not matter.
- **Fusion:** reciprocal rank fusion over at least the first 1,000 objects of each channel, with a weight for each channel and a constant of 60. Each object is shown once.

Text search is `GET /api/search/text`, and search by image, `POST /api/search/image`, uses the visual channel alone. `/docs` on a running site lists their parameters.

## How Auto reads a query

With `mode=auto`, the default, the site reads the query first and weighs the channels:

| Query | Read as | Weights (visual, keyword) |
|---|---|---|
| `"exact phrase"`, with straight or curly quotation marks | phrase | 0, 1 |
| `name:Muybridge` or `place:"New York"`, also `title:`, `topic:`, `type:`, `date:`, `id:` | one field | 0, 1 |
| `NPG.87.109`, in a pattern the catalog numbers of ten or more records follow | catalog number | 0, 1 |
| `1885`, `1880s`; a year also finds its decade | date | 0.3, 1 |
| a name from the catalog, such as `mathew brady` | name | 0.3, 1 |
| a place, subject or kind of object from the catalog | place, subject, kind of object | 1, 1 |
| a catalog term inside a longer query, such as `portrait of abraham lincoln` | that term | 1, 1 |
| anything else | description | 1, 0.3 |

`mode=visual`, `mode=keyword` and `mode=hybrid` (equal weights) decide for it. A word that no record uses is corrected to a close, common word from the catalog; the response says so, and `correct_spelling=false` searches the words as typed.

## What each result says

Every result carries `provenance`: its rank in each channel, the record fields that matched, and its visual similarity. Its `explanation` says why it is there, such as "Matches the title and name," or "Looks similar" when only its appearance brought it there. The response's `search` tells how the query was read and, when the catalog matched nothing, why: "No records mention both “quilt” and “airplane”; showing visually similar items."

## On the site

After a text search, when the collection has catalog text, a switch under the search bar offers Auto, Appearance (`mode=visual`), and Catalog (`mode=keyword`). When some images have no record, a second switch, "With catalog records only," leaves them out. Above the results appear only a spelling correction, with "Search instead for," how Auto read the query ("Read as a name," or "Mentions a name" when the name is part of a longer query, saying more when pointed at; a plain description gets no remark), and why the catalog found nothing. Pointing at a result shows its title, its group and why it is there. In Catalog mode the group filter shows how many matches each group holds. The choices are kept in the address: `mode=visual`, `exact=1` for a search without spelling correction, and `uncataloged=0`.
