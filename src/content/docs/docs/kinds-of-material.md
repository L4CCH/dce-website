---
title: Kinds of material
description: Images are always shown; 3D models, PDFs and deep zoom are options, and only what a collection holds is installed.
---

Every site shows photographs, scans and other images. Three other kinds of material are options, chosen when the site is set up, so that a collection installs only the packages it needs:

```bash
npm run setup                      # asks what the collection holds besides images
npm run setup -- --with=pdf,3d     # or says so
npm run setup -- --with=none       # images only
```

Options combine: list as many as the collection holds, separated by commas. Setup writes the choice to `config.json` as `"media"`, installs the packages of the options chosen, builds the interface and prints the Python packages to install. Run it again to change the choice.

| Option | For | Python packages |
| --- | --- | --- |
| `3d` | 3D models as `.glb` files | `pip install -r requirements-3d.txt` and `python -m playwright install chromium` |
| `pdf` | Born-digital and scanned PDFs | `pip install -r requirements-pdf.txt` |
| `zoom` | Maps and other large images served by IIIF image servers | none |

## 3D models

Models are drawn before indexing. `python -m src.render3d render` takes a folder of `.glb` files, or a manifest with a `model_url` column, and draws views of each model from several sides. It writes a manifest of those views, which `python -m src.ingest` then indexes with the photographs:

```bash
python -m src.render3d render /path/to/models --data-dir data/collections/my-collection
python -m src.ingest data/collections/my-collection/models3d/views.parquet --data-dir data/collections/my-collection
```

Rendering can be stopped and run again, and it ends by printing the command that indexes the views.

The views become images of their object, so a model is found by what it looks like, and the object's page opens the model, which visitors can turn and zoom. A shape index of the views also lists other objects of a similar shape. The viewer is loaded only on the page of an object that has a model.

A model kept on the site must be a `.glb` file. A `.gltf` file refers to other files, so it can be served only from a web address.

## PDFs

`python -m src.ingest` reads the PDFs in a folder, bucket or manifest page by page. Each page is searched by what it looks like, without OCR, so handwriting, diagrams and forms are found too. The pages of one PDF are shown as one object, and its page opens the whole document in the browser.

An install without the PDF reader indexes the images and leaves the PDFs out, saying how many and what to install.

## Deep zoom

An image whose catalog record names an IIIF image service, in a column such as `iiif`, `iiif_url` or `iiif_service`, opens in a deep zoom viewer that loads only the part of the image in view. The column may hold the service's address, its `info.json` or any image request to it. If the server does not answer, the plain image is shown instead.

Images kept on an IIIF server need not be copied to the site at all. Visitors' browsers load them straight from the server, and an index that names only the service lets the site ask it for each size. [What the site keeps of each image](../indexing/#what-the-site-keeps-of-each-image) is chosen when indexing.

## In a container

The published image, `ghcr.io/l4cch/digital-collections-explorer`, shows every kind of material, since it cannot know what a collection holds; the code of each viewer loads only on a page that needs it. An image of your own built with `docker build --build-arg MEDIA=pdf .` holds only what you list.

## Collections set up before version 2

`config.json` files from version 1 name a `collection_type` instead. Setup reads it as `photographs` for images only, `maps` for `zoom` and `documents` for `pdf`, and writes the new setting.
