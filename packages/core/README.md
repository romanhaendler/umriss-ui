# Umriss UI

A React component library for data-dense applications.
Guiding idea: **precise and quiet, with palpable quality** – depth comes from
soft shadows and fine light edges, not from hard outlines or effects.

The design language — "Ink & Paper", the dark theme, motion — is written down
once for all five packages in [`../../docs/design-language.md`](../../docs/design-language.md).

## Use

```bash
pnpm add @umriss-ui/core
```

The demo is the documentation: <https://romanhaendler.github.io/umriss-ui/core/>.
For a coding agent the same material stands as one Markdown file inside the
installed package, `docs/llms-full.md`, pinned to that version — every page
with its examples' source, its props tables and why it is built as it is, and
the declaration of every other export; online, for the latest version,
<https://romanhaendler.github.io/umriss-ui/core/llms.txt>.
In an application:

```tsx
import { Button, Card } from "@umriss-ui/core";
```

Nothing else is required.

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
its own (`<aside style="color-scheme: dark">`).

**Fonts are the application's.** The tokens name Geist first and end in the
system fonts; nothing is loaded. Geist is recommended — `@fontsource/geist-sans`
(400, 500, 600) and `@fontsource/geist-mono` (400) — and any other face is one
token away.

**Browsers:** Chrome 123, Firefox 120, Safari 17.5 or newer. `light-dark()` is
older nowhere; an older browser discards the tokens and shows the interface
unstyled.

## Wording

English is the default wording. German ships as well, as the subpath export
`@umriss-ui/core/wording/de`, and an application takes it on purpose:

```tsx
import { UmrissProvider } from "@umriss-ui/core";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";

<UmrissProvider language={{ wording: GERMAN_WORDING }}>…</UmrissProvider>;
```

Both objects are typed `Wording`, so a missing entry is a compile error rather
than a gap that shows up in the interface (ADR-0018, ADR-0019).

The formats — dates, numbers, durations — are a seam of their own. The default
is English notation on a 24-hour clock (`17/03/2026`, `09:05`, `1,234.5`), and
the same subpath ships `GERMAN_FORMATS` beside the German wording, so a German
application takes both halves of its language in one import (ADR-0024):

```tsx
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";

<UmrissProvider language={{ wording: GERMAN_WORDING, formats: GERMAN_FORMATS }}>…</UmrissProvider>;
```

## Components

The table and the alarm list are not part of this package. They live in
**`@umriss-ui/table`**:
`useTable` with columns as elements, `Toolbar`, `Search`, `ColumnMenu`, `Export`,
`Pagination`, `VerdictColumn`, `AlarmList` and `alarmModel`. That package takes
`@umriss-ui/core` as a peer and reads its provider, formats and wording.

