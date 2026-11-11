---
title: On a Linux server
description: Turn a Linux machine into a collection site with one command, and keep it running across reboots.
sidebar:
  order: -1
---

`deploy/bootstrap.sh` turns a Linux machine into a collection site with one command. It works the same on a cloud VM, a server in your own machine room or a laptop. It installs Docker if needed, builds the index once, then serves the site and, with systemd, keeps it running across reboots. On a machine without systemd it runs in the background until the next reboot.

```bash
sudo deploy/bootstrap.sh install --name my-collection --source /path/to/images
sudo deploy/bootstrap.sh status --name my-collection
sudo deploy/bootstrap.sh uninstall --name my-collection   # add --keep-data to keep the index
```

The site opens on port 8000 once indexing has finished; `--port` chooses another. Its data lives in `/opt/dce/collections/my-collection`; `--data-root` chooses another place than `/opt/dce`. Indexing can be interrupted. It continues where it left off the next time the machine starts.

`--source` also takes `s3://bucket/prefix`, with `--anonymous` for a public bucket, or a `.parquet` manifest. `--limit N` indexes only the first N images.

## Describing the collection

Add `--collection-file collection.json` to `install` to give the site its title, introduction and suggested searches from the start. To change them later, while the site keeps running:

```bash
sudo deploy/bootstrap.sh describe --name my-collection --collection-file collection.json
```

See [Describing a collection to visitors](../../describing-a-collection/) for what the file holds.

## A collection prepared elsewhere

A collection indexed on another machine, or written by [a pipeline of its own](../../mapping-your-data/#a-pipeline-of-its-own-smithsonian-edan), needs no indexing here. `--from` starts a site from a folder or an `s3://` address, and `import` with the same options replaces the data of a site that is running. The site keeps serving its current data until the copy is complete, then restarts on the new data. It keeps its limits but takes its description from the imported folder. The old data stays in `/opt/dce/collections/.my-collection.previous-<date>` until you delete it.

```bash
sudo deploy/bootstrap.sh install --name my-collection --from /path/to/my-collection
sudo deploy/bootstrap.sh import --name my-collection --from /path/to/my-collection
```

## Other settings

- `--image` runs another version of the container image, and `update --image` switches a running site to it without indexing again. `--image-tar` loads the image from a file instead of downloading it.
- `--mcp` turns on the [MCP server](../../mcp-server/), with `--public-url` for the address visitors use; `mcp --on` or `--off` changes it later.
- `--base-path /maps` serves the site [under a path](../under-a-path/) of an existing website.
- `configure --set` changes the [limits](../../limits/) of a running site.
