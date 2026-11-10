// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://l4cch.github.io',
  base: '/dce-website',
  redirects: { '/docs/groups': '/dce-website/docs/collection-format/' },
  integrations: [
    starlight({
      title: 'Digital Collections Explorer',
      description: 'Technical documentation for running, deploying and extending Digital Collections Explorer.',
      favicon: '/favicon.svg',
      customCss: ['./src/styles/docs.css'],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/L4CCH/digital-collections-explorer' }],
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
        {
          label: 'Setting up a collection',
          items: [
            { slug: 'docs/indexing' },
            { slug: 'docs/mapping-your-data' },
            { slug: 'docs/collection-format' },
            { slug: 'docs/kinds-of-material' },
            { slug: 'docs/describing-a-collection' },
            { slug: 'docs/search' },
            { slug: 'docs/models' },
            { slug: 'docs/limits' },
          ],
        },
        { label: 'Deploying', items: [{ autogenerate: { directory: 'docs/deploy' } }] },
        { label: 'Extending', items: [{ slug: 'docs/making-a-frontend' }, { slug: 'docs/mcp-server' }] },
      ],
    }),
    sitemap(),
  ],
});
