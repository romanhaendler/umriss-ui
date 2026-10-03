# Spec: A configurator for the ten simplest core components

Status: ready-for-agent

Origin: session of 2-3 Oct 2026. The brief, in the words it was given in: "Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art, sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen." Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes: landing_pages, component_api_reference, discoverability_interactivity, data_library_docs, asis_site_ux, asis_props_types). Roadmap of all sixteen specs: `.scratch/docs-roadmap/spec.md`.

Builds on: `.scratch/demo-as-documentation/spec.md` (examples are files, code collapsed, no sandbox — all of which stay), `.scratch/demo-rework/spec.md` (the first example stands without a heading, as the component at rest), ADR-0041 (a control's size and the `ControlSizeProvider`).
Blocked by: `types-without-holes` (S3) — the controls are derived from resolved literal unions and from `@default`, which S3 delivers.
ADR: none.
Tickets: `issues/01`–`02`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.

## Problem Statement

On the Button page a reader who wants to see "secondary, small, loading"
reads three examples and assembles the picture in their head. The values a
prop can take live in the type cell — today as `ButtonVariant`, an alias whose
members appear nowhere on the site (26 such literal-union aliases, 48 prop
mentions; `asis_props_types`). The brief asks for a site that makes people
*want* to try everything; a table of words does not.

The strongest interactive pattern in the research is Mantine's configurator:
the live component beside a set of typed controls — segmented choices for a
union, a switch for a boolean, a number field — and the code under it,
regenerated on every change, leaving out every prop still at its default
(`component_api_reference`, `discoverability_interactivity`). Nivo and
Storybook Controls do the same from a typed prop list. It is worth most on
small components whose props are values, and nothing on components whose
props are data, callbacks or composition.

## Solution

Ten core pages get a **configurator** in the place of their first example:
Button, IconButton, Badge, Tag, Alert, Input, Checkbox, Switch, Meter and
ProgressBar. It shows the component, a panel of controls — one per value prop
— and the code of what is on screen, which omits every prop that equals its
default. It starts at the defaults, so at rest it is exactly what the first
example used to be: the component at rest.

The controls are not written by hand. They come from the props table: a
literal union becomes a segmented choice or a select, a boolean a switch, a
number a number field. Which props get a control, and what text the component
starts with, is the only thing a configurator file declares.

The former first example of each of these pages stays, as the first titled
example under "Examples", so nothing a reader could copy before is lost.

charts, table, schedule and calculation get no configurator: their props are
data, accessors and composition, which the scenarios and examples show better
than any knob.

## User Stories

1. As a developer evaluating umriss, I want to switch a Button between its variants with one click, so that I see the whole range without reading the table.
2. As a developer, I want every allowed value of a union offered, so that I learn the values by seeing them, not by reading source.
3. As a developer, I want the code under the configurator to change with every control, so that I can copy exactly what I see.
4. As a developer, I want the code to leave out every prop that is still at its default, so that the snippet is as short as the real call would be.
5. As a developer, I want a copy button on that code, so that I can take it in one click.
6. As a developer, I want the configurator to start at the defaults, so that the first impression is the component as it ships.
7. As a developer, I want a "Reset" control, so that I can return to the defaults after trying things.
8. As a developer, I want to edit the text a Button or a Badge shows, so that I can judge it with my own words.
9. As a developer, I want `disabled` offered where the element supports it, so that I can see the disabled look without an example of its own.
10. As a developer trying Meter or ProgressBar, I want a number field for `value`, so that I can watch the fill and the label follow it.
11. As a developer, I want the size control to show "md" as the default even where the default comes from a provider, so that I understand what I get without a `ControlSizeProvider`.
12. As a developer, I want the configurator to be built from umriss's own controls, so that the panel itself shows the library at work.
13. As a developer on a phone, I want the controls to stack under the component, so that both stay usable at 390 px.
14. As a keyboard user, I want every control reachable and operable with the keys of its own core component, so that the configurator is as accessible as the library.
15. As a screen-reader user, I want each control labelled with the prop's name, so that I know what I am changing.
16. As a reader in dark mode, I want the configurator to follow the theme, so that it never looks pasted in.
17. As a reader who prefers the old first example, I want it still on the page as the first titled example, so that nothing I knew moved away.
18. As a maintainer, I want a configurator to declare only which props it controls and its starting text, so that types, values and defaults come from the source and cannot drift.
19. As a maintainer, I want a configurator that names a prop the table does not have to fail at load time, so that a renamed prop cannot leave a dead control.
20. As a maintainer, I want a configurator that names a prop whose type cannot become a control to fail as well, so that nobody wires a callback to a text field.
21. As a maintainer, I want the configurator to leave the llms text and the prerendered page alone, so that agents and search engines keep reading the examples' real source.
22. As a maintainer, I want screenshot baselines to show the configurator at rest, so that a visual change at rest is caught like any other.

## Implementation Decisions

**Which ten.** Button, IconButton, Badge, Tag, Alert, Input, Checkbox, Switch,
Meter, ProgressBar — the core pages whose props are mostly literal unions,
booleans and numbers. Stat, Slider and the pickers are not on the list: their
interesting props are objects, arrays or functions. The list is closed; a new
configurator is a new decision.

**The declaration.** Each configurator is one file in the demo, beside the
examples, named after its page. It exports the component to render, the list
of props to control in the order the panel shows them, and, where the
component takes text, the starting children; for a prop the component
requires (Meter's `value`, IconButton's `aria-label` and glyph) it gives the
starting value, and the code always shows a required prop. It declares no
types, no value lists and no defaults. Inherited element attributes are allowed for exactly two
names, `disabled` (a boolean) and `placeholder` (a string), because the props
table does not list inherited DOM attributes.

**Controls from types.** The props data, after `types-without-holes`, carries
each prop's resolved type and its default. The control follows the type:

- a union of string or number literals with at most five members: a segmented
  choice (core's `RadioGroup` in its inline form); more than five: core's
  `Select`;
- `boolean`: core's `Switch`;
- `number`: core's `NumberInput`, with the bounds the component documents
  (`Meter` and `ProgressBar`: 0 to 100);
- `string` (only `placeholder` and the children text): core's `Input`;
- anything else — functions, `ReactNode` other than the children text, objects,
  refs, `className`, `style` — cannot be named; naming it fails at load time.

A prop with no default and an `undefined` meaning "inherit" (the control size)
shows its effective value as the default, labelled "md (default)".

**The code.** Under the stage, always visible (it is short), with the existing
copy button: the import line and one JSX element. A prop appears only when its
value differs from its default; strings in double quotes, numbers and booleans
in braces, `true` as the bare attribute name. The children text appears between
the tags. The same string is shown and copied.

**Place on the page.** The configurator takes the slot of the first example —
under the page head, without a heading. The former first example becomes the
first titled example in the "Examples" run, keeping its anchor, so no link
breaks. A "Reset" button in the panel returns every control to its default.

**Layout.** Stage on the left, controls on the right from 900 px; below that,
controls under the stage. The stage is the existing example stage.

**What it never does.** It does not persist its state, put it in the address,
or offer "open in sandbox". It is not rendered into the prerendered HTML, the
`.md` twin or the llms text — those keep the former first example as the
page's first example. It is not offered for any package other than core.

## Testing Decisions

Tests assert what the reader sees and copies.

- **The page suite in the browser** (prior art: the copy test that reads the
  real clipboard): on the Button page, choosing "primary" and "sm" changes the
  rendered button and the code to exactly one element with those two
  attributes and nothing else; Reset restores the default code
  (`<Button>…</Button>` with no attributes); the copy button puts that exact
  string on the clipboard; every control is reached by Tab and operated by its
  keys.
- **The tooling unit tests against the fixture package** (prior art: the props
  reader tests): the mapping from a fixture's resolved prop types to control
  kinds; the code generator omits defaults, quotes strings, braces numbers,
  writes `true` bare; a configurator naming an unknown prop or a function prop
  fails with a message naming the file and the prop.
- **The core demo's smoke test in jsdom** renders all ten configurators.
- **Accessibility check** (axe) includes one configurator page.
- **Screenshot baselines**: the ten page heads with the configurator at rest,
  light and dark, replace the former first-example images; the former first
  examples get their titled images like every other example.

## Out of Scope

- Configurators for charts, table, schedule or calculation.
- Editing the example code itself (Sandpack, react-live) and sandbox exports —
  rejected in `demo-as-documentation`, and MUI's own experience with broken
  sandbox links stands against them.
- A theme editor.
- A configurator state in the URL.

## Further Notes

- Siblings: `types-without-holes` (S3) blocks this spec; `props-to-examples`
  (S6) counts a configurator as no example — coverage is earned by example
  files, because only they are shown as source in every medium.
- Acceptance:
  - the ten pages open with a configurator whose code at rest is the bare
    element;
  - every control's values equal the members of the prop's resolved type;
  - the code never contains a prop at its default;
  - the former first examples stand as titled examples with their anchors.
