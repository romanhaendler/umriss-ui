# Spec: The styles load themselves, and touch nothing else

Status: ready-for-agent

Origin: session of 17 Sep 2026, after the first publication was prepared and
before anything went to the registry. The brief, in the words it was given in:
"Wäre es nicht besser für den User, wenn er standardmäßig nichts importieren
müsste? … ich würde vorschlagen, dass das css standardmäßig geladen wird? Dann
könnte man das überschreibbar machen?" — and, once the options were on the table:
"Ich möchte, dass ein Entwickler nur minimal wenig importiert, dass es keine
Nebeneffekte auf seine Anwendung geben kann und dass er bei Bedarf alle Token
überschreiben kann."

Decision: [ADR-0021](../../docs/adr/0021-the-styles-load-themselves-and-touch-nothing-else.md).
Everything argued there is not argued again here.

Glossary: **Token** in `CONTEXT.md` changes (layer, `light-dark()`); **Text
context** and **Own element** are new (ticket 08).

Tickets: `issues/01`–`08`. See **Sequencing** for what runs in parallel.

---

## Problem Statement

Measured on the state of 17 Sep 2026, not assumed.

**Two imports, and the second fails silently.** `dist/core.js`, `dist/table.js`
and `dist/charts.js` import no CSS. Without `import "@umriss-ui/core/styles.css"`
the interface is unstyled and nothing says why.

**The stylesheet reaches far beyond the components.** `global.css` styles `html`
(font, 16px, colour, background, smoothing), `body` (margin, size, line height),
`*`/`*::before`/`*::after` (`box-sizing`), `:focus-visible` everywhere,
`::selection`, `input`/`textarea` caret and autofill, every scrollbar on the
page, and `corner-shape: squircle` on `*`. `tokens.css` sets
`color-scheme: light` on `:root`. `UmrissProvider` writes `data-theme` and
`data-density` onto `<html>` — and no stylesheet reads `data-density` at all.

**`@umriss-ui/charts` writes global class names**, `.kc-*` (189 occurrences in 15
files), outside CSS modules — a leftover of the library's former name.

**The components lean on the base layer, and the tests could not see it.** With
`global.css` emptied, every behaviour, keyboard, accessibility and shell test
stayed green, and 412 screenshots moved. Looked at component by component:

- **Inherited type.** 25 of 38 stylesheets set no `font-family`. FormField
  labels, hints and errors, Card titles, Stat, Alert, table cells and headers
  rendered in the browser's serif default. Colour is inherited the same way —
  in the dark theme an application without a matching `html` colour would get
  dark text on a dark surface.
- **`box-sizing`.** No module sets it (one rule in `Table.module.css` aside).
  Inputs grew out of their grid column by their padding.
- **Focus.** `Button`, `Card` (collapse), `Tabs`, `Dock`, `Toast` and `Modal`
  have no `:focus-visible` rule of their own; their only visible focus was the
  global one. No test notices its absence.
- **Portals.** `Popover` (and with it `Menu`, `Combobox`, the pickers),
  `Tooltip` and `Toast` render into `body` and inherit from there.

**Theme switching is a second switch.** The dark tokens hang on
`:root[data-theme="dark"]`. An application using a `.dark` class, `data-bs-theme`
or DaisyUI theme names has to set the library's attribute as well.

## Solution

What a caller writes afterwards, in full:

```tsx
import { Button } from "@umriss-ui/core";
```

And, only if wanted:

```css
:root { --u-font-sans: "Inter", sans-serif; --u-color-accent: #0f766e; }
html.dark { color-scheme: dark; }   /* most theme libraries do this already */
```

1. **The JavaScript imports its stylesheet** — in all three packages.
2. **Every rule lies in `@layer umriss.tokens`, `umriss.base` or `umriss.components`.**
3. **No rule selects what the library did not render.** `global.css` is gone.
4. **Components carry what they took from it**: `box-sizing` on their own
   elements, a text context where they render text or open a panel, a
   `:focus-visible` ring on what they make focusable.
