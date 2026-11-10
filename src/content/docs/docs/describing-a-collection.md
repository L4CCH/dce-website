---
title: Describing a collection to visitors
description: Give a site its title, introduction, suggested searches, license and links with collection.json, and link every image back to its record.
---

A site opens on a wall of images to wander through, suggests searches, shows each object once however many photographs it has, and gives every image its own page with similar images and a link back to the institution's own record.

Put a `collection.json` next to the index, in the folder passed to `--data-dir`, to set the title, the introduction, the suggested searches, the license and the footer links. [`collection.example.json`](https://github.com/L4CCH/digital-collections-explorer/blob/main/collection.example.json) shows every field, and all of them are optional.

- A suggested search is either the query itself or `{"query": "...", "label": "..."}`, whose label is shown beside it, for example to say how Auto reads it.
- `object_label` names what one object is, such as `map sheet`, in the count under the title. The count leaves out the number of images when each object has one, and the source when the title already names it.
- The site reads the file on every visit, so a change shows up without a restart.
- The same file fills the page title and description that search engines show, and the site's `llms.txt`.

For a deployed site, pass the file when installing with `--collection-file`, or change it later while the site keeps running:

```bash
sudo deploy/bootstrap.sh describe --name my-collection --collection-file collection.json
deploy/aws/describe.sh my-collection --file collection.json
```

## Objects and links back

The link back to the original record is taken from the catalog: a column named `source_url`, `guid`, `record_url`, `landing_page` or `permalink` that holds a web address. Images are grouped into objects by a column named `object_id`, `record_id`, `item_id` or `group_id`.

Collections without a catalog still work. Every image is then its own object, shown as having no catalog record, and is found by what it shows.

## Catalog columns that search reads

Where a manifest's columns hold text, [search](../search/) reads it as well as the pictures. Columns are read by name:

| Read as | Columns |
| --- | --- |
| Title | `title`, `label` |
| Names | `creator`, `author`, `artist`, `maker`, `photographer`, `contributor`, `publisher`, `people`, `sitter` |
| Dates | `date`, `year`, `date_created`, `created`, `period` |
| Places | `place`, `location`, `geography`, `spatial`, `coverage`, `country`, `region`, `state`, `county`, `city` |
| Subjects | `subject`, `topic`, `keywords`, `tags`, `theme` |
| Kinds of object | `object_type`, `genre`, `classification`, `kind`, `work_type` |
| Materials | `medium`, `material`, `technique`, `dimensions`, `extent` |
| Notes | `description`, `notes`, `summary`, `abstract`, `caption`, `inscription`, `transcription`, and any other column of text |
| Catalog numbers | `identifier`, `accession_number`, `object_number`, `call_number`, `catalog_number`, `inventory_number` |

Plural forms of these names are read too. Several values in one cell may be separated by `;` or `|`. Web addresses, file names and columns of numbers are left out. Names, places, subjects and kinds of object also teach Auto search which words in a query to look up in the catalog.
