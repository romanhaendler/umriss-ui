# Shakedown: the hosts and the personas

Each entry is one subagent's task, handed over together with `brief.md`. **Hosts** test a set-up; **personas**
are customers who build something and judge it. "Run" names the run that used the entry last; an entry
without one has not run yet. Add an entry when a run finds a blind spot; drop one that stops finding anything.

Every task also names the agent's directory under the scratch directory and its port range.

## Hosts

### H1 Build toolchain - all packages
Vite (latest) production build **with default settings** and with `cssTarget`; Next.js App Router (latest,
Turbopack and webpack): components in a Server Component page and layout, props across the server/client
boundary (data, Dates, functions), hydration with the browser in **another time zone** than the server;
`renderToString` in plain Node; tree-shaking and JS/CSS weight per import against the README's figures;
version skew (one package a patch behind). Run: 2026-10-24.

### H2 Consumer tests and types - all packages
Vitest (jsdom, happy-dom) and Jest (latest, babel-jest and ts-jest): does the first import work with default
config, which polyfills each package needs, can a test find things by role and name, act() warnings, fake
timers, cleanup leaks between tests. TypeScript matrix with `skipLibCheck:false`: strict,
`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`; the oldest still common
TS and the latest; resolution bundler, node16, nodenext, node10; generic inference; declaration emit from a
wrapper library (TS4058). Run: 2026-10-24.

### H3 Hostile CSS - core, then the others
Tailwind (latest) with preflight in both import orders, Bootstrap, classic resets (`*{margin:0}`,
`button{all:unset}`), `html{font-size:62.5%}`; screenshot diffs against a plain host; who wins between host
layers and umriss layers; host elements changed by the library's CSS; custom-property collisions; dark via a
`.dark` class; lazy routes and CSS order; root 32 px. Run: 2026-10-24 (core).

### H4 Busy app - core overlays
A host with a sticky z-1000 header, its own modal library (Radix/Headless UI) and toast library: who is on
top, who traps focus, Escape closes the right layer, focus return, overlays in `overflow:hidden`,
transformed, sticky and scrolling containers, global shortcuts in host inputs, scroll lock, `inert` left
behind, 50× mount/unmount listener counts. Run: 2026-10-24.

### H5 Forms - core fields
Native `<form>` with `FormData` and `reset()`, React 19 actions, react-hook-form (`register`, `Controller`,
`setFocus`), constraint validation, autofill, controlled edge cases (null, late values, rejected input),
labels; fields side by side with errors. Run: 2026-10-24.

### H6 Odd lifecycles and documents - core
StrictMode, transitions, Suspense, `<Activity>`, 100× mount/unmount leak counts, two React roots, two copies
of the library, an iframe, a shadow root, a strict CSP, a long-lived tab. Run: 2026-10-24.

### H7 Package hosts - one each for charts, table, schedule, calculation, dashboard
Real-world data at its edges (empty, huge, null, wrong types, DST, time zones, locales), containers (hidden
tab, height-less flex child, Modal, Splitter, print), live updates during interaction, touch and keyboard,
leaks. Per package: charts - theme switch at runtime, DPR, streaming; table - 100k rows, server mode with
out-of-order answers, CSV export; schedule - drag, DST labels, orphan references; calculation - whether shown
lines add up, rounding, negative and currency formats, print; dashboard - stored views after an app update,
a widget that throws or suspends, two tabs. Run: 2026-10-24.

### H8 Table export in every view mode
An oracle: the expected CSV computed independently from the raw rows and the documented state, diffed
character by character against the `Export` download, `onExport`, `asCsv()` and `selectionAsText()` - sorted,
searched, filtered, paged, virtual, hidden/reordered/pinned columns, `exportValue`, custom cells,
`VerdictColumn`, `GroupBy`, `RowDetail`, grouped with aggregates and folded groups, tree rows folded and
open, selection across pages and filters, server mode, both languages, odd numbers and Dates. Run: 2026-10-24.

### H9 Agent docs - all packages
`llms.txt` online and `docs/llms-full.md` installed: every link fetched, version against npm, online vs
installed diff, sizes in tokens, findability of everyday words, every code block type-checked, peer install
notes, the llmstxt.org shape. Run: 2026-10-24.

