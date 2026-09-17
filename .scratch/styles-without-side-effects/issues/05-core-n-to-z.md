# 05 — The components carry their own base: core N–Z

Status: ready-for-agent
Type: task

Blocked by: 01, 03
Runs in parallel with: 04, 06, 07 (and 02). Owns only these modules and their components:
Modal, MultiSelect, NumberInput, Popover, RadioGroup, Select, Skeleton, Spinner, Stat, Tabs, Tag, Textarea, Toast, Tooltip, TreeView, Typography, VisuallyHidden — including the **surface** of every portalled panel: Popover, Tooltip, Toast region — and through Popover the panels of Menu, Combobox, MultiSelect and the pickers.

Spec: `.scratch/styles-without-side-effects/spec.md` ("The text context", "Focus", "No rule outside the library's own elements") · ADR-0021

## Scope

Work from the red pictures listed under 01's Comments and the offenders listed
under 03's Comments that belong to this ticket.

- **Text context** on the root of each component that renders text, and on each
  panel surface this ticket owns — exactly the values `html`/`body` carried
  (spec). Not on pure layout.
- **Focus**: a `:focus-visible` ring on every element these components make
  focusable, unless it already has one.
- **Page-wide decoration that belonged to these components** moves into their
  modules: thin themed scrollbars on their scroll containers, caret colour and
  autofill on their fields, `corner-shape: squircle` on their classes with a
  `border-radius`.
- **Loose example text** in these components' examples that changes under
  browser defaults is rewritten with `Text`/`Heading`; each example is listed
  under Comments. Only then may its baseline be renewed, one by one, compared
  by eye.
- Do not touch `tokens.css`, guard tests, changelogs, READMEs or another
  ticket's modules. If a picture needs a change outside the list, write it under
  Comments and leave it.

## Acceptance

- Every screenshot of these components (both themes) is green **without a
  renewed baseline**, except the loose-text examples listed under Comments.
- 03's three checks report no offender in these components.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.
- Under Comments: the pictures that went from red to green, and any that could
  not, with the reason.

## Comments
