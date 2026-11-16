# Development

Static Astro site (`output: "static"` in `astro.config.mjs`). `npm run deploy` runs `astro build && wrangler deploy`. Cloudflare Workers serves `./dist` as assets (`wrangler.jsonc`, Worker name `abelinkinbio`, `not_found_handling: "404-page"`). `worker/index.ts` handles `POST /api/livedin/recommend` only (`assets.run_worker_first` is `/api/*`). `astro build` writes `.cache/livedin-catalog.json` from the lived-in collection; the worker bundles that file, so build before `wrangler dev` or `wrangler deploy`.

`src/styles/blueprint.css` is the only theme (cream paper, blue grid, black accents). No dark mode.

## Commands

```bash
npm install
npm run dev       # astro dev
npm run build     # astro build
npm run preview   # astro preview
npm run deploy    # astro build && wrangler deploy
npm test          # lived-in recommend filtering
npm run build && npx wrangler dev --local   # no login; ask bar uses the fallback pick
npm run build && npx wrangler dev          # after wrangler login, calls Workers AI
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
| `POST /api/livedin/recommend` | `worker/index.ts` |
| `/404` | `src/pages/404.astro` |

`src/layouts/BaseLayout.astro` wraps every page (nav: Home, Bio, Playground, Field Notes, City Guides) and emits the canonical link plus Open Graph and Twitter card tags. Home also uses `src/components/Globe.astro` and `src/components/BadIdeas.astro`. The favicon is `public/favicon.svg`. Link previews use a page's cover image when it has one, and `public/og.png` (1200×630) otherwise.

`/bio` is the markup in `src/pages/bio.astro`. There is no bio collection.

`/livedin` is one page: tabs for Lisbon, D.C., and ATX, a Leaflet map (OpenStreetMap tiles), and review cards. There are no `/livedin/[city]` routes and no per-review pages. The ask bar (`src/components/LivedInAsk.astro`) sits under the page title and above the map. It posts the text they typed, the browser's local time, the active city tab, and the referrer path. A city or neighborhood in the text (Lisbon areas, Lisbon, D.C., ATX, Austin) overrides the tab, and a time in the text such as midnight overrides the clock. `too far` and `too close` stay in that city. Playground entries are cards; there are no per-project pages.

## Content

Schemas live in `src/content.config.ts`. `draft: true` is omitted from every page (default `false`). Only blog posts render their markdown body. Playground and city-guide markdown bodies are not rendered.

**Blog** — `src/content/blog/<slug>.md` becomes `/blog/<slug>`.

- `title`, `description`, `date` (required; `date` sorts the list)
- `tags`: string array, default `[]`
- `image`: optional cover. A site path (`/images/a.png`) or an absolute URL. Link previews use `public/og.png` when it is omitted
- `draft`: boolean, default `false`

**Playground** — `src/content/playground/<name>.md`. The homepage shows at most two non-draft entries with `pinned: true`.

- `title`, `description`, `date` (required)
- `status`: `building` (default), `built`, or `killed`
- `pinned`: boolean, default `false`
- `url`: optional link on the card
- `tags`: string array, default `[]`
- `draft`: boolean, default `false`

**Lived in** — `src/content/livedin/<city>/<place>.md`. `<city>` has to be `lisbon`, `dc`, or `atx`. City ids, names, search names, and globe coordinates live in `src/cities.ts`. A file in another folder is not shown.

- `title`, `description`, `date` (required)
- `emoji`: string, default `📍`
- `category`: `dinner`, `date-nite`, `late-nite`, `coffee`, `breakfast`, `lunch`, `drinks`, `delivery`, or `misc` (default)
- `coordinates`: optional `{ lat, lng }`, used only to drop the map pin
- `googleMaps`, `appleMaps`: optional place URLs. Without one, that link is a name-plus-city search
- `tags`: string array, default `[]`. Stored for later. Not rendered
- `draft`: boolean, default `false`
