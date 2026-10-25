# 05 - The keyboard a finger gets: NumberInput's minus and MultiSelect's search

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/date-jump-and-typed-entry/spec.md`

## What to build

Two small touch fixes, each a field asking for the right keyboard or none.

- **NumberInput.** `inputMode` is `text` while negative values are allowed (`min` unset or below 0), else
  `decimal` or `numeric` as today. A caller's `inputMode` still wins. The README's NumberInput section says
  in one sentence that `min={0}` keeps the number pad on a phone.
- **MultiSelect.** The trigger remembers the `pointerType` of the gesture that opens the panel, as the
  Select does. Opened by a touch, the panel focuses its first enabled option, or leaves the focus on the
  trigger when there is none. Opened by a mouse, a pen or a key, it focuses the search, as today.

## Acceptance criteria

- [ ] A unit test on the rendered `inputmode`: `min` unset and `min={-10}` give `text`; `min={0}` gives
      `decimal`, and `numeric` with `decimals={0}`; a caller's `inputMode` wins in every case.
- [ ] jsdom tests: a touch press on the MultiSelect's trigger focuses the first option; a mouse press and
      Enter focus the search; an empty list leaves the focus on the trigger.
- [ ] Core's changelog lists the NumberInput keyboard under "Changed", with `min={0}` as the way back, and
      the MultiSelect focus under "Fixed".
- [ ] `pnpm check core` and `pnpm check:site` pass.
