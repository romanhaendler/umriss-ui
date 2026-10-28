# The size is the application's, the hit area the library's

Status: accepted, amends ADR-0070
Date:   2026-10-28

Since 0.43.0 (ADR-0070) a `md` control is 44 px tall under a coarse primary pointer instead of
32 px. The layout then depends on the device: an application is built and reviewed on a desktop,
where nothing changes, and on a tablet its `md` buttons, inputs and selects grow by 12 px. Only
part of the scale grows. The height of `md` changes, while spacing, `sm`, `xs`, type and every
container an application sized in pixels stay, so a layout built for 32 px controls breaks where
it holds them: a toolbar 48 px tall keeps 2 px of air around 44 px controls, a fixed header row
overflows, a form grid of fixed row height clips.

Accessibility does not need the growth. WCAG 2.5.8 (AA) asks for 24 × 24 px, which the invisible
hit areas of 0.43.0 already give without moving a pixel. 44 px is 2.5.5, level AAA. ADR-0070 itself
names the cost: "On upgrade, every application on a touch device sees its `md` controls at 44 px."
A change every application has to answer should not be the default.

## Decision

**A `md` control is 32 px under any pointer.** The size belongs to the application's layout, and
the library does not change it by the device. Under a finger only the hit areas (the invisible pads
of 0.43.0) and the behaviours change, as ADR-0070 says.

**Growing is the application's choice, made in CSS.** The 44 px block moves out of `tokens.css`
into `@umriss-ui/core/touch-scale.css`. An application that wants the larger control imports it:

```ts
import "@umriss-ui/core/touch-scale.css";
```

The file sets `--u-control-height: 44px` under `@media (pointer: coarse)` and nothing else. It is
static CSS, so it is safe for a server and known before the first paint; there is no provider
setting, no hook and no new token. An application that wants another height writes its own media
query (ADR-0045).

**Where a container of the library holds a `md` control, it grows from the token.** Its height is
written as `calc(var(--u-control-height) + …)`, never as a pixel value, so the opt-in never clips
or crowds a control inside the library itself.

The rest of ADR-0070 stands: touch is the primary pointer, read in CSS only; nothing drawn under a
finger is a target below 24 × 24 px; a behaviour follows the pointer type of the gesture; a field's
text is 16 px under a finger.

## Considered Options

- **Keeping the default at 44 px under a finger.** Rejected: the layout depends on the device, and
  an application that was reviewed on a desktop breaks on a tablet, as the Problem above shows.
- **A provider setting, or a touch size in `ControlSizeProvider`.** Rejected by ADR-0070 already:
  it needs a hook, a render-time branch and a hydration match, and a size given there stops at
  every surface opened from it (ADR-0041).
- **A token such as `--u-touch-control-height`.** Rejected: a token cannot fall back to the value
  of the token it replaces, so it would either fix 32 px or ignore an application's own
  `--u-control-height`.

## Consequences

- On upgrade, a `md` control on a touch device stays 32 px. An application that wants the 44 px of
  0.43.0 to 0.47.0 imports `touch-scale.css`; core's changelog states it under "Changed", with the
  line that restores it.
- The 24 × 24 px hit areas, `sm`, `xs`, dense surfaces (ADR-0042, ADR-0051) and the Select's choice
  of list by the gesture (ADR-0043) are unchanged.
- A scale that also grows spacing, icons and type is not built. If it is ever wanted, it belongs in
  `touch-scale.css` as well, so the opt-in stays one import.

## Amendment 2026-10-28

The opt-in fell short in two ways. It lost to the token rule when imported before core, because both
rules sat on `:root` in `umriss.tokens` with the same specificity and the later file won. And it
grew `md` only, so a screen showed 44 px fields beside 26 px toolbar, pagination, row-action and
Acknowledge/Shelve buttons, and Tabs stood at 32 px.

- **The rule wins whatever the order.** `touch-scale.css` writes `:root:root`, a higher specificity
  than the token rule, still on `:root` inside `umriss.tokens` (ADR-0021 holds). No layer or
  `!important` is added.
- **`sm` grows with `md`.** Under the opt-in `--u-control-height-sm` is 44 px as well, so everything
  built on `sm` grows: the table's toolbar, pagination and row actions, the alarms' Acknowledge,
  Shelve and Unshelve. No size prop is added to alarms.
- **Tabs read `--u-control-height`** like every `md` control (a `min-height`, so 32 px by default).
- **What keeps its size:** `xs`, menu rows, calendar days, checkboxes, switches and radios, with
  their 24 x 24 px hit areas. The READMEs and the documentation of core, table and alarms say so.
