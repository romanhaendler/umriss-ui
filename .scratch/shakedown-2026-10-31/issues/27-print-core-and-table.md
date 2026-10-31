# 27: Print - core and the table

Status:     ready-for-agent
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 7; roadmap P3 (`.scratch/open-points-roadmap/spec.md:55`). Sources:
earlier-runs-open table.md 8, operator-screens 5.

**What to build:** a page of core components and tables prints as a reader would want it on paper; the
print base the other packages build on in 28.

- [ ] Core under `@media print`: overlays, toasts and the skip link do not print; cards and fields print without shadows; verdicts keep their glyph or word, so colour is not the only sign in black and white.
- [ ] The table hides toolbar, search, pager, selection boxes and row actions and prints the rows it holds without its scroll box; the head repeats on each sheet; a paged or fitted table prints the page shown and a virtual one its rendered rows, both said in the docs.
- [ ] A print example per package; Chromium `page.pdf()` output looked at as a reader; `pnpm check core`, `pnpm check table`.

## Comments
