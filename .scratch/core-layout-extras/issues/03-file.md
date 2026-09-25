# 03 - File input

Status: done
Type: task

Spec: `.scratch/core-layout-extras/spec.md`

## Scope

L3.

## Acceptance

- Keyboard, drop, `accept`; screenshots.

## Comments

Delivered as `FileInput` (`src/components/FileInput`): the native file input lies transparent over a key drawn as a secondary button, inside a zone with a dashed border that takes a drop - so Space, Enter, a label and a form's `name` are the platform's. `accept` is applied to a drop by `accept.ts` (the HTML standard's rule, unit-tested; the dialog filters by itself), and without `multiple` a drop gives its first accepted file; a refused file is named beneath the list (`fileNotAccepted`). The files are listed with their size and a remove key each; `value`/`onChange(files)` or uncontrolled; `invalid` from `FormField`. After a drop or a removal the input's `files` are rewritten through `DataTransfer`, so a form sends what the list shows. Class on the zone, ref and rest on the input (in the pass-through guard's list). Wording `chooseFile`, `chooseFiles`, `dropFile`, `dropFiles`, `removeFile`, `fileNotAccepted` in English and German. Tests: `tests-unit/fileInput.test.tsx`; the dialog on Space and Enter (`filechooser`), a drop from a real `DataTransfer` and the input's `files` after it and after a removal in `features-basics.spec.ts`; axe and own-base on the page; four examples photographed light and dark, the first under forced colours. The disabled state is unit-tested but not in the demo: its dimmed words fail axe's contrast, as the slider's did.
