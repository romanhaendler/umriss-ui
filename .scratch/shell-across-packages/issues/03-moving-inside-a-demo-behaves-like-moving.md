# 03: Moving inside a demo behaves like moving between documents

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/shell-across-packages/spec.md`

**What to build:** Every sidebar entry, "Scenarios" included, becomes a real anchor with the page's address; a plain click still moves without a reload, a modified or middle click is the browser's. The title formula of the prerendering becomes one function in the shell tooling; the prerendering writes `<title>` with it and the shell sets `document.title` with it on every place change (an example anchor does not change it). On every place change and on first load, if the active entry is outside the sidebar's visible box, the sidebar alone scrolls it into its middle.

- [x] Tooling unit tests of the title function: component page, feature page and landing, against the fixture package.
- [x] The shell suite: after a sidebar click `document.title` equals the prerendered title of that page; after Back, the previous title returns.
- [x] Sidebar entries are anchors whose `href` is the page's address.
- [x] On a page whose entry lies below the sidebar's fold (core: Tag; elsewhere the last page) the active entry is in view after load and after a palette jump; the page's own scroll is untouched.

## Comments

**Delivered.** The title function and the one place that follows navigation
were already there (`pageTitle` in `packages/demo/src/tooling/title.ts`, the
head effect in `Shell.tsx`, both from pages-as-markdown 02); this ticket reuses
them and adds no second place. Every sidebar entry, "Scenarios" included, is
now an `<a>` with its page's address (`hrefOf(addressOf(id))`, `/` for
Scenarios). A plain click is caught by the shell's existing document click
handler and moves without a reload; a modified or middle click and "copy link"
are the browser's. A new effect in `Shell.tsx` keeps the active entry in view:
on the first load and on every move, an entry outside the sidebar's box is
brought into its middle by setting the sidebar's `scrollTop`, never the
page's. It is always instant, with no animation. `.railEntry` lost its
button-only rules and gained `text-decoration: none`. Its look is unchanged.

**Also fixed (found by the shell suite).** On `main`, `buildDemo` rebuilt the
addresses without the outline's `MOVED`, so `/getting-started/` (charts) and
`/table/` (table) landed on the scenarios page instead of being forwarded. The
cause was 069d102a. `packages/demo/src/demo.ts` now passes
`sources.addresses.MOVED` along.

**Tests.** `packages/demo/tests-unit/title.test.ts` covers a component page, a
feature page and the landing against the fixture package, plus a package's own
noun. The shell suite (`packages/demo/checks/shell.ts`) gained the following:
- The head check now compares the title with the very one the prerendering
  writes. It computes it with `pageTitle` from the manifest of the package
  under test and checks it on the first load, after two clicks, after Back,
  and on an example's address.
- "the sidebar's entries are links with their page's address": no buttons in
  the sidebar, the hrefs are right, and a click moves without a reload.
- "the active entry stands in the sidebar's view, after load and after a
  jump": a new probe `low` (core Tag, charts Benchmark, table AlarmList,
  schedule Ripple, calculation Worked examples). It checks the entry is fully
  in view after a deep link and after a palette jump, with the page's scroll
  at 0.

Results: features-shell and features-page in all five light projects had 169
passed. The 2 failures were the moved-address bug above; after the fix, charts
and table features-shell had 54 passed. `pnpm lint`, `pnpm typecheck` and
`pnpm test:unit` are green.

**Baselines.** None moved.

**Deviations.** The scroll is never animated; the spec asks only that the first
load not be. The `low` check does not assert that the sidebar actually had to
move first. In a demo whose sidebar fits the window (calculation's eight
pages), the check passes without any scroll.
