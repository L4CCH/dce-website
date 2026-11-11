import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../site';

const order = [
  'docs',
  'docs/indexing',
  'docs/mapping-your-data',
  'docs/collection-format',
  'docs/kinds-of-material',
  'docs/describing-a-collection',
  'docs/search',
  'docs/models',
  'docs/limits',
  'docs/deploy/server',
  'docs/deploy/aws',
  'docs/deploy/under-a-path',
  'docs/making-a-frontend',
  'docs/mcp-server',
];

const rank = (id: string) => (order.includes(id) ? order.indexOf(id) : order.length);

const absolute = (markdown: string, page: string) =>
  markdown.replace(/\]\((?!https?:|mailto:)([^)\s]+)\)/g, (_, href: string) => `](${new URL(href, page)})`);

export const GET: APIRoute = async () => {
  const pages = (await getCollection('docs'))
    .filter((page) => page.id === 'docs' || page.id.startsWith('docs/'))
    .sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id));
  const sections = pages.map((page) => {
    const url = `${site.url}/${page.id}/`;
    return [`# ${page.data.title}`, '', `${url}`, '', page.data.description ?? '', '', absolute(page.body ?? '', url).trim()].join('\n');
  });
  const text = [`# ${site.name}: documentation\n\n> ${site.description}`, ...sections].join('\n\n');
  return new Response(`${text}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
