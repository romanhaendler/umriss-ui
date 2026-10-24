# Shakedown: @umriss-ui/core 0.40.4

Status: needs-triage

Eleven host applications installed the packed tarball the way a customer does and tried to break core:
seven technical hosts (Next.js App Router, hostile CSS, consumer test runners, strict TypeScript, a busy app
with foreign overlays, forms, odd lifecycles and documents) and four customer personas (a total beginner, a
junior under deadline, a staff engineer evaluating adoption, an AI-assisted "vibe coder"), plus a product
designer for layout and design. Run on 2026-10-24.

The hosts and their repro scripts were built in a session scratch directory that does not outlive the
session; the repro column names the script so a rerun can rebuild it. ✓ marks a finding the coordinating
session reproduced or confirmed in the source itself.

## A. Critical: hits many apps that did nothing wrong

| # | Finding | Where / cause | Repro |
|---|---|---|---|
| A2 ✓ | ~~**A click inside a Popover, Menu, MenuItem or DatePicker panel within a Modal or Drawer closes the Modal.**~~ **Fixed 2026-10-24** (spec `.scratch/shakedown-defects/`). | `Modal.tsx:129` tests `sheetRef.contains(target)`; the panels portal into the `<dialog>` (`lib/portalTarget.ts:28`), beside the sheet. | busy-app `t9.mjs` |
| A3 ✓ | **Vitest with its default config fails on the first import** (`Unknown file extension ".css"`). Jest 29/30 cannot resolve the package at all (`exports` has only an `import` condition). | `dist/core.js` imports `core.css`; `exports` has no `default`. Workarounds: `server.deps.inline: [/@umriss-ui/]`; for Jest a moduleNameMapper per entry, a CSS stub and `transformIgnorePatterns`. Documented nowhere. | minimal Vitest 5 app, `npx vitest run` |
| A4 ✓ | ~~**`ToastProvider` throws when server-rendered**~~ (`HTMLDialogElement is not defined`); `next build` fails when it stands in the root layout, as the docs show. **Fixed 2026-10-24** (spec `.scratch/shakedown-defects/`). | `Toast.tsx:333` evaluates `instanceof HTMLDialogElement` during render; `useHold.ts:9` likewise. | Next host with ToastProvider in `app/layout.tsx`; `react-dom/server` render in Node |
| A5 ✓ | **The published d.ts fails under `exactOptionalPropertyTypes` with `skipLibCheck: false`** (TS 5.0, 5.4, 7; every resolution mode). | `lib/refProp.ts:13` declares `ref?: Ref<E>`, not `ref?: Ref<E> \| undefined`. core checks itself with `skipLibCheck: true`. | tsconfig matrix, `import { Button }` is enough |

## B. Important: hits common set-ups

- **B1 ✓ Forms:** Combobox, MultiSelect and DatePicker take no `name` and are missing from `FormData` (native forms, React 19 actions, server actions).
- **B2 Foreign dialogs (Radix, shadcn, Headless UI):** core's Popover, Menu and Tooltip inside them are invisible (`--u-z-popover` 900 below a typical 2000, plus `body{pointer-events:none}`); Escape closes both layers (`Popover.tsx:196`, no `stopPropagation`); ConfirmDialog and CommandPalette above them cannot be clicked.
- **B3 ✓ Shadow DOM and iframes:** a click *inside* a Popover closes it (`Popover.tsx:171`, `event.target` is retargeted; `composedPath()[0]` fixes it). Without `portalTarget`, overlays, toasts and the announcer leave the shadow root or iframe for the main document; listeners hang on the global `document`. Styles do not reach a shadow root, and no recipe is documented. **Partly fixed 2026-10-24:** a click inside a Popover in a shadow root keeps it open; portalling, styles and listeners in a shadow root stay open.
- **B4 `ref.focus()` does nothing** on Combobox, MultiSelect, the pickers, RadioGroup, Tabs and TagGroup (the ref is on a wrapper); react-hook-form `setFocus` fails.
- **B5 ✓ Contrast:** `--u-color-text-muted` (hints, counters, eyebrows, placeholders at 11–13 px) is 3.41:1 light and 4.07:1 dark, below AA; axe flags 8 nodes. The `TextTone` doc promises it never falls below the threshold. No ADR decides otherwise.
- **B6 Modal:** no scroll lock, although the doc says "scroll lock comes from the browser"; it opens with focus and a tooltip on the close cross.
- **B7 Tailwind v4:** depending on import order either utilities (`bg-*`) lose to umriss, or preflight wrecks Modal, Toast and Tabs. The line that works, before core: `@layer theme, base, umriss.tokens, umriss.base, umriss.components, components, utilities;`.
- **B8 Bootstrap and classic resets:** `label{display:inline-block}` breaks Switch, `h1–h6` inflate the Modal title, `*{margin:0;padding:0}` and `button{all:unset}` wreck Buttons and Modals.
- **B9 Theming:** the README example sets only `--u-color-accent`, which leaves the UI half in the new colour and half petrol; `on-accent` stays 3.23:1 in dark. The full set of seven tokens is only in `llms-full.md`.
- **B10 Consumer tests:** the announcer and its 150 ms timer are module state, survive RTL `cleanup()` and carry text into the next test. jsdom needs five polyfills (ResizeObserver, showModal, scrollIntoView, matchMedia, IntersectionObserver), documented nowhere.
- **B11 Types:** `ToastContextValue`, `FormFieldContextValue` and `Instant` are not exported (wrapper libraries hit TS4058); `wording/de` does not resolve under `node10` (no `typesVersions`); `styles.css` has no types (TS 6/7: TS2882); `Tooltip.children` and `Menu.trigger` are `ReactElement<Record<string, unknown>>`.
- **B12 README principle 2 does not hold:** NumberInput and every picker are controlled only (no `defaultValue`), and the README does not list them as exceptions. A server component cannot render one, even read-only.

