---
title: Documentation
description: Technical documentation for running, deploying and extending Digital Collections Explorer.
---

These pages are for the people who run Digital Collections Explorer: the person at a gallery, library, archive or museum who sets up a site, and the developer who extends it. The [README](https://github.com/L4CCH/digital-collections-explorer#readme) covers installing it locally in a few steps.

## Setting up a collection

- [Indexing large or remote collections](indexing/): profile a collection first, then index it from a folder, an S3 bucket or a manifest, with Python or Docker.
- [Kinds of material](kinds-of-material/): images are always shown; 3D models, PDFs and deep zoom are options.
- [Describing a collection to visitors](describing-a-collection/): the title, suggested searches, license and links, and the link back to each record.
- [Collections split into groups](groups/): serve a collection prepared by your own pipeline, with records, filters and related sources.
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
