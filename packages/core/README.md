# @umriss-ui/core

A React component library for data-dense dashboards, monitoring and tools:
forms, date pickers, overlays, a tree view and a command palette.
Guiding idea: **precise and quiet, with palpable quality** – depth comes from
soft shadows and fine light edges, not from hard outlines or effects.

The design language — "Ink & Paper", the dark theme, motion — is written down
once for all five packages in [`../../docs/design-language.md`](../../docs/design-language.md).

## Use

```bash
pnpm add @umriss-ui/core
```

The demo is the documentation.
Every prop of a props table is linked to the examples that show it, 27 pages
open with a configurator, an API index lists every export, one search finds
across all five packages, and the header switches the examples to German.
For a coding agent the same material stands as one Markdown file inside the
installed package, `docs/llms-full.md`, pinned to that version — every page
with its examples' source, its props tables and why it is built as it is, and
an index of every export with its comment and its declaration. The running documentation of a version is opened as [the repository README describes](https://github.com/romanhaendler/umriss-ui#see-it-running): check out the tag `<package>-v<version>`, then `pnpm start`.
In an application:

```tsx
import { Button, Card } from "@umriss-ui/core";
```

Nothing else is required. React 19 or newer as a peer. TypeScript 5.4 or newer (the declarations use `NoInfer`).

The package ships ES2022 syntax; an application that serves older browsers
transpiles it itself.

Every entry, `./wording/de` included, begins with `"use client"`, the directive a framework
with Server Components reads to treat a module as client code. Core's components render from a
Server Component with props React can serialise; a function prop (a handler, a render prop) is
callable only in a client file. No test runs inside such a framework: the package is rendered to a
string in a test, and the fields' widths a server writes into the markup are checked there.

### Server Components

A Server Component fetches the data and hands it to a Client Component. The views - table, chart,
schedule, dashboard - are declared by their hook, so the declaration stays in a client file next to
them, with its `rowKey`, columns and formatters. Only the rows cross the boundary:

```tsx
// app/orders/page.tsx - a Server Component
import { OrdersTable } from "./orders-table";
import { loadOrders } from "@/lib/orders";

export default async function Page() {
  return <OrdersTable rows={await loadOrders()} />;
}
```

```tsx
// app/orders/orders-table.tsx
"use client";
import { useTable } from "@umriss-ui/table";
import type { Order } from "@/lib/orders";

export function OrdersTable({ rows }: { rows: Order[] }) {
  const { Table, Column } = useTable(rows, { rowKey: (o) => o.number });

  return (
    <Table ariaLabel="Orders">
      <Column value="number" label="Order" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="quantity" label="Quantity" />
    </Table>
  );
}
```

On a server, and until the page has hydrated, a date or time is empty, because only the browser
knows the reader's zone.

The calculation is the one view a Server Component writes itself: its tree is read where it is
written (see `@umriss-ui/calculation`). The reasons are in
[ADR-0067](../../docs/adr/0067-a-server-component-hands-umriss-its-data-and-writes-only-a-calculation.md).

### What an import costs

An application whose bundler shakes the tree pays for what it imports, not for
the package. Minified and gzipped, the stylesheet not counted: an import that
uses nothing 1.1 kB, `Button` 5.2 kB, `Select` 9.4 kB, `DatePicker` 10.4 kB,
everything 50.7 kB. The figures come from bundling an entry that imports from
the built `dist/core.js` with Rollup - the peers external, the stylesheet
resolved to nothing - then minifying with esbuild and gzipping. `check:dist`
holds the first of them under 1.5 kB in every package.

## Styles

**They load themselves.** `dist/core.js` imports its stylesheet, and the
manifest marks CSS as a side effect, so a bundler keeps it. The stylesheet stays
exported as `@umriss-ui/core/styles.css` for setups that link stylesheets by
hand; nobody has to import it.

**They touch nothing else** (ADR-0021). No rule selects `html`, `body`, `*` or a
native element of the page, and the only rules on `:root` declare the tokens.
Each component carries what it needs itself: its type, `box-sizing` on its own
elements, a focus ring on what it makes focusable. A caller's content inside
`Stack` or `Grid` keeps the caller's type.

**Everything can be overridden.** The library's rules lie in three cascade
layers, `umriss.tokens`, `umriss.base` and `umriss.components`, and CSS written
outside a layer wins over all of them, whatever the order of loading:

```css
:root {
  --u-font-sans: "Inter", system-ui, sans-serif;
  --u-color-accent: #0f766e;
}
```

**Layered CSS of your own.** The order of the layers decides who wins, so
declare it before anything else is read.

- Tailwind v4: this line as the first CSS the page reads, before
  `@import "tailwindcss"`. Utilities then win over umriss, and Tailwind's
  preflight stays below it.

  ```css
  @layer theme, base, umriss.tokens, umriss.base, umriss.components, components, utilities;
  ```

- A wrapper library: this line as the first statement of its stylesheet,
  with its own layer in place of `acme`. It holds in either load order.

  ```css
  @layer umriss.tokens, umriss.base, umriss.components, acme;
  ```

Unlayered CSS always wins. A classic unlayered reset (Bootstrap and the like) is
not fixed by layer order.

**Light and dark follow the application's `color-scheme`.** Every token with
two values is written `light-dark(<light>, <dark>)`. An application that
switches its mode with a theme library usually sets `color-scheme` already;
one with a switch of its own writes one line, which its native controls need
anyway:

```css
html.dark { color-scheme: dark; }
:root { color-scheme: light dark; } /* or: follow the system */
```

An application that sets nothing stays light. A part of a page can be dark on
its own (`.panel-dark { color-scheme: dark; }`).

A mode set in CSS - an own rule, Bootstrap, DaisyUI - works in every build.
Where a build lowers `light-dark()` (Vite 8 and Next 16 by default), a mode set
only from JavaScript or through a variable - next-themes, MUI, Mantine, an
inline `style` - stays light. Then write one rule such as
`[data-theme="dark"] { color-scheme: dark; }`, or raise the CSS target to the
browser floor: Vite `build: { cssTarget: ["chrome123", "firefox120", "safari17.5"] }`,
Next a `browserslist` in `package.json`
(`"chrome >= 123", "firefox >= 120", "safari >= 17.5"`).

**Fonts are the application's.** The tokens name Geist first and end in the
system fonts; nothing is loaded. Geist is recommended — `@fontsource/geist-sans`
(400, 500, 600) and `@fontsource/geist-mono` (400) — and any other face is one
token away.

**Browsers:** Chrome 123, Firefox 120, Safari 17.5 or newer. `light-dark()` is
older nowhere; an older browser discards the tokens and shows the interface
unstyled.

## Testing

Tested: Vitest 5 and Jest 30 (with babel-jest), both on jsdom. happy-dom and Jest 29 may work and are
not promised. `check:dist` runs a test of the installed package in a Vitest project and a Jest project
that hold exactly the files below.

**Vitest** needs one line, `server.deps.inline`: Vitest hands a dependency to Node, and Node cannot
import the stylesheet that the package's JavaScript imports (`Unknown file extension ".css"`). Inlined,
Vitest's own pipeline handles it.

```ts vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./umriss.setup.js"],
    server: { deps: { inline: [/@umriss-ui/] } },
  },
});
```

**Jest** needs two settings: `moduleNameMapper` maps every stylesheet to an empty module, and
`transformIgnorePatterns` lets babel-jest compile the package, which ships ES modules. Babel's config
must apply to `node_modules`, so it is a root `babel.config.*`, not a `.babelrc`.

```js jest.config.cjs
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/umriss.setup.js"],
  moduleNameMapper: { "\\.css$": "<rootDir>/css-stub.cjs" },
  transformIgnorePatterns: ["/node_modules/(?!(@umriss-ui)/)"],
};
```

```js css-stub.cjs
module.exports = {};
```

```js babel.config.cjs
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
};
```

**Next.js** with `next/jest`: put the umriss packages in `transpilePackages`; the preset stubs the
stylesheets and compiles the packages itself.

**The setup file** gives jsdom the five browser APIs that core's components use. It is the same file
for both runners:

```js umriss.setup.js
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};

window.matchMedia ??= (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
});

Element.prototype.scrollIntoView ??= function () {};

/* jsdom knows <dialog> but not showModal() and close(). */
HTMLDialogElement.prototype.showModal ??= function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close ??= function (value) {
  if (!this.hasAttribute("open")) return;
  this.removeAttribute("open");
  if (value !== undefined) this.returnValue = value;
  this.dispatchEvent(new Event("close"));
};
```

**End-to-end suites.** The motion follows `prefers-reduced-motion`, so a Playwright suite turns it off
with `reducedMotion: 'reduce'` in `use`. A tool without that switch sets, on `:root`, the tokens the
reduced-motion block sets to `0ms`: `--u-transition`, `--u-duration-press`, `--u-duration-fast`,
`--u-duration-medium`, `--u-duration-draw`, `--u-delay-draw`, `--u-duration-exit-fast`,
`--u-duration-exit` and `--u-duration-exit-collapse`.

## Wording

English is the default wording. German ships as well, as the subpath export
`@umriss-ui/core/wording/de`, and an application takes it on purpose:

```tsx
import { UmrissProvider } from "@umriss-ui/core";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";

<UmrissProvider language={{ wording: GERMAN_WORDING }}>…</UmrissProvider>;
```

Both objects are typed `Wording`, so a missing entry is a compile error rather
than a gap that shows up in the interface (ADR-0018, ADR-0019). An
`UmrissProvider` without `language`, nested for a toast or a density, keeps the
language around it.

The formats — dates, numbers, durations — are a seam of their own. The default
is English notation on a 24-hour clock (`17/03/2026`, `09:05`, `1,234.5`), and
the same subpath ships `GERMAN_FORMATS` beside the German wording, so a German
application takes both halves of its language in one import (ADR-0024):

```tsx
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";

<UmrissProvider language={{ wording: GERMAN_WORDING, formats: GERMAN_FORMATS }}>…</UmrissProvider>;
```

## Components

The table is not part of this package. It lives in
**`@umriss-ui/table`**:
`useTable` with columns as elements, `Toolbar`, `Search`, `ColumnMenu`, `Export`,
`Pagination` and `VerdictColumn`. That package takes
`@umriss-ui/core` as a peer and reads its provider, formats and wording.

| Component | Purpose |
| --- | --- |
| `Button` | variants primary/secondary/ghost/plain/danger, sizes, loading state |
| `IconButton` | a square button that shows only an icon; its required `aria-label` is the name and the tooltip |
| `FormField` / `FormFieldBoundary` | label, help text, error; wires `id`/`aria-*` automatically through context. `FormFieldBoundary` resets the context inside panels so that their contents do not inherit the trigger's field id |
| `Textarea` | multi-line input; grows with its content on request (`autoGrow`, `maxRows`), character counter (`showCount`) |
| `RadioGroup` | one out of a few, each option with an optional explanatory line; one tab stop, arrow keys select |
| `SegmentedControl` | one out of a few short options, drawn inset - a sunken track, the choice lifted out of it - or as a `field`; `fill` shares its place equally, an option takes an `icon`; a radio group to the keys and the screen reader |
| `Alert` | a message that stays; five tones, actions, closable on request – the role follows the tone |
| `Tag` / `TagGroup` | a removable label; one tab stop and arrow-key navigation within the group |
| `Divider` | a dividing line beside Stack and Grid: horizontal/vertical, two weights, optionally with a label |
| `VisuallyHidden` | text for the screen reader only; `focusable` turns it into a skip link |
| `ButtonGroup` / `SplitButton` | connected buttons; a main action plus variants through the existing menu |
| `Text` / `Heading` / `Link` | typography on the token scale; for `Heading`, level and size are independent |
| `Input` / `Select` / `Checkbox` | form elements; `Input numeric` in Geist Mono, `Input clearable` with a softly fading-in × button (clears without losing focus); `Select` a native `<select>` that opens the Combobox's list under a mouse and the keys and the system's picker under a finger (ADR-0043); `Checkbox indeterminate`; every field fills its place or is its natural width, never what it shows, and takes `chars` for a width in characters (ADR-0041) |
| `Modal` / `ModalHeader` / `ModalBody` / `ModalFooter` | dialogs built on `<dialog>`; free space is distributed in the golden ratio (38 : 62) above and below the surface – small modals sit in the upper third, long ones use the full height, and only the body scrolls while head and foot stay put |
| `ConfirmDialog` | a compact confirmation dialog, `tone="danger"` for destructive actions, loading state |
| `ToastProvider` / `useToast` | passing messages as a deck at one of six places: four tones and `loading`, one action, `update` in place, a close reason, a limit, Alt+T, `aria-live` |
| `Menu` / `MenuItem` / `MenuSeparator` | a dropdown menu with a portal panel, arrow-key navigation, `tone="danger"` |
| `ContextMenu` | the same menu opened at a point in the viewport - for a right-click on a surface that is not a button; controlled, focus returns to where it was |
| `Tooltip` | help text on hover and keyboard focus, inverted (ink surface), portal |
| `Tabs` / `TabList` / `Tab` / `TabPanel` | controlled tabs with an ink underline and arrow-key control |
| `Skeleton` | a loading placeholder (bar or circle) with a discreet pulse |
| `EmptyState` | an empty state with title, description, action and an optional symbol |
| `Stack` / `Grid` | layout primitives with token spacing (a 4 px step), `Grid` with a fixed count, a width per column (`columns={[140, "fill"]}`) or responsive via `minItemWidth` |
| `DatePicker` | calendar selection: weeks from Monday, arrow keys across the month, today/clear, the date in Geist Mono |
| `DateTimePicker` | date plus time: two-digit fields that advance automatically, visible up/down steppers and arrow-key counting; after the day is chosen the focus jumps into the time, `withSeconds`, "now"; the clock change is handled honestly – a missing hour (the start of summer time) is detected and corrected forwards with a note, a duplicated hour (the start of winter time) offers the choice between both occurrences including the UTC offset |
| `Combobox` | a searchable select field (listbox panel, arrow keys, `aria-activedescendant`), optionally `clearable`; `Input`'s two sizes |
| `MultiSelect` | multiple selection: the field always stays on one line and measures the space (as many chips as fit, the rest as "+N"); chips are remove buttons (hover shows ×, a click deletes, backspace deletes the last, roving tabindex with arrow keys), and the "+N" counter opens the selected view directly; a panel with a search field (autofocus, Enter toggles the first hit), a view switch "all \| selected (N)" (the list always in natural order, deselected rows stay visible in the selected view until the view changes), and all/none/invert acting on the filtered set of the active view; optionally `clearable`, a × that empties what "none" would, its room kept in the field's width; `Input`'s two sizes |
| `Card` / `CardHeader` / `CardBody` | panels with an eyebrow, actions, optionally collapsible; `flush` for borderless tables; a dividing line under the head only through `divider` (for borderless data) – otherwise white space carries the hierarchy |
| `Badge` | a status label with a dot, five tones; slightly rounded by default, `pill` for counters |
| `NumberInput` | numeric input in the notation the formats seam provides (group separators on leaving the field; it reads back what it writes, whatever the notation), `decimals` (0 = whole numbers), `min`/`max`, arrow keys with Shift ×10, an integrated spinner column at the right inner edge, `prefix`/`suffix` adornments (€, %) |
| `Meter` | a narrow fill bar (0–1) with a mono percentage label, five tones – for utilisation in cells; `label` names what is being measured |
| `ControlSizeProvider` | one size for the controls in a place - a toolbar, a dense form: every control with `size` inside takes it unless it says its own. A popover, dialog or tooltip opened from there starts without it |
| `UmrissProvider` | one place to set things: density, portal target, toasts, language. **Optional** – without it everything behaves as it does unconfigured. It holds no theme (light and dark are the application's `color-scheme`) and writes nothing onto the document |
| `LanguageProvider` / `useFormats` / `useWording` | formatting and wording as an overridable seam; the wording is a directory of entries, not a translation call. English is the default, German ships as `@umriss-ui/core/wording/de` |
| `DateRangePicker` | a period in two clicks across two chained months: backwards is allowed (the ends swap silently), a preview band on hovering, quick choices from the wording; on a phone the months stand one below the other |
| `DateTimeRangePicker` | a period with a time at both ends: "all day" as the default, time fields that advance, Enter accepts; the clock change is handled per end |
| `Popover` | the one closable, anchored surface underneath Menu, Combobox and the pickers: portal (nearest `<dialog>`, then the portal target, then the body), position with flipping above and below and across its trigger's edges, a panel that fits nowhere cut to the larger side instead of laid over its trigger, clamping as the last resort, never larger than the window (it scrolls in itself beyond that), outside click, Escape with focus returned |
| `TreeView` / `TreeSearch` / `useTree` | a tree with exactly one active node and optional ticking (cascade, indeterminate, locked, unloaded); arrow keys, type to jump, range selection, virtualisation. The search keeps its term in the tree |
| `Stat` | a metric: one value, read against its limits – the verdict as a word and a colour, the deviation from the target value, history and freshness |
| `CommandPalette` / `useCommandPaletteShortcut` | a command palette: subsequence search with rank and highlighted finds, groups, keywords a candidate is found by, at most `maxFinds` finds with a line for the rest, a populated resting state; opens on Ctrl/⌘+K and `/` |
| `CrossGlyph` / `PlusGlyph` / `MinusGlyph` / `AngleGlyph` / `CalendarGlyph` / `ClockGlyph` / `GripGlyph` / `GridGlyph` / `MeasureGlyph` | the shared character set, one stroke width at one nominal size; specification in `docs/glyphs.md` |
| `Sparkline` | a miniature history line with an area gradient and an accent end point – for trends in cells |
| `Spinner` | a functional loading indicator |
| `Switch` | on or off, taking effect at once: a native checkbox under `role="switch"`, the label beside it, two sizes, invalid through `FormField`; the thumb travels on the path transition |
| `Slider` | one value between two bounds on the native range input, drawn with tokens: `min`/`max`/`step`, marks with optional words, `format` for the mono readout and `aria-valuetext`; arrows, PageUp/PageDown by a tenth, Home/End - the same on every engine |
| `Drawer` | the `Modal`'s dialog entering from an edge (`side="right" \| "left"`): focus trap, Escape and focus return from the browser, `ModalHeader`/`ModalBody`/`ModalFooter` inside, its width the token `--u-drawer-width`; modal only |
| `ProgressBar` | how far a task has come (`role="progressbar"`), determinate from 0 to 1 or indeterminate without a value; `valueText` for a count; no tone, because progress is no verdict - that is the `Meter` |
| `Accordion` / `AccordionItem` | sections behind headers that are buttons with `aria-expanded`: `type="single" \| "multiple"`, controlled or uncontrolled, arrow keys between the headers; the height animates as the card's collapse does |
| `Breadcrumb` | where a page stands: `<nav>` with an ordered list, the last item `aria-current="page"`, items as links or buttons (routing is the caller's); when narrow the middle levels fold into a `Menu`, measured rather than guessed |
| `Splitter` | two panes and the line between them (the APG window splitter): side by side or stacked, the first pane's share in per cent, controlled or uncontrolled, `min`/`max`; drag, the arrows of its axis, Home/End, Enter collapses and restores |
| `Stepper` | where a procedure stands: an ordered list of steps, done, current (`aria-current="step"`), upcoming or failed - each said as a word beside its label and drawn as a number, tick or cross; in a row or a column; moving on is the caller's |
| `FileInput` | the native file input behind a key, inside a zone that takes a drop: `accept` and `multiple` hold for the drop as for the dialog, the chosen files listed with their size and a cross each, controlled or uncontrolled, invalid through `FormField`; no upload |

## Principles for new components

1. Pass `ref`, `className` and `...rest` through to the root element –
   every component that renders a root element. Excepted are the wrappers that
   have none: `Popover` renders into a portal, `Tooltip` around the caller's
   child, `Menu`, `ContextMenu` and `ToastProvider` are composed of other
   parts, and the providers render no element at all. The ref goes
   to the element a caller lays out: the `<dialog>` of `Modal`, `Drawer`,
   `ConfirmDialog` and `CommandPalette`, the field's wrapper of the pickers
   and the combobox family, the `role="tree"` list of `TreeView`. The native
   fields that wear a wrapper (`Checkbox`, `Switch`, `Slider`, `NumberInput`,
   `Select`, `FileInput`, `Input`, `Textarea`) put the class and the style on
   the wrapper - what a caller dresses and sizes - and ref and rest on the
   control (ADR-0041). The pickers and the combobox family take a caller's
   `aria-label`, `aria-labelledby` and `aria-describedby` out of the rest and
   put them on the field that has the focus. The component's own
   `role`, the `aria-*` it computes and its handlers are not replaced by
   `rest`: a caller's handler runs first and can `preventDefault`. Held by
   `tests-unit/passthrough.test.tsx`, which renders every export.
2. Support controlled **and** uncontrolled use (`value`/`defaultValue`).
   Deliberately controlled only: `Combobox` and `MultiSelect` – the field keeps
   no second state beside the caller's – as well as `Modal`, `Drawer` and
   `CommandPalette`, because opening is the caller's decision.
3. Keyboard operation and `aria` attributes are part of the definition of done.
4. No business logic: a mapping such as "status X is green" is the application's
   to make.
5. Tokens only, no raw values. A new value is created as a token first. No
   selector reaches beyond the component's own elements, and every rule lies in
   a layer (ADR-0021; the guards in `tests-unit/stylesheets.test.ts` hold it).
6. Everything is English – identifiers, props and prose (ADR-0018, which
   reversed ADR-0015). What still stands from ADR-0015 is the spelling of the
   accessible name: it is `aria-label` where it names the root element, and
   `ariaLabel` only where it does not.
7. A field's root composes `extent` from `#own-styles`: it fills the place
   that gives it a width, is its natural width where the place asks, and is
   never wider than its place; what it shows never moves it (ADR-0041). A field
   that shows text takes `chars` and sets its chrome; every control with two
   heights takes `size` and reads it through `useControlSize`, so a
   `ControlSizeProvider` reaches it, and a surface of its own resets it.
   Held by `tests-unit/controlSize.test.tsx` and
   `tests-visual/features-sizes.spec.ts`. Two exceptions, by design: the
   `SegmentedControl` stands among fields but shows no value, so it is as
   wide as its words (`fit-content`) and fills a place only when told to
   (`fill`); and the `Checkbox`
   has one look and no `size` - in a field it reads the place's size only
   for the height of the row it stands in (field-row-alignment).

## Roadmap

The core scope is complete, and so are the command palette, the
danger text tone, the pass-through of rules 1 and 2 above, the six basic
components and the layout extras, forced colours, the listbox
announcements, and the fields' widths and sizes (ADR-0041).

What core will not build at all stands in
[ADR-0032](../../docs/adr/0032-what-umriss-is-not.md). Validation is the
caller's, and umriss shows the reader's time
([ADR-0060](../../docs/adr/0060-validation-and-a-layout-editor-are-never-time-zones-not-yet.md)); a dashboard
a user arranges is its own package, `@umriss-ui/dashboard`
([ADR-0064](../../docs/adr/0064-a-dashboard-a-user-arranges-is-a-sequence-on-fixed-columns.md)).
