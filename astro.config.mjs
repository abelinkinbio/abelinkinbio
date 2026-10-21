import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',

  // Public origin (Astro.site). This does not generate a sitemap,
  // canonical URLs, or Open Graph metadata.
  site: 'https://abelinkinbio.com',
});
