# 02 — A natural width, and `chars`

Status: done
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

## Comments

**Delivered, 2 Oct 2026**, with three departures from the plan above, each
measured before it was taken:

- The root is a block with `width: auto`, not `inline-size: 100%`: the same
  fill in a block, a stretched column and a grid's cell, and the natural width
  in a row by itself - so no place has to set its parts to `width: auto`
  (identical in Chromium, Firefox and WebKit).
- The page is called **Sizes** (it shows heights too), after FormField.
- The defaults are 16 (text, select, combobox), 20 (multiselect: two chips and
  the counter), 10 (number), 40 (textarea); 20 for text made a dispatcher's bar
  three lines.

Beyond the plan: a FormField's message wraps inside its field's width, a
FormField is never wider than its place, the combobox's panel is at least
200 px, a text field's root writes at 16 px under a finger, a hidden input
stands bare, and - from the developer's round - `style` lands where
`className` does on every wrapped field.

Tests: `extent.test.ts`, `fieldWidth.test.tsx` (structure, server rendering),
`features-sizes.spec.ts` (11 promises; also run in Firefox and WebKit, 33/33).
