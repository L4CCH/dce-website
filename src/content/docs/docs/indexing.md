---
title: Indexing large or remote collections
description: Profile a collection first, then index it from a folder, an S3 bucket or a parquet manifest, with no metadata needed.
---

A collection can be too large for one disk, live in an S3 bucket, or never have been organized. The tools below handle all three. They need no metadata and never store the original images.

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

The profile also says which [kinds of material](../kinds-of-material/) the collection holds besides images, such as PDFs or 3D models, and which options to set up for them.

## Sources

- **A folder** on this machine, searched through all its subfolders.
- **An S3 prefix.** Add `--anonymous` for a public bucket.
- **A parquet manifest** with one row per image: its address in a column such as `image_url`, or only its IIIF image service in a column such as `iiif`, and any catalog fields beside it. A column such as `thumbnail_url` names a thumbnail the source already makes. Paths in a manifest are read relative to the manifest. `--fetch-via s3://bucket` reads the images from a bucket instead of their web addresses.

## What the site keeps of each image

Indexing reads every image once, for the model, and never stores the original. What it keeps for visitors to see is chosen with `--images`:

| `--images` | The site keeps | Browsers load |
| --- | --- | --- |
| `copy` (default) | a thumbnail and a copy up to 1,920 pixels | everything from the site, except deep zoom from an IIIF server |
| `thumbnails` | a thumbnail | thumbnails from the site; larger views and deep zoom from the source |
| `link` | nothing, unless the source has neither an IIIF service nor its own thumbnails, which keeps a thumbnail | everything else from the source |

`thumbnails` and `link` apply to rows whose source can show the image: an IIIF image service, which is asked for each size, or web addresses of images browsers can show, such as JPEG and PNG, and of thumbnails. Every other image is copied whatever the setting. The deploy scripts index with `copy`; for another setting, index on your own machine and start the site from that folder with `--from`. An image with an IIIF service is asked for at the size indexing needs instead of being downloaded whole, which is much faster for large scans.

Linking needs little disk, but the site then depends on the source: it must stay up and fast, keep its addresses, and let other sites show its images. An IIIF server that makes each size on request can take half a second the first time an image is shown. `thumbnails` keeps the search page quick for a few tens of kilobytes an image.

## Stopping and resuming

Indexing records each image as it finishes, so it can be stopped at any time and run again with the same `--data-dir`. `--retry-failed` tries the images that failed once more, `--status` shows how far it has come, and `--report` prints how long the run took, how fast it went and the files that failed, also for a run that finished long ago.

## With an AI coding agent

With an agent that supports [Agent Skills](https://agentskills.io), such as Claude Code, Codex, Gemini CLI or Cursor, the `dce-setup` skill walks through these steps and asks only what a person must decide. Agents started in the repository find it on their own: Claude Code in `.claude/skills/`, the others in `.agents/skills/`. Ask it to make your collection searchable.

## With Docker

Building the index is a one-off job. Serving searches is a long-running service that needs no GPU. The image does both, so they can run on different machines.

```bash
docker run --rm -v "$PWD/my-collection:/data" -v /path/to/images:/source:ro ghcr.io/l4cch/digital-collections-explorer ingest /source
docker run -p 8000:8000 -v "$PWD/my-collection:/data" ghcr.io/l4cch/digital-collections-explorer
```

The same two steps with Docker Compose:

```bash
SOURCE_DIR=/path/to/images COLLECTION=my-collection docker compose run --rm ingest
COLLECTION=my-collection docker compose up serve
```

The published image runs on x86-64 and ARM machines and shows every kind of material. Build options for an image of your own:

- `--build-arg MEDIA=pdf,zoom` builds the interface with only the [kinds of material](../kinds-of-material/) you list.
- `--build-arg TORCH_VARIANT=cu124` installs the CUDA build of PyTorch, for indexing on a GPU. The default is the much smaller CPU build, which is all that serving needs.
- `--build-arg PRELOAD_MODEL=false` leaves the model out of the image. It is then downloaded each time a container starts.
