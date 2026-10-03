# 01: Forwarding a moved address, first used by the charts' Installation page

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/sidebar-tree/spec.md`

**What to build:** A reader with a link to `/charts/getting-started/` (with or without an example anchor) lands on the charts' first page, now called **Installation** at `/charts/installation/`. The address bar shows only the new address. This works in the app and as a static file on the built site. The mechanism behind it is general:
- Each outline declares its moved page ids (old → current).
- Building a demo's addresses resolves a moved id to its current page and keeps the example.
- The shell's existing forward step rewrites a moved path as it already rewrites an old hash address.
- The pages build writes a forwarder page at each old path: a canonical link to the new address, an immediate forward that carries the anchor, a plain visible link, and `noindex`.
- The built-site guard accepts declared forwarders and nothing else outside the sitemap.

In the same change the charts' Series run Line, Area, Bar, Scatter, BoxPlot, StateBand, Matrix. The example folder of the renamed page is renamed so that its example anchors stay the same.

- [ ] `/charts/getting-started/` and `/charts/getting-started/#<example>` land on Installation (and that example) in the app, with the address bar on the new path.
- [ ] The built site has a forwarder file at the old path. It carries a canonical link to the new address, `noindex` and a visible link, and it is absent from the sitemap.
- [ ] The guard fails on a page file that is neither in the sitemap nor a declared forwarder. It also fails on a forwarder whose target is not in the sitemap.
- [ ] Declaring an old id that is also a current page id, or a current id that does not exist, throws when addresses are built, naming the id (tooling unit test).
- [ ] The charts' sidebar shows "Installation" under Getting started, and Series is in the new order.
- [ ] The shell suite's moved-address probe passes for charts. Demos without a moved page skip it.
- [ ] No `example-*` screenshot changes content. The commit states the before and after counts of the moved `page-*` images.