5. **Light and dark come from `color-scheme`**, through `light-dark()` in the
   tokens. `UmrissProvider` loses `theme` and stops writing to `<html>`.
6. **`.kc-*` becomes `.uc-*`**, inside the same layers.
7. **The demos stop providing a base**, so their screenshots prove 3 and 4.

## Implementation Decisions

### Loading

- Each library build ends with `dist/<name>.js` importing `./<name>.css` as its
  first statement (`core.js` → `core.css`, `table.js` → `table.css`,
  `charts.js` → `charts.css`). How — a Vite plugin in the build or a post-build
  step — is ticket 01's choice; the result is checked by a script that runs in
  `prepublishOnly` after the build and fails the publish if the import is
  missing.
- `dist/wording/de.js` imports nothing: the German wording has no styles.
- `@umriss-ui/table` does not import core's stylesheet itself: it imports
  `@umriss-ui/core`, which does.
- The `./styles.css` exports stay, documented as optional.

### Layers

- Every stylesheet the library ships starts with the order statement
  `@layer umriss.tokens, umriss.base, umriss.components;` — core, table and
  charts alike, so the order is fixed whichever package's CSS arrives first.
  Tokens go in `umriss.tokens`; the shared text context, caret and scrollbars in
  `umriss.base`; everything else in `umriss.components`. *(Amended during 04:
  `umriss.base` did not exist in the first draft. `composes` guarantees the
  class but not the order of the rules, and a shared text context landed after a
  badge's own size and colour. One layer below the components makes the order
  irrelevant.)*
- In CSS modules the layer is written in the source file (`@layer
  umriss.components { … }` around the rules), not added by the build, so that
  the demo — which reads sources — runs exactly what ships.
- A unit guard (core and table; charts in ticket 07) fails on any rule outside a
  layer.

### No rule outside the library's own elements

- **Forbidden selectors**, enforced by the same guard: `html`, `body`, `:root`
  with anything other than custom properties, a bare `*`, a bare `::selection`,
  `::-webkit-scrollbar*` or `:focus-visible` without a class of the module in
  the same selector, and any native element selector without such a class.
- **`box-sizing`: by the build, on own elements only.** A PostCSS step shared by
  the library builds and the demo builds (one module, e.g.
  `scripts/postcss/own-box.mjs`, imported by the vite configs) adds
  `box-sizing: border-box` to every rule whose selector contains a class of the
  module **and** whose last compound is not `*` — so `.field input` gets it and
  `.stack > *` does not. A rule that already declares `box-sizing` is left
  alone. This keeps 38 modules from repeating a line, and it cannot be forgotten
  by the next component. The alternative — `@scope (…) to (…)` donut scopes with
  slot markers — was considered and is not taken: it needs a marker at every
  place a caller's content enters, and Firefox shipped `@scope` only in 146.
- **Scrollbars, selection, caret, autofill, squircle corners** move into the
  modules of the elements they are meant for (scroll containers of TreeView,
  Menu/Combobox/MultiSelect panels, CommandPalette, Modal body; `Input`,
  `Textarea`, `NumberInput`, the picker fields) or are dropped where they only
  decorated the page. `corner-shape: squircle` goes onto the classes that set a
  `border-radius`.
- **Page base (`body { margin: 0 }`, page background, page scrollbars)** is the
  application's. The demo shell brings its own, for its own chrome only (see
  **The demos**).

### The text context

- **What it is:** `font-family: var(--u-font-sans)`, `font-size` and
  `line-height` from the type tokens, `color: var(--u-color-text)`,
  `-webkit-font-smoothing: antialiased`, `text-rendering: optimizeLegibility`
  — the values `html`/`body` carried, so the pictures stay the same.
- **Who sets it:** the root of every component that renders text (a label, a
  value, a message, a cell) and the root of every portalled panel (`Popover`,
  `Tooltip`, `Toast` region, `CommandPalette`, `Modal` surface). Where a
  component already sets part of it (`Tooltip`, `Modal`), it is completed, not
  duplicated.
