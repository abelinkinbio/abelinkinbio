# Development

Static Astro site (`output: "static"` in `astro.config.mjs`). `npm run deploy` runs `astro build && wrangler deploy`. Cloudflare Workers serves `./dist` as assets (`wrangler.jsonc`, Worker name `abelinkinbio`, `not_found_handling: "404-page"`). There is no Worker script.

`src/styles/blueprint.css` is the only theme (cream paper, blue grid, black accents). No dark mode.

## Commands

```bash
npm install
npm run dev       # astro dev
npm run build     # astro build
npm run preview   # astro preview
npm run deploy    # astro build && wrangler deploy
```

Wrangler is a devDependency. Log in once with `npx wrangler login`, then `npm run deploy`. The configured site URL is `https://abelinkinbio.com`.

## Pages

| Route | Source |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/bio` | `src/pages/bio.astro` |
| `/playground` | `src/pages/playground/index.astro` |
| `/blog` | `src/pages/blog/index.astro` |
| `/blog/[slug]` | `src/pages/blog/[slug].astro` |
| `/livedin` | `src/pages/livedin/index.astro` |
| `/404` | `src/pages/404.astro` |

`src/layouts/BaseLayout.astro` wraps every page (nav: Home, Bio, Playground, Field Notes, City Guides). Home also uses `src/components/Globe.astro` and `src/components/BadIdeas.astro`. The favicon is `public/favicon.svg`.

`/bio` is the markup in `src/pages/bio.astro`. There is no bio collection.

`/livedin` is one page: tabs for Lisbon, D.C., and ATX, a Leaflet map (OpenStreetMap tiles), and review cards. There are no `/livedin/[city]` routes and no per-review pages. Playground entries are cards; there are no per-project pages.

## Content

Schemas live in `src/content.config.ts`. `draft: true` is omitted from every page (default `false`). Only blog posts render their markdown body. Playground and city-guide markdown bodies are not rendered.

**Blog** — `src/content/blog/<slug>.md` becomes `/blog/<slug>`.

- `title`, `description`, `date` (required; `date` sorts the list)
- `tags`: string array, default `[]`
- `draft`: boolean, default `false`

**Playground** — `src/content/playground/<name>.md`. The homepage shows at most two non-draft entries with `pinned: true`.

- `title`, `description`, `date` (required)
- `status`: `building` (default), `built`, or `killed`
- `pinned`: boolean, default `false`
- `url`: optional link on the card
- `tags`: string array, default `[]`
- `draft`: boolean, default `false`

**Lived in** — `src/content/livedin/<city>/<place>.md`. `<city>` has to be `lisbon`, `dc`, or `atx`. City ids, names, search names, map centers, and globe coordinates live in `src/cities.ts`. `#map-lisbon`, `#map-dc`, and `#map-atx` are still written out in the style block of `src/pages/livedin/index.astro`. A file in another folder is not shown.

- `title`, `description`, `date` (required)
- `emoji`: string, default `📍`
- `category`: `coffee`, `dinner`, `drinks`, `bbq`, `pizza`, `tacos`, `ramen`, `brunch`, `bar`, `bakery`, `dessert`, `lunch`, `sushi`, `burger`, or `other` (default)
- `coordinates`: optional `{ lat, lng }`, used only to drop the map pin
- `tags`: string array, default `[]` (not shown on the card)
- `draft`: boolean, default `false`

Map links are searches built from the title and city.
