# Core's single wishes

Type:       grilling
Status:     resolved
Blocked by: 06, 07

## Question

Take, later or never for each core wish one persona had (`.scratch/shakedown/wishes.md` section 3, "core"),
with the touch wishes already answered by "A touch size for the controls" and the pickers by "Native pickers
on touch":

password field with reveal · an icon set (a "more" glyph) · Pagination in core · inline edit · AppShell /
NavLink / bottom navigation · a list item row · per-file progress in `FileInput` · a clickable Stepper · a
signature pad · a photo-capture field with thumbnails · an open button and a remappable shortcut for the
CommandPalette · a `FormField` label slot · Button `lg` / full width · an async or virtualised Combobox ·
+/- steppers on the Slider.

And the "never" items whose *Instead* held with a gap (`wishes.md` section 1): form validation (ADR-0060)
holds, but the announcement and an error summary are missing; right-to-left stays never by ADR-0032, though it
hurts operator tools with Arabic or Hebrew staff (`audit-family.md`). Avatar is roadmap P4 - point at it.

The test for "take" is ADR-0035's audience (data-dense applications). A taken wish with an open API question
graduates to a ticket of its own on the map.

## Proposed answer

*Proposed by the agent, 2026-10-25; the maintainer decides. "(agent)" marks a technical call the map lets
the agent make. The test is ADR-0035's audience; G1 holds, so no row says "later" for want of a caller.*

Already settled elsewhere, only pointed at: touch sizes, long press for Tooltip and ContextMenu (the touch
route to Tooltip text), TabList overflow, safe areas, the palette's close cross under a finger, no bottom
sheet, no media hook, Button `lg` for touch - [06](06-a-touch-size-for-the-controls.md),
`.scratch/under-a-finger/` · the DatePicker's year and month jump, typed entry in its panel, MultiSelect
focus, NumberInput's minus key, time fields - [07](07-native-pickers-on-touch.md),
`.scratch/date-jump-and-typed-entry/`; a typed trigger (`DateInput`) stays "later" there (typed entry in
the panel answers the 480 clicks; this ticket does not list it) · `ref.focus()` on Combobox, MultiSelect
and the pickers - [05](05-one-root-contract-across-the-packages.md), `.scratch/root-contract/` · the theme
object - [20](20-a-theme-object.md), `.scratch/theming-recipe/` · a Popover that moves focus in - fixed,
`.scratch/shakedown-defects/` (dialog-role focus) · **Avatar** - roadmap P4
(`.scratch/open-points-roadmap/spec.md`, package C) · a list of notifications with their instant and state -
roadmap P5 **Timeline**, package C.

