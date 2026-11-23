# The surface of core (`@umriss-ui/core` 0.56.0)

Research for ticket 04. Candidates only, no decision. Paths are relative to `packages/core/src` unless they start
with `docs/` or `CONTEXT.md`. Size: S / M / L. "Breaks a caller" means a caller's compiling code, runtime
behaviour or CSS changes; adding an optional prop or export never counts.

## What was read, what was not

Read whole: `packages/core/API.md` (all 1437 lines), `.scratch/release-1-0/map.md`, ADR-0066, 0068, 0081 (parts of
0066 and 0068).

Sampled in source: `index.ts`; `lib/dev.ts`; `lib/provider/{index.tsx,context.ts}`; `lib/useFieldValue.ts`;
`lib/glyphs/index.tsx`; `lib/language/wording.ts` (headers and the head of the interface, not the 1320 lines);
the prop interfaces of Select, Input, Slider, TimeInput, Tabs, Accordion, Modal, Alert, Toast, Menu, Popover,
Meter, ProgressBar, FormField, useTree (head); `styles/tokens.css` (names, not values); `demo/unshown.json`;
CONTEXT.md entries Tone, Control size, Density, Provider, Severity, Verdict.

Not read: the behaviour inside any component (focus, keys, announcements), `docs/llms-full.md`, the 443 wording
members one by one, `lib/language/formats.ts`, `lib/limit.ts` and `lib/freshness.ts` bodies, the demo examples,
`tests-unit`, `tests-consumer`, the built `dist` (so what `exports`, `.d.ts` and the CSS bundle really ship is
unchecked), `CHANGELOG.md`, and every other package. "Used by no other package" below comes from a word grep over
the other six packages' `src`, not from a type-level check.

Good news first, so it is not rediscovered: no `@deprecated` tag, no `warnDeprecated` caller, no `ariaLabel`
and no `onChange(value)` alias survives in core's source. The renames of ADR-0066, 0068 and 0081 are finished. The
field contract (`value`, `defaultValue`, `onValueChange`, `null` for empty) holds in all 20 stateful components I
looked at. ADR-0081's table matches the code.

---

## A. Names

### A1. Density has two vocabularies  (breaks a caller)
- `lib/provider/index.tsx:26` `Density = "comfortable" | "compact"`; `lib/provider/context.ts:28-31`
  `useDensityFor(own: "regular" | "compact", ...)`; `UmrissProvider` doc `index.tsx:105-109` says `"comfortable"
  means "regular"`. `CONTEXT.md` "Density" records it as intended ("where regular is called `comfortable`").
- `useDensity()` returns `"comfortable"` both when a provider says so and when nobody said anything
  (`context.ts` header comment), so it cannot be used to decide anything. Core itself uses density nowhere; the
  setting exists for table and calculation, which take `"regular" | "compact"`.
