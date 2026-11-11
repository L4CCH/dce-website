import type { APIRoute } from 'astro';
import { media, showcases, site } from '../site';

export const GET: APIRoute = () => {
  const text = `# ${site.name}

> ${site.description}

${site.name} is open-source software that started at the ${site.lab.name} (${site.lab.short}),
${site.lab.institution}, and is developed in the open with contributors from other
institutions. A gallery, library, archive, or museum points it at a folder, an S3 bucket
or a manifest of images. Visitors can then search the collection in plain language or
with a picture, browse it, and follow every image back to the institution's own record.
Search uses an open multimodal embedding model, SigLIP by default, SigLIP 2 or CLIP, run on
the institution's own hardware, so no catalog or tags are needed. Where a catalog
exists, search also reads the records and weighs them against what the images show. A
site can hold the collections of several institutions, each with its own name and license,
and visitors can search them all or some. It indexes
hundreds of thousands of images on ordinary hardware and serves them from one small machine
without a GPU.

Each site can also answer AI assistants through a built-in MCP server (Model Context
Protocol, at /mcp): read-only tools to describe the collection, search it, find similar
objects, search with an image, list catalog values to filter by, and open an object.

Three ways to start: ask an AI coding agent to use the repository's dce-setup skill;
run the container image (${site.containerImage}) with Docker; or run the bootstrap
script on a Linux server or the AWS script, which shows its cost before creating anything.

## Software

- [Source code and README](${site.repoUrl}): install, configure, deploy
- [Documentation](${site.url}/docs/): indexing, describing a collection, groups, search, models, limits, the kinds of material a site shows, making a frontend, deploying, and the MCP server for AI assistants
- [Contributing guide](${site.contributingUrl})
- [Agent Skill for setting up a collection](${site.skillUrl}): for Claude Code, Codex, Gemini CLI, Cursor
- [Releases](${site.repoUrl}/releases)
- [Ideas wishlist](${site.ideasUrl}): what people want next; vote or post
- [Discussions](${site.discussionsUrl})

## What a site shows

Images are always shown. The other kinds of material are options chosen at setup, with \`npm run setup -- --with=3d,pdf,zoom\`, and only their packages are installed.

${media.map((m) => `- ${m.name}${m.option ? ` (\`--with=${m.option}\`)` : ''}: ${m.lead}`).join('\n')}

## Showcases

${showcases.map((s) => `- [${s.name}](${s.url}): ${s.summary}`).join('\n')}

## Research

- [Paper in ${site.paper.journal}, vol. ${site.paper.volume}, ${site.paper.article} (${site.paper.year})](${site.paper.url}): ${site.paper.title}
- [${site.lab.name}](${site.lab.url})

## License

Code: ${site.license.name}. Documentation, paper and figures: ${site.docsLicense.name}. Third-party data and media keep their own licenses.
`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