| Component | Purpose |
| --- | --- |
| `Button` | variants primary/secondary/ghost/danger, sizes, loading state |
| `FormField` / `FormFieldBoundary` | label, help text, error; wires `id`/`aria-*` automatically through context. `FormFieldBoundary` resets the context inside panels so that their contents do not inherit the trigger's field id |
| `Textarea` | multi-line input; grows with its content on request (`autoGrow`, `maxRows`), character counter (`showCount`) |
| `RadioGroup` | one out of a few, each option with an optional explanatory line; one tab stop, arrow keys select |
| `Alert` | a message that stays; five tones, actions, closable on request – the role follows the tone |
| `Tag` / `TagGroup` | a removable label; one tab stop and arrow-key navigation within the group |
| `Divider` | a dividing line beside Stack and Grid: horizontal/vertical, two weights, optionally with a label |
| `VisuallyHidden` | text for the screen reader only; `focusable` turns it into a skip link |
| `ButtonGroup` / `SplitButton` | connected buttons; a main action plus variants through the existing menu |
| `Text` / `Heading` / `Link` | typography on the token scale; for `Heading`, level and size are independent |
| `Input` / `Select` / `Checkbox` | form elements; `Input numeric` in Geist Mono, `Input clearable` with a softly fading-in × button (clears without losing focus); `Checkbox indeterminate` |
| `Modal` / `ModalHeader` / `ModalBody` / `ModalFooter` | dialogs built on `<dialog>`; free space is distributed in the golden ratio (38 : 62) above and below the surface – small modals sit in the upper third, long ones use the full height, and only the body scrolls while head and foot stay put |
| `ConfirmDialog` | a compact confirmation dialog, `tone="danger"` for destructive actions, loading state |
| `ToastProvider` / `useToast` | stacked status messages at the bottom right, four tones, auto-dismiss, `aria-live` |
| `Menu` / `MenuItem` / `MenuSeparator` | a dropdown menu with a portal panel, arrow-key navigation, `tone="danger"` |
| `ContextMenu` | the same menu opened at a point in the viewport - for a right-click on a surface that is not a button; controlled, focus returns to where it was |
| `Tooltip` | help text on hover and keyboard focus, inverted (ink surface), portal |
| `Tabs` / `TabList` / `Tab` / `TabPanel` | controlled tabs with an ink underline and arrow-key control |
| `Skeleton` | a loading placeholder (bar or circle) with a discreet pulse |
| `EmptyState` | an empty state with title, description, action and an optional symbol |
| `Stack` / `Grid` | layout primitives with token spacing (a 4 px step), `Grid` fixed or responsive via `minItemWidth` |
| `DatePicker` | calendar selection: weeks from Monday, arrow keys across the month, today/clear, the date in Geist Mono |
| `DateTimePicker` | date plus time: two-digit fields that advance automatically, visible up/down steppers and arrow-key counting; after the day is chosen the focus jumps into the time, `withSeconds`, "now"; the clock change is handled honestly – a missing hour (the start of summer time) is detected and corrected forwards with a note, a duplicated hour (the start of winter time) offers the choice between both occurrences including the UTC offset |
| `Combobox` | a searchable select field (listbox panel, arrow keys, `aria-activedescendant`), optionally `clearable` |
| `MultiSelect` | multiple selection: the field always stays on one line and measures the space (as many chips as fit, the rest as "+N"); chips are remove buttons (hover shows ×, a click deletes, backspace deletes the last, roving tabindex with arrow keys), and the "+N" counter opens the selected view directly; a panel with a search field (autofocus, Enter toggles the first hit), a view switch "all \| selected (N)" (the list always in natural order, deselected rows stay visible in the selected view until the view changes), and all/none/invert acting on the filtered set of the active view |
| `Card` / `CardHeader` / `CardBody` | panels with an eyebrow, actions, optionally collapsible; `flush` for borderless tables; a dividing line under the head only through `divider` (for borderless data) – otherwise white space carries the hierarchy |
| `Badge` | a status label with a dot, five tones; slightly rounded by default, `pill` for counters |
| `NumberInput` | numeric input in the notation the formats seam provides (group separators on leaving the field; it reads back what it writes, whatever the notation), `decimals` (0 = whole numbers), `min`/`max`, arrow keys with Shift ×10, an integrated spinner column at the right inner edge, `prefix`/`suffix` adornments (€, %) |
| `Meter` | a narrow fill bar (0–1) with a mono percentage label, five tones – for utilisation in cells; `label` names what is being measured |
| `UmrissProvider` | one place to set things: density, portal target, toasts, language. **Optional** – without it everything behaves as it does unconfigured. It holds no theme (light and dark are the application's `color-scheme`) and writes nothing onto the document |
| `LanguageProvider` / `useFormats` / `useWording` | formatting and wording as an overridable seam; the wording is a directory of entries, not a translation call. English is the default, German ships as `@umriss-ui/core/wording/de` |
| `Dock` | a tool strip over *one* surface: four named resting places at the edges of the host, moved by the grip (dragging snaps, the four arrow keys are the four places), orientation follows the edge; translucent material like the palette; a place without room refuses visibly; `mode` marks at most one tool and belongs to the caller |
| `DateRangePicker` | a period in two clicks across two chained months: backwards is allowed (the ends swap silently), a preview band on hovering, quick choices from the wording; on a phone the months stand one below the other |
| `DateTimeRangePicker` | a period with a time at both ends: "all day" as the default, time fields that advance, Enter accepts; the clock change is handled per end |
| `Popover` | the one closable, anchored surface underneath Menu, Combobox and the pickers: portal (nearest `<dialog>`, then the portal target, then the body), position with clamping and flipping, never larger than the window (it scrolls in itself beyond that), outside click, Escape with focus returned |
| `TreeView` / `TreeSearch` / `useTree` | a tree with exactly one active node and optional ticking (cascade, indeterminate, locked, unloaded); arrow keys, type to jump, range selection, virtualisation. The search keeps its term in the tree |
| `Stat` | a metric: one value, read against its limits – the verdict as a word and a colour, the deviation from the target value, history and freshness |
| `CommandPalette` / `useCommandPaletteShortcut` | a command palette: subsequence search with rank and highlighted finds, groups, a populated resting state; opens on Ctrl/⌘+K and `/` |
| `CrossGlyph` / `PlusGlyph` / `MinusGlyph` / `AngleGlyph` / `CalendarGlyph` / `ClockGlyph` / `GripGlyph` / `GridGlyph` / `MeasureGlyph` | the shared character set, one stroke width at one nominal size; specification in `docs/glyphs.md` |
| `Sparkline` | a miniature history line with an area gradient and an accent end point – for trends in cells |
| `Spinner` | a functional loading indicator |
| `Switch` | on or off, taking effect at once: a native checkbox under `role="switch"`, the label beside it, two sizes, invalid through `FormField`; the thumb travels on the path transition |
| `Slider` | one value between two bounds on the native range input, drawn with tokens: `min`/`max`/`step`, marks with optional words, `format` for the mono readout and `aria-valuetext`; arrows, PageUp/PageDown by a tenth, Home/End - the same on every engine |
| `Drawer` | the `Modal`'s dialog entering from an edge (`side="right" \| "left"`): focus trap, Escape and focus return from the browser, `ModalHeader`/`ModalBody`/`ModalFooter` inside, its width the token `--u-drawer-width`; modal only |
| `ProgressBar` | how far a task has come (`role="progressbar"`), determinate from 0 to 1 or indeterminate without a value; `valueText` for a count; no tone, because progress is no verdict - that is the `Meter` |
| `Accordion` / `AccordionItem` | sections behind headers that are buttons with `aria-expanded`: `type="single" \| "multiple"`, controlled or uncontrolled, arrow keys between the headers; the height animates as the card's collapse does |
| `Breadcrumb` | where a page stands: `<nav>` with an ordered list, the last item `aria-current="page"`, items as links or buttons (routing is the caller's); when narrow the middle levels fold into a `Menu`, measured rather than guessed |

## Principles for new components

1. Pass `forwardRef`, `className` and `...rest` through to the root element –
   every component that renders a root element. Excepted are the wrappers that
   have none: `Popover` renders into a portal, `Tooltip` around the caller's
   child, `Menu`, `ContextMenu` and `ToastProvider` are composed of other
   parts, and the providers render no element at all. The ref goes
   to the element a caller lays out: the `<dialog>` of `Modal`, `Drawer`,
   `ConfirmDialog` and `CommandPalette`, the field's wrapper of the pickers
   and the combobox family, the `role="tree"` list of `TreeView`. The native
   fields that wear a wrapper (`Checkbox`, `Switch`, `Slider`, `NumberInput`,
   `Select`, a clearable `Input`) put the class on the wrapper and ref and rest
   on the control. The component's own
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

## Roadmap

The core scope is complete, and so are the command palette, `Dock` and the
danger text tone (`--u-color-danger-text`, 0.7.0) and the pass-through of
rules 1 and 2 above. What is open, each with a
spec under `.scratch/`:

* `core-foundations` — `Switch`, `Slider`, `Drawer`, `ProgressBar`,
  `Accordion` and `Breadcrumb` stand; their final polish round is open.
* `forced-colors` and `listbox-announcements` — Windows high contrast, and
  what a listbox says to VoiceOver.
* `core-layout-extras` — `Splitter` and the layout tier after the basics.

Collapsing the dock onto its grip stays out of scope, because it doubles the
state space. What core will not build at all stands in
[ADR-0032](../../docs/adr/0032-what-umriss-is-not.md).
