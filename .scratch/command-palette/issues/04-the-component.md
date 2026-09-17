# 04 — CommandPalette: surface, field, list, keyboard

Status: done
Blocked by: 01, 02, 03

Spec: `.scratch/command-palette/spec.md`

## Scope

The component itself, exported from the package barrel. English public
interface, German internals — the `ComboboxOption` / `AuswahlOption` precedent.

**Controlled**, like the modal: `open` and `onClose`. Opening is the consumer's
decision. Alongside it ships a hook binding ⌘K/Ctrl+K and `/`, carrying the guard
the demo already wrote by hand: `/` must not open the palette while focus sits in
an input, a textarea or a contenteditable.

An item carries an id, a label, an optional group, an optional icon and an
optional weight. Choosing emits the id. Whether that navigates or runs a command
is the consumer's business — which is what keeps places and commands one concept.

**The surface** is a native `<dialog>` with `showModal()`, through the hook from
03. Not `Popover`: that primitive is for an *anchored* surface, and its whole
substance — anchor geometry, edge clamping, flipping — is what a centred window
does not use, while what the palette does need, the focus trap, is what
`popover-seam` deliberately left with the platform dialog. Not `Modal` either:
that is a sheet with a header, a body, a footer and three sizes.

**Anatomy.** Pane at `min(680px, 100vw - 32px)`, held in the upper third, on the
material and radius from 02. Field around 56px at `--u-text-2xl`, no border, no
focus ring — the pane is the focus indicator. Rows around 38px: optional icon,
label at `--u-text-md`, group right-aligned at `--u-text-xs` secondary, full-width
highlight at the new radius. Matched characters — the spans from 01 — in the
accent colour. Group headers in small secondary type, not focusable, skipped by
the arrow keys. The list caps at roughly eight rows and scrolls, keeping the
highlighted row in view with `block: "nearest"`, as the combobox already does.

**Rest state**: before a character is typed the panel is only the field. No
options rendered.

**Keyboard.** Arrows move and wrap at both ends, skipping headers. Enter chooses.
Escape closes. Focus returns where it came from. The highlight stays on the same
item while typing narrows the list, and falls back to the first when that item is
gone — never to nothing.

**Aria.** Combobox on the field, listbox on the list, `aria-activedescendant`
following the highlight, an accessible name on the dialog, headers associated
with their groups, and the find count announced when it changes.

Every user-facing string comes from `Wortlaut`. New keys, not reused ones: the
combobox's `keineTreffer` belongs to the combobox.

## Acceptance

- Component tests in the style of `baumBedienung.test.tsx` and `popover.test.tsx`:
  arrows and wrap-around, header skipping, highlight stability across narrowing,
  fallback to first when the held item vanishes, Enter emitting the id, Escape
  closing with focus restored.
- Aria asserted: the combobox/listbox pair, `aria-activedescendant` tracking, the
  dialog's accessible name, header association.
- Rest state renders no options; a query with no finds renders the empty line.
- Every string overridable through `Wortlaut`, asserted by overriding one and
  reading it back, as `sprache.test.tsx` does.
- The shortcut hook's guard asserted: `/` inside a text field does not open.
- Exported from the barrel. No demo change yet.

## Notes

`popover-seam` story 26 predicted this component would consume `Popover`. It does
not, and the reason is in the spec. Ticket 08 owns amending that record.

The barrel's export order matters — the file's own comment explains that it
decides stylesheet order in the bundle and has moved the table by two pixels
before. Add the palette where it does not disturb what is already there, and let
the screenshot suite confirm it.
