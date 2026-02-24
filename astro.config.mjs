// astro.config.mjs
// ─────────────────────────────────────────────────────────────
// Astro configuration for abelinkinbio.com
//
// Currently using static output — Astro builds plain HTML/CSS/JS
// files that Cloudflare Workers serves as static assets (free).
//
// If you ever need server-side rendering (dynamic pages, API routes),
// just add the @astrojs/cloudflare adapter and change output to 'server'.
// ─────────────────────────────────────────────────────────────

import { defineConfig } from 'astro/config';

export default defineConfig({
  // 'static' = pre-renders every page at build time into plain HTML files.
  // This is the fastest, simplest mode — no server needed.
  output: 'static',

  // Your live domain — Astro uses this for generating sitemaps,
  // canonical URLs, and Open Graph metadata.
  site: 'https://abelinkinbio.com',
});
