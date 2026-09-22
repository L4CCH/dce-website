// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://digital-collections-explorer.com',
  integrations: [sitemap()],
});
