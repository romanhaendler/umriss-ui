# What of core's surface changes before 1.0

Type:   grilling
Status: resolved
Blocked by: 01

## Question

"The surface of core" returned groups of candidates whose change breaks a caller
(`.scratch/release-1-0/research/04-the-surface-of-core.md`). For each: before 1.0, or frozen as it stands, and
under which name or shape?

- **Density's word**: `"comfortable"` or `"regular"` beside `"compact"`. It decides the table's and the
  calculation's props too.
- **`Wording`**: one interface of 443 keys accepted whole, so a new key in any package fails a caller's
  compile. What does a caller pass, and what may a minor add?
- **The exports nothing uses**: kept, marked as a seam for the sibling packages, or dropped.
- **`clearable` without `onClear`** on Input, Select and TreeSearch.
- **`showLabel` / `showValue`** on Meter, ProgressBar and Slider, and their defaults.
- **Open and close**: `onClose` or `onOpenChange`, and a controlled Menu.
- **The tones' members** across components, and the type names `Key` and `Side`.
- **`useTree`'s `revealCount`**.

Every one breaks a caller, so every one is the maintainer's. The answer is one line per group, shaped for
`/to-spec`. What is not a break (the glyphs' defaults in `API.md`, the undocumented exports, the unread
token, dead code) the agent decides.

## Answer

The maintainer answered twelve questions (2026-11-23). Letters are the findings' sections in
`.scratch/release-1-0/research/04-the-surface-of-core.md`. All before 1.0; each rename keeps its old name
for one minor (ADR-0066), each break carries its migration line.

**Changes, each a break:**

- **Density is `"regular" | "compact"` everywhere** (A1): core's `Density`, the provider and the hooks give
  up `"comfortable"`. `useDensity()` returns `undefined` where nobody set one. The table, the calculation and
  `AlarmList` keep their word. `CONTEXT.md`'s entry "Density" changes with the code.
- **`Wording` stays one interface; a caller hands in a part** (D4, C5): overrides are typed
  `Partial<Wording>`, the complete form is for umriss's own language files. A new key in a minor is then no
  break. The keys stay in core; no package gets a wording of its own.
- **Six exports go** (D1): `hasWarned`, `mergeLanguage`, `scrollForRow`, and the types `RowPlacement`,
  `WindowInput`, `PressPoint`. Everything else stays: the glyphs, `FormFieldBoundary`, `resetAnnouncer`,
  `usePortalTarget`, `createLongPress`, `warnOnce`.
- **The cross clears the field** (B1): `clearable` on `Input`, `Select` and `TreeSearch` clears, controlled
  or not, and reports through `onValueChange`; `onClear` goes.
- **`showLabel` becomes `showValue`** on `Meter` and `ProgressBar` (A2); the two defaults stay.
- **`CommandPalette.onChoose` becomes `onSelect`** (A3). Open and close stay: `open` + `onClose` on `Modal`,
  `Drawer`, `ConfirmDialog`, `CommandPalette`; `onOpenChange` on `Popover` and `ContextMenu`. A controlled
  `Menu` can come after 1.0.
- **`MenuItem.tone`'s `"default"` becomes `"neutral"`** (A4). `ConfirmDialog`'s, `TextTone` and `Toast`'s stay.
- **Type names** (A5): `Key` becomes `TreeKey`, `Side` `LimitSide`, `Direction` `TreeDirection`, `Align`
  `PopoverAlign`.
- **Narrower values** (C1, C2): `Input` and `Textarea` take `string | null`; `Select` gives up the native
  `multiple`, its value is `T | null`. A toast's id stays a number.
- **`@experimental` at 1.0** (E5, D2): `revealCount` in `useTree`'s return; `Popover`'s `focusRef`,
  `insideRefs`, `closeOnTabOut`, `onBlur`.
- **`--u-control-height-xs` goes** (D5): no rule reads it (checked; "Tokens and wording as surface" was
  wrong to count none unread).

**Frozen as it stands** (B2, B4, B7, F): `size` in its meanings; `name` on `RadioGroup`; `Accordion.value`
as a list; the four option types; `{from, to}` beside `[from, to]`; `Splitter.min` at 0.

*(agent)*, no break: the glyphs' defaults in `API.md`; named props types for `FormFieldBoundary`,
`ToneGlyph`, `CalendarGlyph`; one exported `Tone` type; `presets` as `readonly`; the doc sentences of
`UmrissConfig` and `useFormField`; the rules for `size` and `aria-label` written once. `warnDeprecated*`
stays: ADR-0083 keeps the rename mechanism.
