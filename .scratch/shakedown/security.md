# Shakedown: security review of all six packages (0.40.4)

Status: needs-triage

A defensive review against a local host (Vite 8, React 19.3, Chromium; a dev server and a static build under
a strict CSP), 2026-10-24. Not covered: WebKit, XLSX (not built yet), the less common pickers, a real Excel
open of the CSV. Verdict of the persona: adoption approved, with the Breadcrumb fix first and the CSV formula
issue (`table.md` 1) closed.

## Findings

1. ✓ **[Break, security, medium] Breadcrumb's collapsed "…" menu runs `window.location.assign(item.href)`
   unchecked** (`core/src/components/Breadcrumb/Breadcrumb.tsx:74`), so a `javascript:` href executes on a
   click - although React 19 blocks the same URL in the inline `<a>` links. Hits apps that build
   breadcrumb hrefs from CMS, query or user data and show the trail at narrow widths. Idea: render real
   `<a>` elements in the menu (React's guard, middle-click and "open in new tab" come with it), or allow only
   http(s), mailto, tel, relative and fragment hrefs. **Fixed 2026-10-24** (spec `.scratch/shakedown-defects/`).
2. **[Trap, info] `Link` and `Breadcrumb` do not sanitise hrefs themselves**; they rely on React 19's guard
   (safe by the peer floor, not by design). `data:` and `vbscript:` pass. Idea: document "hrefs must be
   trusted", or an opt-in allow-list.
3. **[Misfit, low] `Export`'s `filename` goes unvalidated to `a.download`;** Chromium sanitises path
   characters and control characters, a 400-character name passes, so do `con.csv` and an `.html`
   extension. An Electron or embedded WebView may not sanitise. Idea: strip separators and control
   characters, force `.csv`.
4. **[Info] The published `package.json` carries the monorepo's dev scripts** (`props`, `dev`,
   `check:dist`), harmless but pointing at paths that do not exist in the tarball.

## Wishes

- **An opt-in URL allow-list or `safeHref` helper** for `Link`, `Breadcrumb` and future action URLs.
  Workaround: about 5 lines in the host. Elsewhere: MUI, Next and Mantine do not sanitise either. Unlisted.
- **CSV formula neutralisation** - known, `table.md` 1.

## Held up

No `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval` or
`new Function` in any bundle; `setAttribute` only for aria, data and tabindex; styles only through CSSOM ·
`<img onerror>`, `<svg onload>`, `javascript:`, `</script>` and `<style>` through every text prop of all six
packages (toasts, tooltips, options, palette items, table cells and labels, chart series and limit labels,
the chart tooltip and data table, schedule names, calculation labels and units, dashboard titles and options)
render as text: no dialog, no parsed element, no `on*` attribute · a strict CSP with
`require-trusted-types-for 'script'` over all six: zero violations, zero console errors (the detector was
checked to fire) · no network request, no cookie, storage, `fetch`, `sendBeacon` or fingerprint use · zero
runtime dependencies, only peers; no install hooks; `files` limited to `dist`, `docs/llms-full.md`,
`CHANGELOG.md`; no source maps, no local paths; `npm audit` clean · `__proto__` in wording, formats and
dashboard views pollutes nothing · `Link external` sets `rel="noopener noreferrer"` · CSV and the
selection's TSV quote quotes, separators, tabs and newlines correctly, with a BOM and CRLF.
