---
title: Making a frontend
description: Replace the default interface with one of your own, kept in its own repository and built against the same backend.
---

Every site comes with one interface, in `src/frontend/default`, that shows images and, as options, [3D models, PDFs and deep zoom](../kinds-of-material/). It is a small React app that you can restyle. An interface that looks or works differently can take its place, and is best kept in a repository of its own, so that others can start from it.

## What a frontend needs

1. Build with `npm install && npm run build` into a `dist/` folder holding an `index.html`.
2. Refer to its files by relative paths, as Vite does with `base: './'`, so that the site also works [under a path](../deploy/under-a-path/) of another website.
3. Talk to the backend only through its HTTP API:
   - `/api/...`, listed at `/docs` on a running site;
   - `/images/{id}?size=thumbnail` or `full`;
   - `/models/{id}` for 3D models;
   - `/documents/{id}` for PDFs.

The backend serves `dist/` at the root of the site and fills the `<title>` and `<meta name="description">` of `index.html` from `collection.json`. A frontend may also write `dist/frontend.json`, as `{"media": ["3d"]}`, to say which kinds of material it shows; `python -m src.environment` reports it.

## Using one

Clone it into `src/frontend/<name>` and run setup with its name, or give `--frontend` the path to a folder elsewhere:

```bash
git clone https://github.com/example/my-frontend src/frontend/my-frontend
npm run setup -- --frontend=my-frontend
```

Made one that others could use? Tell us in [Discussions](https://github.com/L4CCH/digital-collections-explorer/discussions).
