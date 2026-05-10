import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kaulraghav.github.io',
  base: '/raghav-website-v2',
  integrations: [sitemap()],
});