### H10 Zoom and text size on phones - all packages
iOS zoom on focus (every text-entry element below 16 px, both control sizes), pinch zoom over charts and the
schedule (WCAG 1.4.4/1.4.10), overlays while the page is pinch-zoomed, double-tap zoom on steppers and
calendar days, `text-size-adjust` in landscape, root 20/24 px, a focused field covered by the keyboard.
Run: 2026-10-24.

## Personas

### P1 Lena, total beginner
A React tutorial last week; the Vite **JavaScript** template, no TypeScript. Reads only the README, Ctrl+F in
`llms-full.md`, strips types from examples by hand. Makes the beginner's mistakes on purpose - value without
onChange, wrong argument shapes, strings for numbers and dates, options as strings, a forgotten provider,
misspelt props, missing peers, a stale stored dashboard - and judges whether each one gets a message that
tells her what to do. Time to the first working screen; 375 px. Runs: 2026-10-24 (a plant tracker on core;
a household budget on core, table, charts, dashboard, calculation).

### P2 Kai, junior under deadline
One year of React, `as any` when in doubt, a demo by tomorrow. Copies examples, adapts them carelessly, feeds
real backend shapes (numbers as strings, ISO and epoch timestamps, nulls, ids changing), live updates every
500 ms, themes it in the company colour in ten minutes. Judges what the team lead notices first. Runs:
2026-10-24 (a monitoring dashboard on core; a fleet-dispatch app across all packages with linked selection).

### P3 Dr. Petra Brandt, staff engineer
Evaluates for a five-year commitment, trusts no README claim until measured: every concrete promise checked,
an axe and keyboard audit against the WAI-ARIA APG patterns, scale (10k options, 5k tree nodes, 100k rows),
API consistency across components and packages, escape hatches for month 3, upgrade risk from the
CHANGELOGs. Credits what beats MUI, AG Grid, Highcharts, Bryntum. Runs: 2026-10-24 (core; the five others).

### P4 Jonas, vibe coder
A product owner whose coding agent may read only `llms-full.md`, the README and the d.ts. Seven plain-word
requests (login, a customer list with row menus, an edit dialog, German and dark, a toast with undo, a
drawer on the phone, Ctrl+K); for each, where the doc was wrong, missing or misleading. Run: 2026-10-24 (core).

### P5 Mara, senior product designer
Specimen pages of every component in every state, sizes, both themes, forced colours, viewports from 320 to
2560, root 24 px; pixel measurements of rows of mixed controls; Chromium against WebKit; the packages as one
family on a composed screen (type scale, number typography, tooltips, empty and loading states, nested
cards). Runs: 2026-10-24 (core; the family).

### P6 Sven, operator-screen developer
Fifteen years of SCADA/HMI front ends, ISA-101, alarm management per ISA-18.2. Builds an overview, an alarm
list and banner (priorities, states, acknowledge, shelve, floods), a trend screen, a faceplate with
setpoints and value quality, a shift log, a daily report; judges a week without reload, a 4K wall display, a
dark control room, a touch panel, no internet. Knows what Ignition, AVEVA, WinCC Unified and Grafana ship.
Run: 2026-10-24.

### P7 Mira, field-service app developer
A tablet and phone app for technicians with gloves, in sunlight, offline: hit areas against 44 px, safe
areas, overlays and the on-screen keyboard, mobile input attributes, `prefers-contrast`, a 6× slower CPU;
what a mobile app reaches for (bottom sheet, breakpoint hook, signature, photo capture). Run: 2026-10-24.

