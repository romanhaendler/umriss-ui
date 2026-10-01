# 02 — A natural width, and `chars`

Status: ready-for-agent
Type: feature

Spec: `.scratch/control-sizes/spec.md`, decisions 1–5.

## What

- `Input` and `Textarea` always render their wrapper.
- Every field root: `inline-size: 100%`, `min-inline-size: 0`,
  `max-inline-size: 100%`, `contain: inline-size`,
  `contain-intrinsic-inline-size` from `--_chars` and the field's chrome.
- `chars` on the text fields and the date pickers; given, the root is
  `fit-content` (its own natural width at that count).
- The date pickers' natural width is the length of their formatted value.
- `Slider` and `FileInput`: containment and a natural width, no `chars`.

## Acceptance

Browser tests on a demo page of their own (core, "Field widths"):

- a `MultiSelect` keeps its width while values are chosen and removed, in a
  form column and in a row;
- a `Select` in a row is as wide as its default, not its longest option;
- a field with `chars={20}` is exactly as wide as the same field without it
  in a row; `chars={5}` is narrower than `chars={10}` in a form column;
- at 320 px no field is wider than its parent and the page does not scroll
  sideways.