## C. Traps for beginners (silent or unreadable)

- A wrong type passed to DatePicker or MultiSelect blanks the whole app with a minified error (`e.getFullYear is not a function` in `<Tp>`).
- `Stat value="3.42"` shows "No value"; an ISO string as `asOf` shows a red "No connection"; no warning.
- Options as plain strings (Select, Combobox, MultiSelect) give an empty list and no warning. `label=` on Input or Select is ignored silently. `ModalHeader` with children instead of `title` renders an empty `h2`.
- `Modal open` without `onClose` (JavaScript): Escape closes the native dialog, then throws `n is not a function`, and the state drifts apart.
- `onChange` differs: Input and Select pass events, DatePicker and NumberInput pass values.
- German NumberInput: typing `1.5` silently becomes 15.
- Combobox and MultiSelect: typing into a field that has a value appends to the label ("Alphabr").

- Core's README Roadmap still says "a dashboard a user arranges is never built", while the dashboard package
  exists (ADR-0064 superseded that part of ADR-0060). Core's README has no form example; a beginner finds the
  "Set up a team" scenario by Ctrl+F.

## D. Layout and design

- DatePicker panel at a 32 px root: weekday names run together, Sunday is cut off (contradicts the last release).
- NumberInput clips its value (`1.234.567,89`); with a long `suffix` the number disappears entirely.
- Stacked FormFields have no gap; an error text touches the next label.
- DatePicker and MultiSelect are too narrow in a form row (`17/03/…`, `Alp…`).
- Badge and Tag overflow their parent; Stat as a flex item without a width collapses to about 34 px.
- MultiSelect shows different chips in Chromium and WebKit.
- A toast at bottom-end covers a Drawer's footer button.
- Disabled ghost and plain buttons are 1.6–1.9:1; the focus ring on a danger button is 1.3:1 against the red.
- The Select panel is 4 px narrower than its field and a long option cannot be read; TreeView labels have no `title` or tooltip.
- Row menu triggers are 26×26 px (touch); a Drawer at 375 px is the whole screen for two buttons; the Splitter is nearly invisible at rest.
- A Popover stays put when its anchor scrolls out of a scroll container or under a sticky header.

## E. Gaps (feature decisions, not defects)

- DatePicker: no year or month jump, no typing, no `min`/`max`; a birthday in 1985 takes about 480 clicks. APG keys Home, End, PageUp and PageDown are missing, no `role=grid`.
- MultiSelect with 10,000 options opens in 2.4 s at 4× CPU (not virtualised; `useVirtual` exists). No async options, groups or custom option rendering.
- Button has no `lg` and no full width; Menu does not open with the arrow keys (APG); overlay vocabulary differs (`onClose` vs `onOpenChange`, Menu has neither).
- Agent docs: the online `llms.txt` is a small index (18 KB, about 4.5k tokens) and fine in size. The full file, `llms-full.txt` online and `docs/llms-full.md` in the package, is 928,610 characters, about 232k tokens. The `llms.txt` tells an agent to prefer the packaged `llms-full.md` once installed, but the package ships no index and no per-page files, so an agent with only the installed package has only the 232k-token file. Its first 23k tokens are scenarios that import the sibling packages without an install note; its API index does not find "notification", "shortcut" or "dark mode". In the online `llms.txt`, all five scenario links point to the same `index.md` without an anchor.
- The whole stylesheet (143 kB, 22 kB gzipped) ships for one Button. Two copies of the library share no context, and the error text gives no hint.
- Sparkline puts `aria-label` on a role-less `span` (axe, serious). Reported, not confirmed.

## F. Held up

No leaks after 50–100 mount cycles (listeners, timers, body nodes, `inert`, body style) · strict CSP without a violation · Next hydration without a single warning (ids, dates, German formats, freshness) · no rule touches a host element (30 elements measured) · cascade layers lose to unlayered host CSS as promised · StrictMode clean · live updates every 500 ms keep focus, scroll and open overlays · TreeView with 10,000 nodes at 60 fps · forced colours and reduced motion · wording types catch a missing key · 258 of 260 doc examples compile · bundle sizes within 8 % of the README · heights and radii in a field row identical to the pixel in Chromium and WebKit · React 19 actions and react-hook-form `register` work.

## What umriss can do

2. **Small fixes, each a few lines with a red test first:** A2, A4, A5, the shadow-DOM click (B3), the missing type exports and `typesVersions` (B11).
3. **Keep it from coming back:** a smoke check that builds the packed tarball in a fresh Vite 8, Next and Vitest app. umriss's own checks cannot see the consumers' toolchains today.
