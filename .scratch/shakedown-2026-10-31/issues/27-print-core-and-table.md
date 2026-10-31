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

The pattern for 28 (and any package's print):
1. The rules stand in the component's own `.module.css`, inside `@layer umriss.components`, as `@media print { … }` at the end of the file, with one comment saying what paper does with the thing. No global print sheet, no `data-print` attributes.
2. What answers a pointer or floats above the page (overlays, toolbars, pagers, filters, grips, buttons) is `display: none`. What holds a thing in place while it scrolls (`position: sticky`, masks, pinned shadows) is put back with `position: static` - with the same selector as the screen rule, or it loses on specificity.
3. Colour is already handled once for everyone: core's `tokens.css` prints cards and overlays with a hard edge instead of a shadow and opaque grey edges; `own.module.css` sets `color-scheme: light` on `.text` in print, so a dark application prints dark ink on white. A package whose root does not compose `text` must set `color-scheme: light` itself. A verdict keeps its word or glyph (Stat, Alert, VerdictColumn already do); do not rely on a background, Chromium drops it unless asked.
4. A table-like block: `thead { display: table-header-group }` repeats the head, `tr { break-inside: avoid }`, and never a `<button>` in a repeated head - Chromium paints it on the first sheet only, so `display: contents` it (the label stays).
5. Test: read the CSS (`?raw`) as in `packages/core/tests-unit/print.test.ts` and `packages/table/tests-unit/print.test.ts`; look at the PDF once. The check script: headless Chromium, `page.emulateMedia({ media: "print" })`, `page.pdf({ format: "A4" })`, then `pdftotext` to see the head on page 2.
6. One example per package, `Print…` button calling `window.print()`, no props; the page's `about` gets a **Print.** paragraph.
