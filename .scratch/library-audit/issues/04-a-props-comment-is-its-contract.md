# 04 — A prop's comment is its contract

Status: done
Blocked by: 06 (only for renames; the fixes below do not rename anything)

Spec: `.scratch/library-audit/spec.md`

## Scope

Places where the JSDoc — which the demo publishes as the props table — and
the code disagree, plus four small defects found beside them. All read.

- **`NumberInput.tsx:24-32`** — `onChange`, `min`, `max` say "geklemmt beim
  Verlassen". The code clamps on every path (`onChange` handler, line 197)
  as the pure-logic-seams spec decided. The comments are rewritten to the
  contract; the code stays.
- **`FormField.tsx:38-40`** — `required` promises `aria-required` on the
  field and sets only an asterisk. The context carries `required`; `Input`,
  `Select`, `Textarea`, `NumberInput`, `Combobox`, `MultiSelect`,
  `RadioGroup`, `Checkbox` and the pickers apply `aria-required` from it,
  the way they already apply `aria-describedby` and `aria-invalid`.
- **`Table.tsx:318`** — `pageSizeOptions` documented as "10, 25, 50, 100",
  default `[10, 25, 50]`. State what ships.
- **`Textarea.tsx:127-131`** — `onInput` is set, then `{...rest}` is spread
  after it, so a consumer's `onInput` replaces the library's and stops
  autosize and the counter. Compose: call the consumer's, then measure.
- **`TreeView.tsx:262`** — checkbox `id` is `` `baum-haken-${key}` ``; two
  trees with overlapping keys collide. Prefix with `useId()`.
- **Ids from caller values.** `Tabs.tsx:122,124,153-154` (`value`),
  `RadioGroup.tsx:163` (`option.value`), `CommandPalette.tsx:409`
  (`gruppe.name`, which may contain spaces — and `aria-labelledby` is an
  IDREFS attribute that splits on whitespace). One helper builds
  `${useId()}-${index}`; the raw value never enters an id. The palette's row
  id (`CommandPalette.tsx:499`) is a single IDREF and works today, but uses
  the helper too so there is one rule.
- **`CommandPalette.tsx:505`** — a row chooses on any `mousedown`, including
  the right button. Check `button === 0`.

Not here: the `Kalender` keyboard model, the compat re-exports (ticket 02),
CSV formula escaping and `useTableSelection` pruning (spec, Further Notes).

## Acceptance

- `propsLeser.test.ts` gains a rule: a JSDoc containing `Standard` followed by
  a literal must match the destructured default, checked for
  `TablePagination.pageSizeOptions` and at least two others chosen at random
  from the generated table.
- Behaviour tests: `Textarea` with a consumer `onInput` still autosizes and
  counts; two `TreeView`s on one page have distinct checkbox ids and a label
  click toggles the right one; a `FormField required` yields
  `aria-required="true"` on an `Input`, a `Select` and a `RadioGroup`;
  a `Tabs` value with a space yields ids without spaces and a working
  `aria-controls`; a palette group named with a space is labelled by its
  heading.
- The regenerated `props.json` differs only in the rewritten comments; the
  demo's screenshot baselines do not move (code is collapsed in every shot).

## Comments

**11 Sep 2026 — delivered, with two deliberate deviations.**

- Ids use `lib/idTeil.ts`, which escapes the caller's value injectively and
  without whitespace, instead of `${useId()}-${index}`: `Tab` and `TabPanel`
  are separate components that know no index, and palette rows reorder on every
  keystroke, so an index-based id would move under `aria-activedescendant`. The
  base of every id is still a `useId()`.
- `aria-required` is set on Input, Select, Textarea, NumberInput, Combobox,
  RadioGroup and Checkbox, not on the triggers of the pickers and MultiSelect:
  those are buttons, where the attribute is not allowed.