- **Who does not:** pure layout — `Stack`, `Grid` (`Layout.module.css`),
  `Divider` without a label, `VisuallyHidden`, `Skeleton`, `Spinner`. A caller's
  text placed in a `Stack` keeps the caller's type.
- **Containers pass it on, deliberately.** A caller's text inside `Card`,
  `Modal`, `Popover` or `Alert` inherits that component's text context. That is
  the component deciding for its own surface, not for the page; ADR-0021 counts
  it as "the component".
- **Mono stays explicit:** numeric cells, values and inputs already set
  `var(--u-font-mono)` and keep doing so.

### Focus

- Every element a component makes focusable — native button, link, input, or
  anything with `tabIndex` — carries its own
  `:focus-visible { outline: none; box-shadow: var(--u-focus-ring); }` (or the
  existing variant that component already uses). The composite ones that keep a
  ring on an inner element (`Input`'s field, the pickers) keep their design.
- A component composed of other components (`ButtonGroup` from `Button`,
  `ConfirmDialog` from `Modal` and `Button`) inherits the ring from its parts.

### Theme

- Every token with a dark value becomes `light-dark(<light>, <dark>)` in the one
  `:root` block; the `:root[data-theme="dark"]` block is removed. All 36 dark
  tokens are colours or shadows whose dark variant has the same structure, so
  each colour inside a shadow gets its own `light-dark()`.
- `color-scheme: light` and `color-scheme: dark` are removed from `tokens.css`.
  The library sets `color-scheme` nowhere.
- `UmrissProvider`: `theme` and its effect are removed (with `Theme` if nothing
  else exports it); `useDensityOnDocument` is removed — `density` keeps working
  through context (`useDensity`, `useDensityFor`), which is what the table reads.
  The provider writes nothing to `document.documentElement`.
- `contrast.test.ts` reads both themes out of the `light-dark()` pairs instead of
  two blocks; `themeFallbackConformance.test.ts` follows.

### The demos

- `packages/*/demo/main.tsx` and the charts/table `demo/ui-styles.css` stop
  importing `global.css`. The demo **page** — `html`, `body` — gets no font,
  colour, box model or background from anywhere: browser defaults. The shell's
  own chrome (`shell.css`, `page.css`) sets its type and surfaces on its own
  classes, like a component would.
- The theme switch of the three demo apps sets `document.documentElement.style.
  colorScheme` instead of `data-theme`, and the charts demo's
  `invalidateTheme()` call stays until ticket 07 makes it unnecessary.
- An example whose own loose text (outside any library component) changes
  appearance under browser defaults is rewritten to use `Text`/`Heading` — the
  examples show how the library is used, and loose text was never that. Each
  such example is listed in the ticket that touches it.

### Charts

- `.kc-*` → `.uc-*` in CSS, TypeScript, tests, demo and
  `packages/charts/docs/capabilities.md`; `--uc-*` variables are already named.
- `charts.css` gets the layer order statement and its rules go into
  `umriss.components`; the `--uc-*` variables on `.uc-root` stay variables with
  their fallback chain.
- `theme.ts` resolves each colour through a probe: an element inside the chart
  root with `color: var(--uc-…)`, read back as the computed `color` — which is a
  resolved `rgb()`/`color()` value even when the token is `light-dark()`. Fonts
  are still read as custom properties (no `light-dark()` there).
- Invalidation additionally subscribes to `matchMedia("(prefers-color-scheme:
  dark)")` and keeps observing `html` attributes (`class`, `style`, `data-*`),
  which is where applications switch `color-scheme`. `invalidateTheme()` stays
  public for a switch made on another ancestor.

## Testing Decisions

- **Pixel identity is the acceptance for every component ticket.** The goal is
  that the same styles apply, scoped instead of global — so after ticket 01 the
  baselines are **not** renewed in bulk. Every red screenshot is a dependency to
  fix in 04–07. A baseline may only be renewed where a ticket names the image and
  the reason (the loose-text examples, above), with the before/after compared by
  eye.
- **Ticket 03 adds three browser checks** to `packages/demo/checks/`, run by all
  three demos:
  1. *Own text context* — within every example, no element that renders text has
     the page's computed `font-family` (the browser default), except where the
     example's own loose text is listed as an exception.
  2. *Own box* — every element carrying a class from the library's modules or a
     `uc-` class computes `box-sizing: border-box`.
  3. *Visible focus* — Tab through every example; every element that receives
     keyboard focus computes a `box-shadow` or `outline` different from its
     unfocused state.
- **The unit guards** (`stylesheets.test.ts`, `styleGuard.test.ts`, and a new one
  for charts) enforce the layer and the forbidden selectors, and ticket 01's
  PostCSS step gets unit tests of its own (which selectors get `box-sizing`,
  which do not).
- **A dist check** (`scripts/check-dist.mjs` or similar) runs in each package's
  `prepublishOnly`: the JS imports its CSS, the CSS starts with the layer order
  statement, and contains no forbidden selector.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` stay green at every ticket
  boundary. `pnpm test:visual` is expected red between 01 and the end of 07,
  and each ticket states which of its images went from red to green.
- The two known flaky charts screenshots (`axis--axes`, `span--schedule`, dark)
  are not this spec's; they are not renewed here.

## Sequencing

```
01 layers, loading, no global base ───┬── 02 theme via color-scheme ──┐
                                      │                                ├── 07 charts ──┐
                                      └── 03 the checks ──┬── 04 core A–M ─────────────┤
                                                          ├── 05 core N–Z ─────────────┼── 08 documents
                                                          └── 06 table ────────────────┘
```

- **01 first, alone.** It touches every stylesheet (the layer) and every build
  config; nothing else can run beside it without conflicts.
- **02 and 03 in parallel** after 01. 02 owns `tokens.css`, the provider and the
  demo apps' theme switch; 03 owns `packages/demo/checks/`.
- **04, 05 and 06 in parallel** after 03. Each owns a disjoint set of module
  files and components; none edits `tokens.css`, a guard test, a changelog or a
  baseline outside its list. They may run beside 02, since they do not touch
  token values.
- **07 after 01, 02 and 03**, and in parallel with 04–06: it owns
  `packages/charts` alone.
- **08 last.** Every changelog, README, `CONTEXT.md`, `docs/` and journal edit of
  this effort is here, so no parallel ticket touches a shared document.

Ownership of the core modules:

| Ticket | Modules under `packages/core/src/components/` |
|---|---|
| 04 | Alert, Badge, Button, ButtonGroup, Card, Checkbox, Combobox, CommandPalette, DataViz, DatePicker, Divider, Dock, EmptyState, FormField, Input, Layout, Menu |
| 05 | Modal, MultiSelect, NumberInput, Popover, RadioGroup, Select, Skeleton, Spinner, Stat, Tabs, Tag, Textarea, Toast, Tooltip, TreeView, Typography, VisuallyHidden |

`Combobox`, `Menu` and the pickers render their panels through `Popover` (05);
04 styles the panel contents, 05 the panel surface. If a red picture needs both,
05's surface lands first and 04 rebases.

## Out of Scope

- **Loading fonts.** Nothing is loaded; Geist stays the first name in the token.
- **An entry without CSS** (`/unstyled`) — see ADR-0021.
- **New tokens or changed token values.** The tokens are moved into a layer and
  into `light-dark()`, not redesigned. `tone-contrast` stays its own spec.
- **Server rendering.** Unchanged: client-rendered applications (core
  changelog, "Target environment").
- **The screenshot flakiness of the charts** (`docs/testing.md`, Known open).

## Further Notes

**Why the pictures are the proof and not a new kind of test.** The components
already have 637 browser tests and baselines in both themes; the experiment that
started this spec found every dependency through them in one run. Removing the
page base from the demos turns that experiment into the permanent state: from
then on a component that starts leaning on the page again turns a picture red.
The three checks of ticket 03 cover what a picture cannot see — focus, and a
dependency that happens to look identical.
