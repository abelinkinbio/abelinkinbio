# @abelinkinbio — v3.0.0

Personal site built with Astro + Cloudflare Workers.

Blueprint design system · Dark/light mode · Content collections · Map-ready architecture.

## Quick Start

```bash
# Install dependencies
npm install

# Run local dev server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

## Project Structure

```
src/
  content/
    blog/              ← Long-form writing (markdown)
    livedin/
      lisbon/          ← Restaurant & café reviews by city
      dc/
      atx/
    playground/        ← Project dashboard entries

  pages/
    index.astro        ← Home
    bio.astro          ← Bio (edit directly)
    blog/              ← Blog listing + individual posts
    playground/        ← Project dashboard
    livedin/           ← City guides with maps + reviews

  layouts/
    BaseLayout.astro   ← Wraps every page (nav, footer, dark mode)

  styles/
    blueprint.css      ← The entire Blueprint design system
```

## Adding Content

**New blog post:** Create a `.md` file in `src/content/blog/`:

```markdown
---
title: "My Post Title"
description: "A short description"
date: 2025-01-15
tags: ["topic"]
---

Your content here.
```

**New review:** Create a `.md` file in `src/content/livedin/{city}/`:

```markdown
---
title: "Restaurant Name"
description: "One-line description"
date: 2025-01-15
emoji: "🍽️"
category: "dinner"
googleMapsUrl: "https://maps.app.goo.gl/..."
tags: ["date-night"]
---

Your review here.
```

**New project:** Create a `.md` file in `src/content/playground/`:

```markdown
---
title: "project-name"
description: "What it does"
date: 2025-01-15
emoji: "🧪"
status: "active"  # active | investing | shipped | killed
url: "https://..."
tags: ["tag"]
---

Details about the project.
```

**New city:** Create a new folder in `src/content/livedin/` (e.g., `sf/`) and add review files. Then add the city's display name and emoji to the `cityMeta` object in:
- `src/pages/livedin/index.astro`
- `src/pages/livedin/[city]/index.astro`
- `src/pages/livedin/[city]/[slug].astro`

## Deploy to Cloudflare Workers

Your domain (abelinkinbio.com) is already on Cloudflare DNS.

1. Install Wrangler if you haven't: `npm install -g wrangler`
2. Log in: `wrangler login`
3. Deploy: `npm run deploy`

Wrangler will build the site and push the static assets to Workers. Static asset serving is free — you don't pay per request.

## Phase Roadmap

- [x] **Phase 1** — Foundation: Astro scaffold, Blueprint design system, core pages, Workers config
- [ ] **Phase 2** — Content: Migrate all markdown from Hugo, geocode reviews from Google Maps links
- [ ] **Phase 3** — Maps: Leaflet integration on city pages, Stamen Toner Lite tiles, pin interactions
- [ ] **Phase 4** — Polish: Responsive refinement, SEO, RSS, performance audit, DNS cutover