| Wish | Recommendation | Reason | Spec or size |
|---|---|---|---|
| Password field with reveal | **never** as a component; an example | A login is mostly the identity provider's page, not the data-dense screen. Where a secret is typed (an API token, a service password) the Instead is 12 lines: an `Input` whose `type` an `IconButton` beside it toggles, the eye from the application's icon set. An end-adornment slot inside `Input` is never too: `chars` counts the field's own chrome (ADR-0041), and a foreign node of unknown width breaks that arithmetic. | S · spec E |
| An icon set | **never** for a set; **take** one glyph, `MoreGlyph`, straight to spec | The **Icon** is the caller's (`CONTEXT.md`, ADR-0039): `IconButton` takes Font Awesome's, lucide's or the application's own, and the glyph set holds what the library itself draws. The library already draws a "more": the table's row-actions trigger writes "⋯" as text (`table/src/rowActions.tsx`), outside the glyph specification its test holds. Drawn as `MoreGlyph` (three dots to the glyph spec, agent), exported and used by the row actions, it is also every application's Menu trigger. Eye and search stay the icon library's. | S · spec A |
| Pagination in core | **never** | A paged list of records is a table, and `@umriss-ui/table` pages it (`Pagination`, standing outside the table by `of`); the core-only screens counted the table package replacing ~40 lines. A pager for cards beside it would be a second Pagination with its own wording and keys; a card list that pages is two Buttons and a Text. | - |
| Inline edit | **never** | No comparable library has one (`core-screens.md`: "-"); 14 lines of app state (a Text that becomes an `Input` with Save and Cancel). Tabular data edits in the grid (ADR-0036). | - |
| AppShell, NavLink, bottom navigation | **never**; one shell example | The page frame and the router are the application's; `Stack`, `Grid`, `Splitter` lay out what the developer decided (ADR-0060), and Drawer navigation held in the shakedown. A NavLink is the router's (react-router's sets `aria-current="page"`). A bottom tab bar is a phone app's pattern; [06](06-a-touch-size-for-the-controls.md) gives it what touch needs (44 px, the safe area). The example: a header, a side nav of router links that becomes a `Drawer` below a width, `aria-current` on the page's link. | S · spec E |
| A list item row (and a dot badge) | **never** for a generic row; point at P5 | A list of records is a table; a list of events is the Timeline (P5). The Badge carries its status dot already (`.scratch/badge-dot-round/`). | - |
| Per-file progress in `FileInput` | **never** in the field; an example | "Nothing is uploaded - that is the application's" (FileInput). The Instead holds: `FileInput` as a pure drop zone held up (refused types named); `value={[]}`, the files in the application's state, its own list with a `ProgressBar` and a state per file. 25 lines. | S · spec E (with the next row) |
| A photo-capture field with thumbnails | **never**; the same example | `accept="image/*" capture="environment"` already works; the thumbnail is `URL.createObjectURL(file)` in the application's list of the row above. One example answers both. | spec E |
| A clickable Stepper | **never** as a prop; an example | "Moving on is the caller's" (Stepper): `current` is a prop, and a step's `label` is a `ReactNode`, so a done step's label can be a `button` or a link. Focus on step change is the application's (focus the new step's heading). `Stepper/04-move-on-yourself` gains a done step to go back to. | S · spec E |
| A signature pad | **never** | A capture surface is a product of its own, as ADR-0032 argues for rich text (`signature_pad` exists; not in MUI or Mantine; the persona called it marginal under ADR-0035). No ADR: nothing is built, a later "take" is additive. | - |
| An open button for the CommandPalette | **never**; it exists | The palette is controlled (`open`), and its examples open it from a `Button` (`CommandPalette/01-commands`). The close cross under a finger is 06's. | - |
| A remappable palette shortcut | **take**, straight to spec | WCAG 2.1.4: a single-key shortcut ("/") must be possible to turn off. Today the hook takes only `onOpen`, fires on a focused `<select>` and on ARIA textboxes and comboboxes, and opens over an open Modal. (agent) `useCommandPaletteShortcut(onOpen, { slash?: boolean })`, default `true`; another key is the application's own listener calling the same `onOpen`, so remapping needs no API. The guard also skips `select`, `role=textbox`/`combobox` and a key pressed inside an open modal dialog. | S · spec A |
| A `FormField` label slot | **take**, two parts: a token, and the label beside its field | `label` is a `ReactNode`, so the slot exists. Missing are (1) its style - the label shares `--u-text-sm` with every control (`FormField.module.css`) - answered with a token by ADR-0045 (agent: `--u-label-size`), and (2) its placement: a dense settings form or property panel reads as a label column beside the fields, and no token reaches it, since the root is a flex column. (agent) `labelPlacement="start"` on `FormField`: label and field on two tracks, the hint or error under the field, the label track's width a token; below a container width it stacks. | token S · `.scratch/theming-recipe/`; placement S-M · spec A |
| Button `lg` / full width | **never** | `lg`: 06 answered touch (`md` is 44 px under a finger), and a data-dense screen has no hero button. Full width: one line, `style={{ width: "100%" }}` or a class, which land on the button itself (root contract, element shape); ADR-0041 rejected a `fullWidth` flag for fields for the same reason. | - |
| An async or virtualised Combobox | **take**, straight to spec | Choosing one of thousands (assets, tags, customers) is the audience's daily case. Virtualised (agent): the shared listbox (`lib/listbox`) draws its window through `useVirtual` above a count, for Combobox and MultiSelect alike (10,000 options open in 2.4 s today), with `aria-setsize`/`aria-posinset` on the drawn options. Async (agent): the Combobox reports its typed text (`onSearch`), takes `loading`, and with `filter={false}` shows the options as given; debounce and cancel stay the application's. Groups and custom option rendering are not proposed. | M · spec B |
| +/- steppers on the Slider | **never**; it exists | `Slider/03-set-roughly-then-exactly`: a `NumberInput` with its steppers on the same state gives the exact figure; the Slider's arrow keys step by one. | - |
| `min` and `max` on the pickers (raised by 07) | **take**, straight to spec | A report's dates run from where the data starts to today; a year list of ±100 years with every day enabled invites values the application must then refuse. (agent) day-granular `min`/`max` on all four pickers: the year Select holds only years in range, days outside are disabled and skipped by the grid keys, Today and a preset outside the range are disabled, a typed date outside is refused with the panel's message. The DateTimePicker bounds the day, not the time. | S-M · a ticket in `.scratch/date-jump-and-typed-entry/` |
| Form validation: announcement and error summary | **never** a helper (ADR-0060 stands); an example | The Instead holds: the core-only screens built an error summary whose links focus every control, Combobox and DatePicker included. Missing is the recipe: `FormField/04-check-an-invoice-on-submit` neither focuses the first invalid field nor announces, and `accessibility.md` 10 is struck through as fixed though no example does it. The example gains `announce(...)` with the count, focus on the first invalid field (after 05's `ref.focus()` on the pickers) and a GOV.UK-style summary of links. | S · spec E |
| Right-to-left | **never stands** (ADR-0032) | The Instead (a general library) was not tried, so the shakedown did not show it failing - the map's condition for reopening an ADR. RTL mirrors every component and the canvas axes. The reader with Arabic or Hebrew staff is real; the screen that needs it reopens 0032 on this point by a superseding ADR. | - |

**Specs these become** (agent):

- **A - core's small additions** (one spec, no ADR): `MoreGlyph` with the table's row actions on it, the
  palette shortcut's `slash` switch and guard, `FormField labelPlacement="start"`.
- **B - long option lists** (one spec, no ADR): the virtualised listbox for Combobox and MultiSelect, the
  async Combobox.
- **The pickers' bounds**: a ticket in `.scratch/date-jump-and-typed-entry/` - it shares the year Select and
  the typed entry's refusal.
- **The label token**: one more token in `.scratch/theming-recipe/`, beside the modal widths, the capitals
  and the press scale.
- **E - recipes in core's demo** (one spec, examples only): a secret with reveal, files with progress and
  thumbnails, a clickable Stepper, a form's error summary with announcement and focus, an app shell.

## Answer

Decided 2026-10-25 by the maintainer: the proposed answer above, as it stands. It becomes the specs `.scratch/core-small-additions/` (MoreGlyph, the palette shortcut, `labelPlacement`, the recipes) and `.scratch/long-option-lists/`, plus tickets added to `.scratch/date-jump-and-typed-entry/` (the pickers' `min` and `max`) and `.scratch/theming-recipe/` (the label token).
