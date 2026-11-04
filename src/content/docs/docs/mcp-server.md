---
title: MCP server
description: Let AI assistants such as Claude and ChatGPT search a Digital Collections Explorer site through the Model Context Protocol.
---

Every site can also answer the [Model Context Protocol](https://modelcontextprotocol.io) at `/mcp`, so an AI assistant such as Claude, ChatGPT or an editor's agent can search the collection itself. The endpoint is stateless, needs no account and only reads.

## Turn it on

Set `DCE_MCP=1`. Links the server hands out are built from the address the assistant used; behind a proxy or CDN that rewrites it, also set `DCE_PUBLIC_URL` to the address visitors use, with the path if the site lives under one.

```bash
DCE_MCP=1 DCE_DATA_DIR=data/collections/my-collection python -m src.backend.main
```

The deploy scripts set both for you. On any Linux machine, add `--mcp` and `--public-url` to `deploy/bootstrap.sh install`, or later run `sudo deploy/bootstrap.sh mcp --name my-collection --on`. On AWS, add `--mcp` to `deploy/aws/deploy.sh`, or later run `deploy/aws/mcp.sh my-collection --on`. With Docker Compose, set `MCP=1` and `PUBLIC_URL`. Turning it on or off restarts the site, which takes about a minute.

## Connect an assistant

```bash
claude mcp add --transport http my-collection https://collection.example.org/mcp
```

In Claude or ChatGPT, add a custom connector with the same address. Assistants that call the endpoint from the cloud need a public `https://` address; on AWS, deploy with `--https`.

## Tools

| Tool | What it does |
| --- | --- |
| `describe_collection` | The collection's title, groups and their sizes, license, and suggested searches |
| `search_collection` | The site's search, in Auto, Appearance or Catalog mode, for some groups or catalog values; up to 20 objects, each with why it was found |
| `find_similar` | Objects whose images look most like one object |
| `search_by_image` | Objects that look like a collection image, a crop of one, or an image the assistant sends |
| `list_catalog_values` | The values the catalog uses for kinds of object, places, cultures, topics, names and dates |
| `get_object` | One object's record, its images, the link to the institution's record, and where else it appears |

The three search tools take `catalog`, which keeps only objects whose record holds the given values: a year range, kinds of object, places, cultures, topics or names, spelled as `list_catalog_values` gives them. A term such as `date:1860s` or `place:china` in the query instead searches the catalog text alone. Both need a collection whose catalog has been prepared with these categories.

## What assistants see

Every result links to its page on the site and to its image, and says why it was found, how alike it is to the query, and which catalog fields matched. Hosts that support [MCP Apps](https://modelcontextprotocol.io/seps/1865-mcp-apps-interactive-user-interfaces-for-mcp) show the results as an image wall: each picture beside its own title, opening the object's page when clicked, with "More like this" to follow similar images. The wall loads pictures only from `DCE_PUBLIC_URL`, so set it for the pictures to appear.

## Limits

Searches count against the same limits as visitors' searches, and an image sent as base64 against the upload limit. The endpoint never fetches a web address it is given. Text from catalog records reaches the assistant as data, not as instructions.
