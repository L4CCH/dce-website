---
title: Indexing large or remote collections
description: Profile a collection first, then index it from a folder, an S3 bucket or a parquet manifest, with or without a catalog.
---

A collection can be too large for one disk, live in an S3 bucket, or never have been organized. Profiling and indexing read a catalog when there is one, work without one, and never store the original images.

```bash
# 1. See what the collection holds, what is possible and what indexing will cost
python -m src.profiling /path/to/images
python -m src.profiling s3://bucket/prefix --anonymous
python -m src.profiling manifest.parquet --fetch-via s3://bucket

# 2. Build the index. Safe to stop and run again; it continues where it left off.
python -m src.ingest /path/to/images --data-dir data/collections/my-collection

# 3. Serve that collection
DCE_DATA_DIR=data/collections/my-collection python -m src.backend.main
```

These commands run in a clone set up as in [Getting started](../#getting-started). The site then opens at http://localhost:8000; `DCE_PORT` chooses another port.

The profile also says which [kinds of material](../kinds-of-material/) the collection holds besides images, such as PDFs or 3D models, and which options to set up for them.

## Sources

- **A folder** on this machine, searched through all its subfolders except hidden ones.
- **An S3 prefix.** Add `--anonymous` for a public bucket.
- **A parquet manifest**, on this machine or at an `s3://` or `https://` address, with one row per file: its address in a column such as `image_url`, or only its IIIF image service in a column such as `iiif`, the object it shows in `object_id`, its group in `group`, and the catalog beside them. [Mapping your data](../mapping-your-data/) lists the columns and how each is read. Paths in a manifest on this machine are read relative to it. `--fetch-via s3://bucket` reads the files from a bucket instead of their web addresses, each under the same path as its web address.

## What the site keeps of each image

Indexing reads every image once, for the model, and never stores the original. What it keeps for visitors to see is chosen with `--images`:

| `--images` | The site keeps | Browsers load |
| --- | --- | --- |
| `copy` (default) | a thumbnail of up to 400 pixels and a copy of up to 1,920 pixels | everything from the site, except deep zoom from an IIIF server |
| `thumbnails` | a thumbnail | thumbnails from the site; larger views and deep zoom from the source |
| `link` | nothing, unless the source has neither an IIIF service nor its own thumbnails, which keeps a thumbnail | everything else from the source |

`thumbnails` and `link` apply only where the source can show the image itself: through an IIIF image service, which is asked for each size, or at the web address of a JPEG, PNG, GIF, WebP, or AVIF file, unless the files are read through `--fetch-via`. `link` also uses a thumbnail address in a `thumbnail_url`, `thumbnail`, `preview_url`, or `preview` column. Every other image is copied whatever the setting, including images from a folder or a bucket and the pages of PDFs. The deploy scripts index with `copy`; for another setting, index on your own machine and start the site from that folder with `--from`, on AWS after copying it to a bucket. An image with an IIIF service is asked for at the size indexing needs instead of being downloaded whole, which is much faster for large scans.

Linking needs little disk, but the site then depends on the source: it must stay up and fast, keep its addresses, and let other sites show its images. An IIIF server that makes each size on request can take half a second the first time an image is shown. `thumbnails` keeps the search page quick for a few tens of kilobytes an image.

## What indexing writes

Indexing writes the collection in the [collection format](../collection-format/). Where the manifest has a catalog, each object's page shows its fields, and search reads the records as well as the pictures. Searches through the [API](../collection-format/#records-filters-and-dates) and the [MCP server](../mcp-server/) can also be narrowed by date, place, kind of object, culture, subject, and name. A `group` column adds the filter by group that visitors see. The report printed at the end says how many records search covers and which filters there are.

A collection that `python -m src.ingest` indexed with v2.0.0-beta.2 or earlier is written in the new format by running the same command again. Every file is already indexed, so nothing is embedded twice. One built another way, as by version 1, is served with v2.0.0-beta.2 or indexed again into a new folder.

## Stopping and resuming

Indexing records each image as it finishes, so it can be stopped at any time and run again with the same `--data-dir`. `--retry-failed` tries the files that failed or were skipped once more, `--status` prints how far it has come as JSON, and `--report` prints how long the run took, how fast it went, and the files that failed, also for a run that finished long ago. Files over 200 MB are skipped without being downloaded, unless `--max-file-mb` allows more. `python -m src.ingest --help` lists the other options, such as `--limit` and `--device`.

## With an AI coding agent

With an agent that supports [Agent Skills](https://agentskills.io), such as Claude Code, Codex, Gemini CLI or Cursor, the `dce-setup` skill walks through these steps and asks only what a person must decide. Agents started in the repository find it on their own: Claude Code in `.claude/skills/`, the others in `.agents/skills/`. Ask it to make your collection searchable.

## With Docker

Building the index is a one-off job. Serving searches is a long-running service that needs no GPU. The image does both, so they can run on different machines.

```bash
docker run --rm -v "$PWD/my-collection:/data" -v /path/to/images:/source:ro ghcr.io/l4cch/digital-collections-explorer ingest /source
docker run -p 8000:8000 -v "$PWD/my-collection:/data" ghcr.io/l4cch/digital-collections-explorer
```

`profile /source` in place of `ingest /source` profiles the collection first. The container runs as user id 1000, so on Linux, create the collection folder first and give it to that user: `mkdir my-collection && sudo chown 1000:1000 my-collection`.

The same two steps with Docker Compose, which builds the image from the repository and keeps the collection in `data/collections/my-collection`:

```bash
SOURCE_DIR=/path/to/images COLLECTION=my-collection docker compose run --rm ingest
COLLECTION=my-collection docker compose up serve
```

The published image runs on x86-64 and ARM machines and shows every kind of material. Build options for an image of your own:

- `--build-arg MEDIA=pdf,zoom` builds the interface with only the [kinds of material](../kinds-of-material/) you list. Without it, an image of your own, such as the one Docker Compose builds, shows images only and cannot read PDFs.
- `--build-arg TORCH_VARIANT=cu124` installs the CUDA build of PyTorch, for indexing on a GPU; run that image with `docker run --gpus all`. The default is the much smaller CPU build, which is all that serving needs.
- `--build-arg PRELOAD_MODEL=false` leaves the model out of the image. It is then downloaded in every new container, unless `/app/.cache/huggingface` is kept in a volume, as the deploy scripts do.
