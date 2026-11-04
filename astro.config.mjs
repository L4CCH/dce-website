// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://digital-collections-explorer.com',
  integrations: [
    starlight({
      title: 'Digital Collections Explorer',
      description: 'Technical documentation for running, deploying and extending Digital Collections Explorer.',
      favicon: '/favicon.svg',
      customCss: ['./src/styles/docs.css'],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/hinxcode/digital-collections-explorer' }],
      editLink: { baseUrl: 'https://github.com/L4CCH/dce-website/edit/main/' },
      lastUpdated: true,
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@400;700&family=Lato:ital,wght@0,400;0,700;1,400&display=swap',
          },
        },
      ],
      sidebar: [
        { label: 'Overview', slug: 'docs' },
        { label: 'Deploying', items: [{ autogenerate: { directory: 'docs/deploy' } }] },
        { label: 'MCP server', slug: 'docs/mcp-server' },
      ],
    }),
    sitemap(),
  ],
});
