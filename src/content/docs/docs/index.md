---
title: Documentation
description: Technical documentation for running, deploying and extending Digital Collections Explorer.
---

These pages are for the people who run Digital Collections Explorer: the person at a gallery, library, archive, or museum who sets up a site, and the developer who extends it.

## Getting started

There are three recommended ways to start:

- [With an AI coding agent](indexing/#with-an-ai-coding-agent): ask Claude Code, Codex, Gemini CLI, or Cursor to make your collection searchable.
- [With Docker](indexing/#with-docker): one command builds the index, another serves it.
- [On a Linux server](deploy/server/) or [on AWS](deploy/aws/): one command keeps a site running. On AWS it shows the cost first.

To install it by hand, you need Python 3.10 or later and Node.js 20.19 or later:

```bash
git clone https://github.com/L4CCH/digital-collections-explorer.git
cd digital-collections-explorer
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
npm install && npm run setup

python -m src.ingest /path/to/images --data-dir data/collections/my-collection
DCE_DATA_DIR=data/collections/my-collection python -m src.backend.main
```

Then open http://localhost:8000. `npm run setup` asks what the collection holds besides images; see [Kinds of material](kinds-of-material/).

## Setting up a collection

- [Indexing large or remote collections](indexing/): profile a collection first, then index it from a folder, an S3 bucket or a manifest, with Python or Docker.
- [Mapping your data](mapping-your-data/): bring a catalog into a collection, from a spreadsheet to a museum's collection system, and what each part of the site needs.
- [Collection format](collection-format/): the folder a site serves and every table in it, and sites that hold the collections of several institutions.
- [Kinds of material](kinds-of-material/): images are always shown; 3D models, PDFs and deep zoom are options.
- [Describing a collection to visitors](describing-a-collection/): the title, suggested searches, license and links, and the link back to each record.
- [Searching by appearance and by catalog](search/): how the two channels are weighed and what each result explains.
- [Models](models/): SigLIP, SigLIP 2 or CLIP, and pinning a version.
- [Limits that protect a public site](limits/): uploads, searches per visitor and searches at once.

## Deploying

- [On a Linux server](deploy/server/): one command that keeps a site running across reboots.
- [On AWS](deploy/aws/): one command that shows its cost first, then HTTPS, a domain of your own, updates and prepared collections.
- [Under a path on an existing website](deploy/under-a-path/): serve a site at `https://library.example.org/maps/` rather than on a domain of its own.

## Extending

- [Making a frontend](making-a-frontend/): an interface of your own, in its own repository.
- [MCP server](mcp-server/): let Claude, ChatGPT or an editor's agent search a site, with the tools it offers and the limits that apply.
