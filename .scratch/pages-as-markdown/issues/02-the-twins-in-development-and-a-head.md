# 02: The twins in development, and a head that follows navigation

Status: done
Blocked by: 01 (Every page has a Markdown twin)
Spec: `.scratch/pages-as-markdown/spec.md`

**What to build:** The dev server serves the same twins at the same addresses as the site. When the app navigates, the alternate link follows the page, in the one place in the head that follows navigation — the place `shell-across-packages` introduces for the document title; if that has not landed, this ticket introduces it and the title joins it.

- [x] In `pnpm dev`, every page's `.md` address returns the same text as on the built site
- [x] Shell suite: after an in-app jump, the head holds exactly one alternate link and it points at the new page's twin
- [x] The document title and the alternate link are set in one place

## Comments

### Delivery report (2026-10-03)

- **Built.** Each demo's vite config names `demo/.generated/twins/` as its
  `publicDir`: `pnpm dev` serves every twin at its address, and `build:demo`
  carries the same files in `dist-demo` (so the preview servers serve them
  too). `build-pages.mjs` no longer copies the twins itself; they arrive with
  `dist-demo`. The title formula is one function, `pageTitle` in
  `packages/demo/src/tooling/title.ts` (no imports, so it runs in Node and the
  browser). The prerendering (`llms.ts`) writes `<title>` with it, and `Shell.tsx`
  has the one effect that follows navigation: on the first load and on every
  page change it sets `document.title` with `pageTitle` and keeps exactly one
  `<link rel="alternate" type="text/markdown">` (taken from the prerendered head
  if one is there, created otherwise) pointing at `hrefOf(twinOfPlace(...))`.
  An example anchor changes neither. `Demo` gains `description` (from the
  manifest) for the scenarios page's title.
- **For `shell-across-packages` 03.** This effect is the place that follows
  navigation, and `pageTitle` is the title function its spec asks for. 03 adds
  its tooling tests and its exact-title shell check there rather than a second
  place.
- **Tests.** Shell suite (`checks/shell.ts`, "the head follows the page"): on
  the first load the one alternate link is `/index.md`; after two sidebar
  clicks there is exactly one and it is `/<page>.md`, the title matches the
  formula, and the server returns the twin starting with `# <page name>`;
  after Back the link and the title return. Red before the change, green in
  `ui-light` and `charts-light` (features-shell and features-page: 31 + 26
  passed). By hand: charts' dev server returned all 16 twins byte for byte;
  `pnpm build:pages` passes its guard, and core's site twins equal the
  generated ones byte for byte.
- **Baselines.** None moved.
- **Deviations.** None from the ticket. No CHANGELOG entry: nothing a
  package's caller installs changes.
