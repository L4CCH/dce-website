---
title: Limits that protect a public site
description: Upload, rate and concurrency limits for searches, how to change them, and what visitors are told.
---

Searching is the only expensive thing the site does, so it is the only thing that is limited. Browsing and viewing images are not. The defaults suit a small machine:

| Setting | Default | Meaning |
| --- | --- | --- |
| `max_upload_mb` | 10 | Largest image a visitor may search with |
| `searches_per_minute` | 60 | Searches one visitor may run per minute. 0 turns this off |
| `concurrent_searches` | 2 | Searches that use the model at once. Others wait up to 15 seconds, then are asked to try again |
| `proxy_hops` | 0 | Proxies in front of the site that add the visitor's address to `X-Forwarded-For`. Leave at 0 unless there is one, or visitors could pose as each other |

A visitor who is turned away is told why, in plain words. Searches from AI assistants through the [MCP server](../mcp-server/) count against the same limits.

To change a limit, put it in `settings.json` next to the index, or run one of these. The site picks it up without a restart.

```bash
DCE_DATA_DIR=data/collections/my-collection python -m src.backend.core.site_settings max_upload_mb=20
sudo deploy/bootstrap.sh configure --name my-collection --set max_upload_mb=20
deploy/aws/configure.sh my-collection --set max_upload_mb=20
```
