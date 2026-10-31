# H11 form libraries x core 0.51.0 (Chromium, Playwright; host in this directory)

Libs: @tanstack/react-form 1.33.5, react-hook-form 7.91.0, formik 2.4.9, @conform-to/react+zod 1.21.2 (`/v4` entry for zod 4), React 19.3, one 15-field form
(`src/shared.tsx` Row; `src/{tanstack,rhf,formik,conform,conformglue}.tsx`; drivers `t*.mjs`, `drive.mjs`, `probe.mjs`; shots in `shots/`).
Legend: OK = out of the box; Nx = works with N lines of glue; RED = broken (red in brackets).

## Value in/out (all four libs, controlled path: value + onChange)
| field | value type seen by the lib | verdict |
|---|---|---|
| Input / Textarea / Select | string, `""` when empty | OK |
| NumberInput | number, `null` when emptied (never undefined/NaN) | OK; as native FormData it posts the DISPLAY text "1,234.5" (RED for Conform, below) |
| Combobox | `string\|null`; `value={undefined}` CRASHES (RHF unset default): `Cannot read properties of null (reading 'label')`, `Combobox.tsx:132` `value !== null && kept?.value === value ? kept.label` (known; `?undef` in rhf.tsx); clearing the typed text and tabbing away reverts to the old choice (needs `clearable` x) | OK with `null` defaults; RED with undefined |
| MultiSelect | `string[]` complete list | OK |
| Checkbox / Switch | `onChange(e)` -> `e.target.checked` boolean | OK (1 line each) |
| RadioGroup / SegmentedControl | `string`, `null` for none; `onChange(value)` only (no event) | OK |
| Slider | number | OK |
| DatePicker / DateTimePicker | `Date\|null`, local midnight | OK |
| DateRangePicker | `{from,to}\|null` | OK |
| FileInput | `File[]` | OK |

## Matrix (controlled, schema validation, pristine submit then fill then submit then reset)
| capability | TanStack | RHF (baseline) | Formik | Conform (React 19 action) |
|---|---|---|---|---|
| submitted values right type | OK all 15 + array | OK | OK | after ~60 lines glue: OK (strings, Date via ISO, `range.from/to`, `tags` x2) |
| onBlur reaches lib, from right element | text/notes/qty/select/combobox input/checkbox/radio input/switch/slider/file: OK. Tags + 3 pickers: fire on OPEN not on leave (RED 1) | same | same; raw `field.onBlur` writes touched under the FormField id for 5 controls (RED 2) | same as TanStack |
| error into FormField `error` | OK (1 line: `touched && errors.map(msg)`) | OK | OK | OK (`meta.errors[0]`) |
| `aria-invalid` on error | all except Checkbox (RED 3); RadioGroup/Segmented on the group div | same | same | same |
| red look on error | all except Checkbox + RadioGroup (RED 3) | same | same | same |
| reset to defaults | OK all 15 incl. combobox text, files, tags | OK | OK | `form.reset()` OK; native reset / React-19 auto-reset after action: Slider and FileInput list do NOT reset (RED 4) |
| disabled while submitting | OK, all 15 take `disabled` (23/23 core controls) | OK | OK | OK |
| focus on first invalid, lib's own mechanism | TanStack has none: glue ref map + `setTimeout` (fields are disabled in the same tick, focus is lost without it) 3x | RHF auto `ref.focus()`: OK for 13; RadioGroup + SegmentedControl: nothing (RED 5) | none built in, glue like TanStack | Conform focuses the hidden input by name; glue: `onFocus` forward 1x per hidden input |
| `form.Subscribe` / canSubmit | OK | n/a | n/a | n/a |
| async validator (200 ms), onBlur validator, array field | OK, error shown under the field | n/a | n/a | n/a |
| console errors/warnings | none | none | none | none |

## Per field: ref.focus() lands (`window.__refs`, the element each lib receives as `ref`)
OK: Input, Textarea, NumberInput, Select, Combobox (input), MultiSelect (button), Checkbox, Switch, Slider, 3 pickers (button), FileInput.
BODY (nothing focused): RadioGroup, SegmentedControl - the ref is the group div (still there after the 0.50 fixes for the rest). `t3.mjs onSubmit focus`.

## Conform / FormData: what arrives (`t11.mjs`, plain `name` on every control, `<form action>`)
| field | posts | shape |
|---|---|---|
| text, notes, color | yes | string |
| qty (NumberInput) | yes, but as shown | "1,234.5" (German: "1.234,5"): Number() = NaN, RED 6 |
| city (Combobox) | yes | the LABEL "Beta", not the value "b" |
| tags (MultiSelect) | no | `name` lands on a `<button>`: posts nothing |
| agree, notify | yes | "on" when checked, absent otherwise |
| plan, view | yes | selected value; absent when none |
| volume | yes | "60" |
| date, range, when | no | `name` on a `<button>` |
| files | yes | File |
TypeScript: `name` is a compile error on Combobox, MultiSelect, DatePicker, DateRangePicker, DateTimePicker (`Property 'name' does not exist`): `src/typ.tsx`. Checkbox has no `invalid` prop either. 

Conform glue that made it work (`src/conformglue.tsx`, ~60 lines): per non-posting control a hidden `<input name>` (or `<select multiple>` for tags) + `useInputControl` + serialize (number->string, Date->ISO, range -> two names); focus forwarded. After a valid submit React 19 resets the form: all values clear, Conform's errors reappear for every field (Conform/React interplay; not core) - and Slider keeps 60 (default 30) and FileInput keeps listing a.txt with `input.files.length === 0` (RED 4).

## Formik wiring
`field.onBlur` is `handleBlur(e)`: it reads `e.target.name || e.target.id`. Passing `name` works at runtime (typed: error, see above); typed-clean it writes touched["_r_6_"] etc. (the FormField id) for city, tags, date, range, when, so those never show errors on blur. Glue `onBlur={() => helpers.setTouched(true)}` (1 line per control). `t10.mjs formik` vs `formik?glue`.

## Reds
1. Blur on open: MultiSelect and the 3 pickers call `onBlur` when the panel opens (focus moves into it); with blur validation the error shows while the user picks and then STAYS (stale) after a valid pick until the next blur. `t5.mjs`, `t6.mjs`, `shots/tanstack-onBlur-open.png`.
2. Formik id-touched, above. 3. Checkbox invalid: `shots/invalid-checkbox-radio-segmented.png` (grey box, no `aria-invalid`; RadioGroup circles not red either). 4. `t14.mjs`, `t16.mjs`. 5. `t17.mjs` (RHF: focus -> submit button). 6. `t11.mjs`.
