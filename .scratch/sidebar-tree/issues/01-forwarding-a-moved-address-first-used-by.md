# 01: Forwarding a moved address, first used by the charts' Installation page

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/sidebar-tree/spec.md`

**What to build:** A reader with a link to `/charts/getting-started/` (with or without an example anchor) lands on the charts' first page, now called **Installation** at `/charts/installation/`. The address bar shows only the new address. This works in the app and as a static file on the built site. The mechanism behind it is general:
- Each outline declares its moved page ids (old → current).
- Building a demo's addresses resolves a moved id to its current page and keeps the example.
- The shell's existing forward step rewrites a moved path as it already rewrites an old hash address.
- The pages build writes a forwarder page at each old path: a canonical link to the new address, an immediate forward that carries the anchor, a plain visible link, and `noindex`.
- The built-site guard accepts declared forwarders and nothing else outside the sitemap.

In the same change the charts' Series run Line, Area, Bar, Scatter, BoxPlot, StateBand, Matrix. The example folder of the renamed page is renamed so that its example anchors stay the same.

- [x] `/charts/getting-started/` and `/charts/getting-started/#<example>` land on Installation (and that example) in the app, with the address bar on the new path.
- [x] The built site has a forwarder file at the old path. It carries a canonical link to the new address, `noindex` and a visible link, and it is absent from the sitemap.
- [x] The guard fails on a page file that is neither in the sitemap nor a declared forwarder. It also fails on a forwarder whose target is not in the sitemap.
- [x] Declaring an old id that is also a current page id, or a current id that does not exist, throws when addresses are built, naming the id (tooling unit test).
- [x] The charts' sidebar shows "Installation" under Getting started, and Series is in the new order.
- [x] The shell suite's moved-address probe passes for charts. Demos without a moved page skip it.
- [x] No `example-*` screenshot changes content. The commit states the before and after counts of the moved `page-*` images.

## Comments

**Delivered.** The mechanism, in four places:
- `packages/demo/src/outline.ts`: `addresses(outline, moved)` takes an optional `Moved` (old id → current id) and exposes it as `MOVED`. `fromPlace` reads an old id as its current page, keeps the example and adds `moved: true`. An old id that is still a page id, or a target that is no page, throws with the id in the message.
- `packages/demo/src/Shell.tsx`: the existing forward step also runs when `fromPlace` says `moved`, and rewrites the bar with `replaceState`.
- `packages/demo/src/tooling/site.ts` (new): `forwarderHtml` writes the old path's page (`noindex`, canonical to the full new URL, a one-line `location.replace(path + location.hash)`, a zero-second meta refresh, a plain link). The forward goes to the path, not the host, so a site served locally stays local. `siteFaults` is the site guard, moved out of `scripts/build-pages.mjs` so a unit test can reach it.
- The pipeline: `renderLlms` takes `moved` and returns `forwarders`. `generateLlms` writes `demo/.generated/forwarders.json`, and `build-pages.mjs` writes each forwarder and runs `siteFaults`.

**Charts.** The outline declares `MOVED = { "getting-started": "installation" }`. The page is `installation` / "Installation" and keeps `installs: true`. `demo/props.ts` passes `moved`. The example folder `Getting-started/` is now `Installation/`, so the anchors are unchanged. Series runs Line, Area, Bar, Scatter, BoxPlot, StateBand, Matrix. `packages/demo/src/packages.ts` gives charts the start page `installation`.

**Tests.**
- `examples.test.ts`: a moved id resolves with its example, and a collision or a dangling target throws, naming the id.
- `site.test.ts`: the forwarder's head, forward and link. The guard fails on a page file that is neither in the sitemap nor a forwarder, on a forwarder whose target is not in the sitemap, on a forwarder in the sitemap and on a declared forwarder with no file.
- `llms.test.ts`: forwarders come from `moved` and from nothing else.
- `checks/shell.ts`: a new optional probe `moved` (old path, then old path with an anchor: lands, highlighted, bar on the new address). Charts passes it; the other demos skip it.
- `pnpm build:pages` passed its guard with 1 forwarder. In a browser, the static `/umriss-ui/charts/getting-started/#in-its-container` landed on `/installation/#in-its-container` with JS, and on `/installation/` without JS.

**Baselines.** The six images of the renamed page were renamed `*-getting-started*` → `*-installation*`. All four `example-installation--*` images pass unchanged. 2 of the 32 charts `page-*` images (32 before, 32 after) changed content: `page-installation-*` light and dark, whose heading reads "Installation" instead of "Getting started". Both were looked at and renewed with `--update-snapshots=all -g "Page head installation"`. The Series reordering moves no image.

**Deviation.** `pnpm build:pages` imports the tooling's `.ts` directly. On main it already does this for `packages.ts`, with types stripped.
