---
title: Under a path on an existing website
description: Serve a Digital Collections Explorer site at a path such as /maps/ behind an institution's own web server.
sidebar:
  order: 1
---

A site does not need a domain of its own. It can live at a path such as
`https://library.example.org/maps/`, with the institution's web server passing that path
to it.

## Tell the site its path

Set `DCE_BASE_PATH` when running the backend directly, `--base-path` with the bootstrap
script, or `BASE_PATH` with Docker Compose. It does not matter whether the proxy strips
the path or leaves it in place: the backend routes requests the same way either way, the
API docs know where they live, and `robots.txt` and `llms.txt` point to the right places.

```bash
DCE_BASE_PATH=/maps DCE_DATA_DIR=data/collections/my-collection python -m src.backend.main
```

```bash
sudo deploy/bootstrap.sh install --name maps --source /path/to/images --base-path /maps
```

```bash
BASE_PATH=/maps COLLECTION=maps docker compose up serve
```

The frontends are built with relative asset paths, so one build serves at `/` or under
any path. A request for the bare path, `/maps`, is redirected to `/maps/`, since the
relative assets need the trailing slash.

## The proxy

The matching nginx location, with the site on port 8000:

```nginx
location /maps/ {
    proxy_pass http://127.0.0.1:8000/;
    proxy_set_header Host $host;
}
```

## robots.txt at the root of the domain

Crawlers read only the `robots.txt` at the root of the domain, so the line that keeps
them off the search endpoints has to go there. The site's own `/maps/robots.txt` shows
what to add; copy its `Disallow` line into the domain's `robots.txt`.

```
User-agent: *
Disallow: /maps/api/search/
```
