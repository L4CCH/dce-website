import type { APIRoute } from 'astro';
import { site, templates } from '../site';

export const GET: APIRoute = () => {
  const lines = [
    `# ${site.name}. Everyone is welcome, including AI assistants.`,
    '# Only the demos\' search endpoints are off limits: they are the one costly thing they do.',
    'User-agent: *',
    'Allow: /',
    ...templates.map((t) => `Disallow: ${t.demo}api/search/`),
    '',
    ...['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'].flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
    `Sitemap: ${site.url}/sitemap-index.xml`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