- Cost later: renaming a union member is a major.
- Smallest change: one word. Either `Density = "regular" | "compact"` (the provider's `density` and the
  hooks agree with the table's prop), or the reverse. Optionally have `useDensity` return `Density | undefined`.
- M (core, table, calculation, wording of docs, CONTEXT.md).

### A2. `showLabel` shows the percentage, `label` is the accessible name
- `components/DataViz/Meter.tsx:20,35` (default `true`), `components/ProgressBar/ProgressBar.tsx:25,34` (default
  `false`). `Slider` and `RangeSlider` call the same idea `showValue`. Also the two defaults disagree: the Meter
  shows its figure unless told not to, the ProgressBar hides it.
- Cost later: major (prop rename, default change).
- Smallest change: `showLabel` -> `showValue` on both; settle one default. (A caller change.)
- S.

### A3. Three names for "an entry was picked", four for "close"
- Picked: `MenuItem.onSelect`, `Breadcrumb` entry `onSelect`, `CommandPalette.onChoose(id)`, `useTree.onActivate(node)`.
  Close/remove: `Modal`/`Drawer`/`ConfirmDialog`/`CommandPalette.onClose`, `Alert.onDismiss`, `Tag.onRemove`,
  `ToastOptions.onClose(reason)`, `Popover`/`ContextMenu.onOpenChange(open, reason?)`.
- `Modal.onClose` is a wish, not a state change; `Popover`/`ContextMenu` are `open` + `onOpenChange`; `Menu` has no
  controlled `open` at all (`components/Menu/Menu.tsx`), `ContextMenu` has no uncontrolled form. Three shapes for
  an open/closed state.
- Cost later: major for any rename. Adding `onOpenChange` to Modal later is additive.
- Smallest change: decide whether the open state follows ADR-0081's shape (`open`/`defaultOpen`/`onOpenChange`) for
  Menu, Modal, Drawer, CommandPalette, ContextMenu. If yes, additive aliases first, removal at 1.0.
- M. This one is a product-consistency call, not a bug.

### A4. Tone vocabularies differ
- `MeterTone`, `AlertTone`, `BadgeTone`, `TagTone`: `neutral | accent | success | warning | danger`
  (`DataViz/Meter.tsx:9`, `Alert/Alert.tsx:15`, `Badge/Badge.tsx:8`, `Tag/Tag.tsx:24`). `ToastTone`
  (`Toast/Toast.tsx:28`) has no `accent` but a `loading`. `TextTone` (`Typography/Typography.tsx:22`) is
  `default | secondary | muted`. `ConfirmDialog.tone` is `"primary" | "danger"`, `MenuItem.tone` is
  `"default" | "danger"`, `Sparkline.tone` is `"ink" | "accent"`, `ButtonVariant` has `danger` too.
  `ToneGlyph.tone` repeats the five literals inline instead of naming a type (`lib/glyphs/index.tsx:214-218`).
  `CONTEXT.md` "Tone" lists three (success, warning, danger).
- Several of these are deliberate (`loading` is not a colour; a Verdict's `alarm` is never a tone, see CONTEXT.md).
  The question is only whether `default` vs `neutral` vs `primary` is intentional.
- Cost later: a major for any renamed member; adding members is free.
- Smallest change: CONTEXT.md names the five-tone set; `ConfirmDialog.tone` -> `ButtonVariant`-like or
  `"neutral" | "danger"`; `MenuItem.tone` `default` -> `neutral`; export one `Tone` type used by ToneGlyph.
- S each, but each rename breaks a caller.

### A5. Generic type names that collide
- `Key` (`components/TreeView/treeModel.ts:22`, `string | number`) shares its name with React's `Key`.
  `Side` (`lib/limit.ts:16`, `"upper" | "lower"`, exported) is a second, different `Side` beside Popover's
  internal `Side = "top" | "bottom"` (`Popover/position.ts:35`). `Direction`, `Align`, `Quality`, `Severity`,
  `Language`, `Limit` are equally unqualified on the root namespace.
- Cost later: type-only break (a caller's `import type` fails), no runtime effect.
- Smallest change: `Key` -> `TreeKey`, `Side` -> `LimitSide`, `Direction` -> `TreeDirection`, `Align` ->
  `PopoverAlign`.
- S each (re-export the old name for one minor if the map's migration-line rule is followed).

### A6. `Tab`'s sibling words: `title`, `label`, `aria-label`
- Headings are `title` on Card, Alert, EmptyState, Modal, ConfirmDialog, AccordionItem, Toast; `label` on Stat,
  Stepper step, Tag children; `eyebrow`. `Toast.title`/`description` are `string`, the other `title`s are
  `ReactNode` (`Toast/Toast.tsx:49,52`). `Stat.label`, `Meter.label`, `ProgressBar.label` are `string` for what is
  measured.
- Likely fine; named so the decision ticket can say "kept".
- Cost later: `string` -> `ReactNode` is additive for callers (widening an input type), so it can wait.
- Smallest change: widen `ToastOptions.title/description` to `ReactNode` or leave.
- S.

---

## B. Shapes

### B1. `clearable` needs an `onClear`, and does nothing without it  (breaks a caller if fixed)
- `components/Input/Input.tsx:44-52`, `components/Select/Select.tsx:48-54`, `TreeSearch`: `clearable` shows a cross
  whose click is `onClear?.()`; the doc says "Requires a controlled field (value) and onClear". Without either, a
  visible cross does nothing. Yet ADR-0081 says every field is controlled or uncontrolled.
- Every other clearable field (Combobox, MultiSelect, the four date pickers, ColorPicker) clears through
  `onValueChange(null | [])` and works uncontrolled.
- Cost later: making the cross clear an uncontrolled field and call `onValueChange("")` changes behaviour for a
  caller who handles `onClear` and `onValueChange`: two callbacks fire. That is a break, hence a 1.0 question.
- Smallest change: `Input`/`Select` clear themselves when uncontrolled and report `onValueChange("")` / `(null)`;
  `onClear` becomes redundant (remove at 1.0, or keep as an extra notification).
- M.

### B2. `name` means two things
- `RadioGroup.name` and `SegmentedControl.name` are the native radio name ("Name of the radio group within the
  form", default generated), while `Select`, `Combobox`, `MultiSelect`, `NumberInput`, `DatePicker`, `ColorPicker`,
  `TimeInput`, `RangeSlider` use `name` + `formValue` and render a hidden input (`FormPostProps`).
  `unshown.json` already marks `RadioGroupProps.name` "(a) pass-through".
- Not a break to leave; named because `formValue` is absent from the radio family and the semantics differ.
- Cost later: adding `formValue` is additive.
- Smallest change: document it as the same "post under this name" contract; nothing to change.
- S (docs).

### B3. Mutable arrays in an otherwise `readonly` surface
- `DateRangePicker.presets?: RangePreset[]` and `DateTimeRangePicker.presets` (`DatePicker/DateRangePicker.tsx:73`)
  versus `readonly` everywhere else (`options`, `swatches`, `items`); `onValueChange(value: string[])` on Accordion
  (`Accordion/Accordion.tsx:33`), `MultiSelect`, `FileInput` hand out mutable arrays, which is fine for outputs.
  `useTree`: `defaultExpanded?: Iterable<S>` but `expanded?: ReadonlySet<S>`; `onActivate(node: K)` receives the
  node, the other callbacks the key `S` (`TreeView/useTree.ts:42-47`).
- Cost later: `presets: readonly RangePreset[]` is additive (widening). `Iterable` vs `ReadonlySet` asymmetry:
  changing either input type later is additive when widened.
- Smallest change: `readonly RangePreset[]`.
- S, not a break.

### B4. A `size` that is not a control size
- `size` means `"sm" | "md"` on every control (CONTEXT.md "Control size"), but `Spinner.size` and every glyph's
  `size` is pixels (`number`), `Link`, `Text`, `Heading` use `TextSize`, `Avatar` `"sm" | "md"` (a different
  scale), `Modal` `sm | md | lg`. `Sparkline` sizes with `width`/`height`.
- Cost later: major to rename.
- Smallest change: leave it and write it down, or rename glyph/spinner `size` to `px`. I would only call the
  second a candidate if the maintainer cares; CONTEXT.md already says control size is `sm | md`.
- S (docs) or M (rename).

### B5. Two ways to configure language and toasts
- `UmrissProvider` takes `language={{ formats, wording }}` and `toast={...}`; `LanguageProvider` takes `formats`
  and `wording` at top level; `ToastProvider` is separate and holds only `held`; `UmrissProvider` does not mount
  `ToastProvider`, so `toast` config without a `ToastProvider` is silently unused
  (`Toast/Toast.tsx:129-132` reads it from the root provider).
- `UmrissConfig` doc says "every value filled in" (`lib/provider/index.tsx:57`) but `toast` is `{}` unless set; the
  defaults 5000 / `bottom-end` / 3 live in the Toast. `useToastConfig()` returns optional fields.
- Cost later: moving `ToastProvider` inside `UmrissProvider` is additive if it mounts only when asked; changing the
  type of `useUmriss()` to filled-in config is a type narrowing, benign for readers.
- Smallest change: fix the doc sentence; decide whether `ToastProvider` stays a separate mount (documented).
- S.

### B6. Absent-state wording of required `aria-label`
- Required on `IconButton`, `TagGroup`, `TreeView`; optional on `ButtonGroup`, `ContextMenu`, `Popover`;
  `Menu`/`Breadcrumb` take it through rest. Reasonable (ADR-0068 shape rules) but not written as a rule.
- S (docs).

### B7. Controlled-state props of the non-field components
- `Card`: `collapsed` / `defaultCollapsed` / `onCollapsedChange` (matches ADR-0081's pattern). `Tabs`, `Accordion`,
  `Splitter` follow it. `Accordion.value` is `readonly string[]` for both `type="single"` and `"multiple"`
  (`Accordion/Accordion.tsx:25-33`): the type does not say a single accordion holds at most one value.
- Cost later: a discriminated union (single: `string | null`) would break callers; keeping the array is stable.
- Smallest change: keep; note the loose type in the props table. Decide now because the alternative is a major.
- S (docs) / M (union).

---

## C. Loose types

- **C1.** `Select` (`Select/Select.tsx:30-34`): `value?: T | readonly string[] | null`; the `readonly string[]` is
  the native `multiple` case, which `onValueChange` explicitly does not report. A typed `multiple` would be a
  second component. Cost later: narrowing the input is a break; leave as is or drop `multiple` support. M.
- **C2.** `Input.value` / `Textarea.value`: `string | number | readonly string[] | null`, inherited from the native
  attribute; `onValueChange` always gives `string`. Narrow to `string | null` is a break for a caller passing a
  number. S.
- **C3.** `Text.as?: ElementType` (ref type `HTMLElement`), `VisuallyHidden.as?: E`, `Stack.align/justify:
  CSSProperties[...]`, `Menu.trigger` / `Tooltip.children`: `ReactElement<{ ref?; "aria-expanded"?; ...}>`
  (truncated in API.md at 80 characters, so the contract is unreadable there). `Skeleton.width/height`:
  `string | number`, `Grid.minItemWidth: string`. These are loose on purpose; the only 1.0 question is whether to
  freeze them. Narrowing `as` to a union of text elements later is a break. S.
- **C4.** `ToastOptions`/`ToastContextValue` use a `number` id (`toast()` returns `number`); every other key in
  the library is a string (`useTree` keys `string | number`). Cost later: major. S.
- **C5.** `Formats` and `Wording` are function bags that callers may replace entry by entry (`Partial<Formats>`);
  both are also accepted whole ("hands in a whole object", `lib/language/wording.ts` header). Any new key is then a
  compile error for a caller who builds a complete `Wording`. See D4.

## D. Surface that nothing documents or uses

### D1. Exports with no use outside core's own tests  (removal breaks a caller)
Word-grep, other packages' `src` and core's demo: no hits for `resetAnnouncer` (test helper, README only),
`hasWarned` (test helper), `scrollForRow`, `mergeLanguage`, `DEFAULT_SEPARATORS`, `DEFAULT_PRESETS`
(only through DateRangePicker's default), `useUmriss`, `useToastConfig`, `usePortalTarget` (one other package),
`createLongPress` (one other package), `MeasureGlyph`, `ToneGlyph`, `ClockGlyph`, `CalendarGlyph`,
`DropperGlyph` (no other package, no demo page: documented only in `docs/glyphs.md` and README), `FormFieldBoundary`
(README only). Types with no consumer: `RowPlacement`, `WindowInput`, `PressPoint`.
- These are the sibling-package and test seams; they ship as public API (`index.ts` exports them without an
  `internal` marker) and become frozen at 1.0. `warnOnce(pkg, reason, message)` has 28 callers in other packages;
  `charts` keeps its own copy of `dev.ts` (`packages/charts/src/dev.ts:60,100`), so core's `warnDeprecated` and
  `warnDeprecatedTokens` (`lib/dev.ts:35,110`, not exported) have no caller left in the workspace.
- Cost later: removing an export is a major; keeping one is free. So decide now which are API and which are not.
- Smallest change: (a) delete the unused, unexported `warnDeprecated*` (S, no caller impact); (b) choose
  per-export: documented API (keep), sibling seam (keep, mark "for umriss packages" in API.md), or drop
  (`resetAnnouncer`, `hasWarned`, `mergeLanguage`, `scrollForRow`: test-only or unused). Dropping breaks a caller
  who imported them.
- M overall, S per export.

### D2. Props nobody documents or demonstrates
- `demo/unshown.json` lists 15 entries; the three "not shown yet" are `FileInputProps.defaultValue`,
  `DateTimePickerProps.defaultValue`, `DateTimeRangePickerProps.defaultValue`: the contract exists, no example
  shows it. Popover's builder props `focusRef`, `insideRefs`, `closeOnTabOut`, `onBlur` are "escape hatch for
  builders of composite fields", i.e. public and frozen for one internal use.
- Smallest change: an example each; decide whether Popover's builder props are API.
- S.

### D3. `FormFieldBoundary`, `ToneGlyph.tone`, `CalendarGlyph.range` have no props table
- `FormField/FormField.tsx:36` takes an inline `{ children }`; `ToneGlyph` and `CalendarGlyph` take
  `GlyphProps & { tone }` / `& { range? }` inline (`lib/glyphs/index.tsx:195,214`). API.md prints only `GlyphProps`
  for them, so the required `tone` prop is not documented, and `FormFieldBoundary` has no props section at all
  (the only component in the list without one; checked by comparing the Components list to the Props headings).
  `MenuSeparator`, `ModalBody`, `ModalFooter`, `TabList` print `ref?: Ref<E>` with the generic unresolved.
- Cost later: a named props type is additive; the missing documentation is what costs trust.
- Smallest change: named `FormFieldBoundaryProps`, `ToneGlyphProps`, `CalendarGlyphProps`; resolve `E` in the
  generator.
- S.

### D4. Core's `Wording` holds the other packages' words
- `lib/language/wording.ts:251-274` ("Table"), 274 (`@umriss-ui/table`), 562 (`schedule`), 637 (`dashboard`), 703
  (`calculation`), 749 (`alarms`): 443 members in one interface, most belonging to packages that depend on core.
  Every new feature of any package is an edit to core's frozen type, and a complete-object caller (allowed, see
  the file header) fails to compile when a key is added. The "Table" section at 251 is labelled "older entries"
  beside a second table section at 274.
- Cost later: moving keys out is a break (callers override `wording.columnBackward`), and adding keys is a
  compile break for whole-object callers. After 1.0 both become majors.
- Smallest change: either document that `Wording` is only ever passed `Partial` (and make the complete form
  unsupported), or give each package its own wording slot. The first is S, the second L.
- M-L. This is the biggest structural candidate in core; it needs the maintainer.

### D5. A token that nothing reads
- `styles/tokens.css:191` `--u-control-height-xs: 1.125rem`; no CSS or TSX in any package reads it (grep: only
  `tokens.css` and two CHANGELOGs). `ControlSize` has no `xs`.
- Cost later: removing a documented token is a major (ADR-0045: tokens are the styling API).
- Smallest change: delete it, or keep and document. 158 tokens in all; ADR-0045 makes every one a promise, but
  nothing marks which are for callers (`--u-toast-*`, `--u-modal-width-*`, `--u-drawer-width`, `--u-delay-*`,
  `--u-material-blur`, `--u-transform-caps` look like part of the set; `--u-button-press-scale` and
  `--u-delay-draw` look like implementation). Worth a pass before the freeze.
- S (one token), M (the pass).

## E. Defaults and doc sentences that disagree with the code

- **E1.** Glyph size defaults. API.md prints `(default: 12)` for every glyph. Code: `CrossGlyph` 9, `PlusGlyph`
  / `MinusGlyph` / `AngleGlyph` / `EndGlyph` / `GripGlyph` / `GridGlyph` / `MeasureGlyph` / `DropperGlyph` 10,
  `MoreGlyph` / `CalendarGlyph` / `ClockGlyph` 12, `ToneGlyph` 16 (`lib/glyphs/index.tsx:42,58,69,78,94,111,128,144,
  160,176,195,214,245`). The generated table takes the default from the shared `GlyphProps` comment. A caller who
  relies on the printed 12 gets a different size. Fixing the doc is no break; changing code defaults would be.
  S.
- **E2.** `useFormField` summary: "Used by Input, Select and Checkbox"; it is read by 21 files in `src`. It is
  also the only hook that can return `null` (`FormFieldBoundary` provides `null`), which `FormFieldContextValue`
  does not say. S.
- **E3.** `clearable` docs for `Input` and `Select` say "Requires a controlled field"; see B1.
- **E4.** `UmrissConfig` "every value filled in"; see B5.
- **E5.** `Tree` returns `revealCount: number`, "counts up every explicit request 'show me this node'": a counter
  leaked as state so a view can react to it (`TreeView/useTree.ts`). Frozen it becomes API. It is the one return
  field I could not read as a stable concept. Cost later: major to remove. M.
- **E6.** Several "types" lines in API.md start with a sentence that is not what the type is ("The value contract:
  every way - the grid, 'Today'..." for `DatePickerProps`, "The props resemble the union of ..." for
  `DateTimeRangePickerProps`), so a one-line reader of the generated index learns nothing. S, doc.
- **E7.** `DateTimePicker` and `DateTimeRangePicker` `onValueChange` fire only on completion while `DatePicker`
  and `DateRangePicker` fire on the click; documented in each, deliberate. Named only so that nobody files it as a
  bug.

## F. Smaller leftovers

- `TimeInput` has no `clearable`, `chars` or `placeholder`, while every other text-like field has `chars` and the
  pickers `clearable`. `RadioGroup`, `SegmentedControl`, `Slider`, `RangeSlider` have no `invalid` prop (they read
  it from `FormField` only). Adding is additive. S each.
- `Combobox` and `MultiSelect` options: `ComboboxOption` `{value, label, disabled}`, `MultiSelectOption` the same
  shape, `RadioOption` adds `description`, `SegmentedOption` adds `icon`: four option types of one shape; one
  `Option<T>` would remove three exports (breaks type imports). S.
- `DateRange` is `{ from, to }`, `RangeSlider` is `[from, to]`, form names are `startName` / `endName`:
  three spellings for the two ends of a range. Documented. A rename would break; I would only list it.
- `Select.onClear` resets "to the placeholder option" while `Input.onClear` leaves clearing to the caller; see B1.
- `Splitter.min` defaults to 0 and Enter "collapses to `min`": a default of 0 means a separator that can hide a
  pane unless the caller sets `min`. A surprising default, not a bug; changing it is a break.

## Which would break a caller if fixed (summary)

A1 (density word), A2 (`showLabel`), A3 (if open/close is unified, aliases first), A4 (renamed tone members),
A5 (type renames; type-only), B1 (`clearable` behaviour), C1-C4 (narrowing), D1 (removing exports), D4 (moving
wording keys), D5 (removing a token), E5 (`revealCount`). Doc-only or additive: A6, B2, B3, B5, B6, D2, D3, E1,
E2, E6, F items.

## What waiting costs

Everything marked "breaks" costs a major after 1.0; everything else can follow in a minor. The three that cost
most to leave are A1 (the table and calculation props follow it), D4 (the `Wording` shape is what every
language file and every application's override is typed against), and D1 (every export is a promise).
