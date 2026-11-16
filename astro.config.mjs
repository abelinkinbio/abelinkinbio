// astro.config.mjs
// ─────────────────────────────────────────────────────────────
// Astro configuration for abelinkinbio.com
//
// Static output. Astro prerenders every page to HTML, and Cloudflare
// Workers serves ./dist as static assets. A fully prerendered site
// does not use an adapter.
// ─────────────────────────────────────────────────────────────

import { defineConfig } from 'astro/config';

export default defineConfig({
  // 'static' = pre-renders every page at build time into plain HTML files.
  // This is the fastest, simplest mode — no server needed.
  output: 'static',

  // Public origin (Astro.site). BaseLayout uses this for absolute
  // canonical and Open Graph URLs. This does not generate a sitemap.
  site: 'https://abelinkinbio.com',
});
