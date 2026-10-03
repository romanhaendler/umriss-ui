# 03: One install command, derived from the manifest

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/facade-defects/spec.md`

**What to build:** One function in the shell tooling turns a package manifest into `npm install <name> <@umriss-ui peers…>` (peers in the order core, charts; React left to the prose). Every Installation page shows that command as a code block with the existing copy button, directly under the import line, in the app and in the prerendered HTML; the outline marks the installing page with one flag. The per-package `llms.txt` install line uses the same function, so table, schedule and calculation finally name their peers. The inline "Install with `pnpm add …`" phrases leave the five Installation pages; the surrounding prose is rewritten to say what the command brings (peers and why, the stylesheet, React's version). The README keeps its pnpm quick start.

- [x] Unit tests of the function: core alone, table with core, schedule with core and charts, a manifest without peers.
- [x] The llms test against the fixture package finds the derived command in the `llms.txt` line.
- [x] All five Installation pages show the command as a copyable block; the page suite checks that the clipboard holds exactly the derived command.
- [x] The command is text in the prerendered HTML.
- [x] No `pnpm add` remains in the demos' prose.
- [x] The `llms.txt` of table, schedule and calculation names their peers.

## Comments

**Delivered.** `installCommand(manifest)` in `packages/demo/src/tooling/install.ts`
gives `npm install <name> <@umriss-ui peers>`: core first, then charts, an
unknown umriss peer after them in the manifest's order, React left out. A demo
now hands the shell its `package.json` (`buildDemo({ manifest, … })` in place
of `packageName`), and the shell derives `Demo.install` from it. The outline's
`Page` has one flag, `installs?: true`, set on the five Installation pages
(charts': `getting-started`). Its head shows the command as an `installLine`
under the import line (styled as the import line, every package name kept
whole, the existing `CopyButton`). `llms.ts` uses the same function for the
"Install with" line of `llms.txt`, `llms-full.txt` and the front page, and puts
the command as an `sh` fence under the import line of the installing page,
so the prerendered HTML carries it as text. The five pages' prose now says
what the command brings; the core example lead "After `pnpm add …`" reads
"Once installed, …". CHANGELOG `Fixed` entries in table, schedule and
calculation (their shipped `docs/llms-full.md` named no peer).

**Tests.** `packages/demo/tests-unit/install.test.ts` (the four cases);
`llms.test.ts` against the fixture, which gained a core peer: the install line
in both texts, the `sh` fence under the import line of the flagged page only,
the command as `<pre><code>` in its prerendered HTML. Playwright:
`checkInstall` in `packages/demo/checks/page.ts` opens the page flagged
`installs`, reads the command and checks the clipboard holds exactly it; it
runs in all five demos (new `features-page.spec.ts` for charts and
calculation). Shell, page and screenshot suites of all ten projects run.

**Baselines moved** (all on the Installation pages, light and dark): the page
head of each of the five (the install line added, prose rewritten) and the
examples on those pages - core's `first-component` (its lead) and
`light-and-dark`, charts' `first-chart` and `in-its-container`, table's
`first-table`, schedule's `smallest-schedule`, calculation's `availability`.
The examples moved by one pixel of height: the line above shifts them by a
fraction of a pixel.

**Not this ticket.** `Example language--own-components` (ui-light) fails
against its baseline before and after a rerun - a glyph-level difference in
the "Today" tag; nothing in this change reaches that page.

**For the sidebar-tree merge.** Charts' Installation page is still
`getting-started` here; the rename moves the `installs: true` with it, and the
two charts `page-getting-started-*` baselines renewed here are the ones the
rename renames. `checkInstall` finds the page by the flag, not by id.
