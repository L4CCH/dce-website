---
title: Making a frontend
description: Replace the default interface with one of your own, kept in its own repository and built against the same backend.
---

Every site comes with one frontend, in `src/frontend/default`, that shows images and, as options, [3D models, PDFs and deep zoom](../kinds-of-material/). It is a small React app that you can restyle. A frontend that looks or works differently can take its place, and is best kept in a repository of its own, so that others can start from it.

## What a frontend needs

1. Build with `npm install && npm run build` into a `dist/` folder holding an `index.html`.
2. Refer to its files and to the backend by paths relative to the page, as Vite does for files with `base: './'`, so that the site also works [under a path](../deploy/under-a-path/) of another website.
3. Talk to the backend only through its HTTP API, listed at `/docs` on a running site: `/api/...`, `/images/{id}?size=thumbnail` or `full`, `/models/{id}` for 3D models and `/documents/{id}` for PDFs.
4. Keep its routes in the part of the address after `#`, and open an object at `#/item/<id>`, the link the [MCP server](../mcp-server/) hands out. The backend serves `index.html` only at the root of the site.
5. When a search is refused, show the response's `detail`, which is written for the visitor.

The backend serves `dist/` at the root of the site and fills the title, description and sharing tags of `index.html` from `collection.json`. Write the description as `<meta name="description" content="…">`, with `name` first, so that it is replaced rather than repeated. A frontend may also write `dist/frontend.json`, as `{"media": ["3d"]}`, to say which kinds of material it shows; `python -m src.environment` reports it.

For `npm run dev`, proxy `/api`, `/images`, `/models`, `/documents` and `/static` to the backend on port 8000, as the default frontend's `vite.config.js` does.

## Using one

Clone it into `src/frontend/<name>` and run setup with its name, or give `--frontend` the path to a folder elsewhere, then restart the backend:

```bash
git clone https://github.com/example/my-frontend src/frontend/my-frontend
npm run setup -- --frontend=my-frontend
```

The published container image, and so `bootstrap.sh` and the AWS scripts, serve the default frontend. A frontend of your own runs when the backend runs from a clone.

A frontend others could start from can be announced in [Discussions](https://github.com/L4CCH/digital-collections-explorer/discussions).
