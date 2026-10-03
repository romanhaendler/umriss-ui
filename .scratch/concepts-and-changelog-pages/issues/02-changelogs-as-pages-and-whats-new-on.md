# 02: Changelogs as pages, and "What's new" on the front page

Status: done
Blocked by: 01 (The concept documents are pages of the site), `shell-across-packages` 02 (The header connects the five packages)
Spec: `.scratch/concepts-and-changelog-pages/spec.md`

**What to build:** Each package's changelog is rendered at `/<package>/changelog/` in the document layout. Every version heading gets an anchor like `v0-24-0`; "Changed" sections carry the warning edge with the word kept. The build reads each changelog's first version heading (version, title, month) and fails when its shape is wrong or the version is not the manifest's. The front page shows a "What's new" strip under the tiles, one line per package linked to its anchor. The foot of each demo's sidebar gains "Changelog", and the site's `llms.txt` gains a "Documents" section with the three concept pages and five changelogs.

- [x] Unit tests of the version-heading reader: the normal shape, a heading without month, a heading that is not a version.
- [x] Five changelog pages are in the sitemap and pass the guard.
- [x] The build fails when a changelog's newest version differs from its manifest's version.
- [x] Each "What's new" line links an anchor that exists on its changelog page (guard).
- [x] No page of the site links a changelog on GitHub.

## Comments

**Delivered.** `DOCUMENTS` (`packages/demo/src/tooling/documents.ts`) gains the five changelogs from `PACKAGES`: `packages/<id>/CHANGELOG.md` at `/<id>/changelog/`, titled "Changelog – @umriss-ui/<id>", with `changelogOf` naming the package. `renderDocument` gives a level-2 heading that starts with a version (`internal 0.10.0` too) the id `v0-24-0`, repeated ones `-1`, and an h3 starting "Changed" the class `changed`; the layout draws `--u-color-warning` as its left edge, the word kept. `readRelease` reads `<version> – <title> (<month>)`, `newestRelease` takes the first `##` after "Unreleased" and throws on any other shape; `build-pages.mjs` throws when that version is not the manifest's. The front page has a "What's new" section under the tiles, one line a package, "<Name> <version> – <title> (<month>)", linked to `./<id>/changelog/#v…`. Each changelog sits in its package's group in "Every page"; the foot and the "Documents" group keep the three concept documents. The demos' out links (header on wide screens, sidebar foot at ≤900 px) gain "Changelog" (`${BASE}changelog/`, a clock glyph); the click handler leaves it to the browser. The site's `llms.txt` gains "## Documents": the three concept pages with their descriptions, the five changelogs with their newest release.

**Tests.** `tests-unit/documents.test.ts` (+6): the reader on the normal shape and a pre-release, a heading without month, a heading that is no version; the newest after "Unreleased" and a malformed one throwing; the `v…` ids, the `-1` on a repeat and the `changed` class; the five list entries. `tests-unit/site.test.ts`: `whatsNewFaults` (3: passes; no strip or a changelog without a line; an anchor its page lacks), `documentFaults` fails on a page linking a changelog on GitHub, the front cap's new limit. `checks/shell.ts`: the header's "Changelog" leads to `changelog/`, and it stands at the sidebar's foot at 390 px. `pnpm build:pages` passes the whole guard (148 addresses, 8 documents). Shell and page suites in `ui-light` and `charts-light` under the lock. The built site was looked at in Chromium: the strip at 1440 and 390, light and dark; a changelog page at its anchor, at 390, the "Changed" edge; the demo header at 905 px with four icons in one line; the sidebar foot at 390; a click on "Changelog" on a table page landed on the table's changelog page; no page errors, no failed requests, no sideways scroll.

**Baselines.** None moved: the screenshots capture page heads, examples and scenarios, never the header or the sidebar's foot.

**Deviations.**
- The front guard's cap: with the strip the front page links 23 distinct addresses outside the index, and the five lines are what the spec asks for. The cap is now "fewer than 20 and one per package" (`20 + landings.length`): the strip's lines and nothing else.
- `documentFaults` takes the site's text files beside the sitemap as link targets: the changelogs link each package's `llms-full.txt`.
- Two sentences of `packages/charts/CHANGELOG.md` lose their requirement numbers (R-4.12, R-3.4): the site's leak guard forbids them on any page.
- "Changelog" joins the header's out links as well as the sidebar foot: the foot shows only at ≤900 px, and the spec wants it reachable from every page.
- `llms.txt` describes a changelog by its newest release, not its first paragraph, which says the same in all five.
