# 02 — Dock: surface, tools, mode

Status: done

Spec: `.scratch/floating-dock/spec.md`

## Scope

`packages/ui/src/components/Dock/` — `Dock.tsx`, `Dock.module.css`, `index.ts`.
The component at rest: it renders at a place, in the right orientation, with its
tools. Moving it is ticket 03; the turn is ticket 04.

Public interface:

- `tools: readonly DockTool[]` — each with `id`, `label`, `icon`, optional
  `disabled`. A prop and not children, because the dock has to know the count to
  answer ticket 05's fit question.
- `place` / `defaultPlace` / `onPlaceChange` — controlled and uncontrolled both,
  per the README's rules for new components. Default `"unten"`.
- `mode` / `onModeChange` — optional. When `mode` is absent no tool is marked.
- `onUse(id)` — a tool was taken.
- `ref`, `className`, `...rest` forwarded to the root, per the README.

Rendering:

- `position: absolute` inside the host's positioned container. No `z-index`, no
  entry in the `--u-z-*` scale.
- Material per ADR-0012: `--u-color-material-fallback` written first and
  unconditionally, upgraded to `--u-color-material` +
  `backdrop-filter: blur(var(--u-material-blur))` inside
  `@supports (backdrop-filter: blur(1px))`. `--u-shadow-overlay`,
  `--u-radius-xl`. No scrim.
- Orientation from `istStehend(platz)` (ticket 01). Lying: a row, grip at the
  left. Standing: a column, grip at the top.
- Tools are glyph-only, `currentColor`, glyph spec per `GLYPHEN.md`. Name via
  `Tooltip` and `aria-label` on the control. The mode's tool carries
  `--u-color-accent` and `aria-pressed`.
- Roving tabindex over the tools, in the house's manner (`TreeView.tsx:225`,
  `Tag.tsx:60`): arrow keys walk, Tab leaves. `role="group"` with a label, not
  `role="toolbar"` — the library uses `group` everywhere and has no `toolbar`
  anywhere, and this is not the ticket to introduce a second habit.

Tokens only. Any new value becomes a token first.

## Acceptance

- All four places render at the right edge, centred, in the right orientation.
- Controlled `place` is never changed by the component itself; uncontrolled
  `place` starts at `defaultPlace`.
- With `mode` absent, no tool carries the accent or `aria-pressed`; with `mode`
  set, exactly one does.
- Arrow keys walk the tools and wrap; Tab leaves the dock; disabled tools are
  skipped by the walk but stay visible.
- Every tool's name is reachable without hover.
- Where `backdrop-filter` is unavailable the dock is a solid pane and correct in
  every other respect.
- No raw colour, length or duration in the module CSS.

## Notes

`role="group"` rather than `role="toolbar"` is a deliberate small conservatism.
`toolbar` is arguably the more precise role, but adopting it here would make the
dock the only component in the library with it, and the roving-tabindex
behaviour it implies is exactly what this ticket implements by hand anyway. If
the library later adopts `toolbar` it should adopt it everywhere at once.

Do not build the tools as children. It reads more flexible and it costs ticket
05 the only number it needs.
