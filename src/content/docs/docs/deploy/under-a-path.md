---
title: Under a path on an existing website
description: Serve a Digital Collections Explorer site at a path such as /maps/ behind an institution's own web server.
sidebar:
  order: 1
---

A site does not need a domain of its own. It can live at a path such as `https://library.example.org/maps/`, with the institution's web server passing that path to it.

## Tell the site its path

Set `DCE_BASE_PATH` when running the backend directly, `--base-path` with the bootstrap script or `deploy/aws/deploy.sh`, or `BASE_PATH` with Docker Compose. The proxy may strip the path or leave it in place: the backend answers both, the API docs at `/maps/docs` know where they live, and `robots.txt` and `llms.txt` point to the right places.

```bash
DCE_BASE_PATH=/maps DCE_DATA_DIR=data/collections/maps python -m src.backend.main
```

```bash
sudo deploy/bootstrap.sh install --name maps --source /path/to/images --base-path /maps
```

```bash
BASE_PATH=/maps COLLECTION=maps docker compose up serve
```

The default frontend is built with relative asset paths, so one build serves at `/` or under any path. A request for the bare path, `/maps`, is redirected to `/maps/`, since the relative assets need the trailing slash.

## The proxy

The matching nginx location, with the site on port 8000:

```nginx
location /maps/ {
    proxy_pass http://127.0.0.1:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 11m;
}
```

`client_max_body_size`, a little above the site's upload limit, lets image searches through. Keep the visitor's host name, as `proxy_set_header Host $host` does above, or set `DCE_PUBLIC_URL` to the full address including the path, such as `https://library.example.org/maps`, so that the links the MCP server hands out lead back through the proxy. Set the site's `proxy_hops` to the number of proxies in front of it that add the visitor's address to `X-Forwarded-For`, so that each visitor is limited separately:

```bash
DCE_DATA_DIR=data/collections/maps python -m src.backend.core.site_settings proxy_hops=1
sudo deploy/bootstrap.sh configure --name maps --set proxy_hops=1
```

With `proxy_hops` above 0, let only the proxy reach the site's port. It is open on every interface by default, and a visitor who connects to it directly could pose as another.

## robots.txt at the root of the domain

Crawlers read only the `robots.txt` at the root of the domain, so the line that keeps them off the search endpoints has to go there. The site's own `/maps/robots.txt` shows what to add; copy its `Disallow` line into the domain's `robots.txt`.

```
User-agent: *
Disallow: /maps/api/search/
```