### P8 Jule, mobile UX researcher
Every interactive component of every package on iPhone and Pixel, beside the platform's native control,
with the same task, counting taps, swipes and characters. On desktop the library keeps its own design; on
touch she recommends either "keep the library control" or "hand over to the native one on `pointer:
coarse`", and names what the handover would lose. Run: 2026-10-24.

### P9 Ten everyday screens with core alone
Login, settings, a 15-field form, a wizard, notifications, upload, profile, search, an app shell, an admin
list of 200 users - what core covered, what was built by hand (lines), what was wished; a coverage diff of
core's exports against MUI, Mantine and Radix, each gap marked wished, not needed or never. Run: 2026-10-24.

### P20 Dr. Nele Hartmann, data scientist
Builds an analysis app on charts, table and calculation for data that comes out of pandas: JSON with NaN,
`None`, numpy ints and float noise, timestamps with time zones, column-oriented and typed arrays (Arrow,
`Float64Array`), a million points. Expects statistical views (histogram, box plot, scatter with a fit line,
error bars, confidence bands, a correlation matrix, small multiples), honest numbers (significant digits,
scientific notation, units, tooltip precision), and a way back out (copy to Jupyter or Excel, the data behind
a chart, reproducible state). Also embeds a component as a Streamlit custom component or a Jupyter widget
(anywidget). Run: 2026-10-24.

### P21 Frank, Power BI report author
Ten years of Power BI reports for controlling, some JavaScript, little React; wants the same reports on the
web, in the company's own app. Rebuilds a sales and an operations report and expects what Power BI gives
him: slicers that filter every visual on the page, cross-highlighting, drill-down along a date hierarchy
(year, quarter, month, day) and drill-through to a detail page, measures with time intelligence (YoY, YTD,
moving average), a matrix with row and column totals, conditional formatting, top N, KPI cards with targets,
waterfall and combo charts, tooltips with their own content, bookmarks and shareable filter state, report
pages, a theme file, export to PDF/PowerPoint and print, a phone layout. Run: 2026-10-24.

### P10 Anna, screen-reader user
Blind, an accountant, NVDA on Windows and VoiceOver on macOS and iOS every day. Automation cannot drive a
real screen reader, so she works from the accessibility tree (Playwright ARIA snapshots) and the live
regions' text over time: can she complete a form with errors, pick a date, filter and sort a table, read a
chart's values, follow a calculation, rearrange a dashboard - and is every announcement in German when the
wording is German? Names what only a manual NVDA/VoiceOver pass can settle. Run: 2026-10-24.

### P11 Keyboard-only and switch user
Motor impairment; keyboard only, sometimes a switch device (Tab and Enter only). Every task in every package
without a pointer: focus order, focus visibility on every surface, no keyboard traps, no shortcut that fires
from a single printable key in a text field, everything reachable with Tab and Enter alone. Run: 2026-10-24.

### P12 Low vision
400 % zoom and reflow at 320 CSS px (WCAG 1.4.10), Windows high contrast, a custom user stylesheet with
larger text and spacing (WCAG 1.4.12 text spacing), colour-blind simulation (CDP `setEmulatedVisionDeficiency`)
on verdicts, charts and the schedule. Run: 2026-10-24.

### P14 Design-system maintainer
Wraps umriss into the company's own design system: re-exports with own defaults, a full rebrand through the
tokens (colour, radius, font, density), own variants on top, a Storybook of the wrapped set, declaration
emit, and a version upgrade of umriss underneath without breaking the wrappers. Run: 2026-10-24.

### P15 Upgrader
An app written against an older minor (install it from npm) upgrades to the current one: does every
breaking change surface as a type error or a clear runtime message, and is each one listed in the
CHANGELOG's "Changed"? How long does the upgrade take? Run: 2026-10-24.

### P17 QA engineer
Writes the end-to-end suite of an umriss app in Playwright and Cypress: stable selectors (roles, names,
`data-testid` pass-through), checkboxes and switches (`.check()`), portals, animations and waits, visual
snapshots that do not flake (focus-ring fade, fonts), canvases. Run: 2026-10-24.

### P18 Security reviewer
XSS through labels, options, toasts, tooltips, wording and Markdown-ish props; `dangerouslySetInnerHTML`;
export injection (CSV, later XLSX); URLs in links and actions (`javascript:`); CSP with nonces; no network
requests and no telemetry; supply chain (dependencies, `postinstall`). Run: 2026-10-24.

### P19 Kiosk and embedded
A Raspberry Pi 4 class device or an old industrial panel PC (Playwright CPU throttling, a 1024×768 screen),
an Electron or Tauri shell, an old WebView at the browser floor: start-up time, memory over a week, fonts
missing, touch-only without a keyboard. Run: 2026-10-24.

## Proposed, not yet run

### P13 Third-language team
Brings French or Finnish as a third wording (ADR-0019 says any typed object will do): long translations that
break layouts, Swiss and French number formats, a 12-hour clock, week starting on Sunday; does every visible
string come from the wording, or does English leak through?

### P16 Migrating team
Moves a working screen from MUI plus AG Grid plus Highcharts to umriss: the effort per component, what has
no counterpart, which habits break (prop names, event shapes, controlled patterns).
