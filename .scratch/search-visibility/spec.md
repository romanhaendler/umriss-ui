# Found by search, on our own merits

Status: ready-for-human
Date:   2026-09-27
Origin: grilling session with the user, 27 Sep 2026. Decision record: ADR-0036.

## Problem

Someone searching Google for React components, React charts, a React Gantt
schedule or a React data table does not find umriss. The demos are single-page
apps addressed by the hash (`/core/#/card`); a crawler ignores the fragment and
sees an empty `<div id="root">` — five indexable URLs, none with text. Titles
are generic ("Umriss UI – Component overview"), there is no meta description,
no sitemap, no canonical. Until 27 Sep the GitHub repository had no
description, homepage or topics.

The user's constraint: **only our own optimisation** — nothing that needs a
mention on another site (no awesome-lists, Reddit, dev.to, directories, blog
posts). Channels we control ourselves are in: the Pages site, GitHub's
metadata, npm's metadata, Google Search Console, Bing Webmaster Tools.

## Decisions

| # | Question | Decision |
| --- | --- | --- |
| D1 | What is to rank? | The Pages site as the landing. GitHub and npm only carry description, keywords, topics and the homepage link. |
| D2 | Which queries? | The long tail, one page per query: "react canvas charts", "react gantt / schedule component", "react data table columns as JSX", "react command palette", "react sparkline", "react tree view" … The head terms ("react components") stay a side goal: without backlinks, MUI, shadcn and Recharts hold them. |
| D3 | Own domain? | No, not for now. The site stays at `https://romanhaendler.github.io/umriss-ui/`. No root `robots.txt` is possible there; the user site returns 404 for it, which allows everything. |
| D4 | Addresses | By path, prerendered (ADR-0036). |
| D5 | Granularity | One URL per page. Examples stay anchors within their page (`/core/card/#with-actions`) — a single example is too thin for a page of its own. **Deviation from the session:** scenarios were to get a URL each, but they are examples on the demo's front page (`placeOf(SCENARIOS, id)`), not pages; they stay anchors there, and the front page carries all their texts. Revisit if a scenario should rank on its own. |
| D6 | Prerendering | Static HTML per page from the data of `packages/demo/src/tooling/llms.ts` — heading, lead, every example's source, the props tables — inside `#root`; the app replaces it with `createRoot` (not hydration). |
| D7 | Old hash links | Forwarded at start: `/core/#/card/x` → `/core/card/#x`. `llms.txt`, READMEs and changelog links move to paths. |
| D8 | Title and description | By formula, no SEO fields of their own. Title `<Page> – React <noun> · @umriss-ui/<package>`, the noun from one map per package (component, chart, table, schedule, calculation). Description = the page's existing summary line. A weak page is fixed in its summary, which improves the demo and `llms.txt` too. |
| D9 | The front page | `site/index.html` becomes the hub: a searchable title, a link to every page of every package, `sitemap.xml`, `canonical`, `og:` tags without an image, JSON-LD `SoftwareSourceCode` per package. |
| D10 | Wording | English only (ADR-0018). The first line (the part before the dash) of every package description and README carries the search terms; the voice after it stays. |
| D11 | Search consoles | Google Search Console and Bing, URL-prefix property on the Pages address. The user creates them; the verification file is copied into `site/` by `build-pages.mjs`. |
| D12 | GitHub metadata | Done on 27 Sep via `gh`: description, homepage, 15 topics. |
| D13 | npm | One patch release of all five packages at the end, so npm's links do not point at hash addresses. |
| D14 | Look | The demos look exactly as before. The front page changes visibly and gets its own polish ticket, accepted by the user on the rendered picture. |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | Path addresses in the shell | M |
| 02 | A static page per address | M |
| 03 | The front page as hub, sitemap, structured data | S |
| 04 | Searchable first lines: package.json, READMEs, links | S |
| 05 | Search Console and Bing | S, human |
| 06 | Patch release of all five | S |
| 07 | Polish of the front page | S, human acceptance |

## Testing

The existing navigation checks (`packages/demo/checks/navigation.ts`) go
through `addressOf` and must pass unchanged, with no screenshot baseline
moving. A guard over the built site: every page of every outline has an
`index.html` with a non-empty title, description, canonical and `<h1>`, and
`sitemap.xml` lists exactly those. Afterwards: Search Console's URL
inspection on three pages shows the rendered text.

## Out of scope

Backlinks of any kind. An own domain. Social preview images. Translated pages.
Paid search. A blog.
