# 01 — One size, one name, one scope

Status: done
Type: feature

Spec: `.scratch/control-sizes/spec.md`, decision 6.

## What

- `ControlSize = "sm" | "md"`, exported; `ButtonSize` stays as its alias.
- `ControlSizeProvider({ size, children })`, exported. Inside it every control
  with `size` takes that size unless it says its own: `Input`, `Textarea`,
  `NumberInput`, `Select`, `Combobox`, `MultiSelect`, the four date pickers,
  `Button` (and so `IconButton`), `ButtonGroup`, `Switch`, `RadioGroup`.
- `Select`'s `selectSize` is renamed `size`; the native `size` is omitted.
- Popover, Tooltip, Toast, Modal and Drawer start their content without a
  provider around it.

## Acceptance

- Unit tests: own size wins over the provider, the provider over the default;
  a button inside a popover or a modal opened under an `sm` provider stays
  `md`; `Select size="sm"` is small.
- Every caller of `selectSize` in the workspace moved.
