# Shakedown: every component on a phone, beside the native control (0.40.4)

Status: needs-triage

All six packages on iPhone 13 (WebKit) and Pixel 7 (Chromium), touch, portrait and landscape, each
component beside its native counterpart with the same task, counting taps, swipes and characters,
2026-10-24. **On desktop the library keeps its own design**; the question is touch only, and each component
gets "keep on touch" or "hand over to native on `pointer: coarse`", with what the handover would lose.
Playwright renders no OS pickers: the native side marked [platform] is platform knowledge, not measured.
Hit areas, safe areas and the bottom sheet are in `mobile-touch.md`.

## Findings, by how much a phone user suffers

1. **[Misfit] DatePicker: a distant date only by month arrows** (`DatePicker/Calendar.tsx:132`, `:142`):
   17 March 1985 from October 2026 takes about 500 taps (17 s on iOS, 25 s on Android). Today 2 taps, three
   weeks out 3–4, clear 1. [platform] `type="date"`: the birthday in about 3 wheel flicks (iOS) or 4 taps
   (Android). **Hand over on touch.** Loses: formats and wording (follows the OS locale), `presets`, the
   Today/Clear footer, day verdicts; the value comes back as `YYYY-MM-DD` and must become a local-midnight
   `Date`.
2. **[Break, needs a device] NumberInput cannot take a negative number on an iPhone:** `NumberInput.tsx:224`
   sets `inputMode` "decimal"/"numeric" whatever `min` is; [platform] those iOS pads have no minus key.
   German "12,5" works. **Keep, fix the keyboard type** (e.g. `inputMode="text"` when negatives are
   allowed, or a +/- key on touch). `type="number"` would lose the notation, `decimals`, `prefix`/`suffix`.
3. **[Break, WebKit] The DatePicker's time fields drop typed digits on iOS:** `TimeField.tsx:87` selects on
   focus with `maxLength=2`; the touch's caret placement undoes the selection, so "0930" leaves `00|00`.
   Chromium works. Hour/minute arrows are 13 px high. **DateTimePicker and DateTimeRangePicker: hand over to
   `datetime-local` on touch.** Loses seconds, the Now/Apply flow, wording.
4. **[Misfit] A Tooltip never opens on touch** (`Tooltip.tsx:115` hides on pointer-down; focus shows only on
   `:focus-visible`), so an IconButton's only visible name (ADR-0039) is unreachable. **Keep, add a touch
   route** (tap or long-press for 2 s, or the label under icon buttons on `pointer: coarse`).
5. **[Break] Many tabs overflow the page at 375 px:** the tab list is `overflow-x: visible; nowrap`, the
   document grows to 856 px on iOS; on Android tab 11 cannot be tapped. **Keep, fix the overflow**
   (`overflow-x: auto` and scroll the selected tab into view).
6. **[Misfit] ContextMenu has no touch trigger** (fully controlled); [platform] Android fires `contextmenu`
   on long-press, iOS does not, and its callout fights a hold. **Keep, add a `useLongPress` helper** with
   `user-select:none` and `-webkit-touch-callout:none` on the target. (The CDP hold fired nothing - likely
   an emulation limit.)
7. **[Misfit] Tiny targets:** the TreeView chevron is 16×16 and a tap on the label does not expand; the
   Splitter separator is 8×18 (a touch drag works). **Keep, enlarge.**
8. **[Misfit] MultiSelect focuses its search field on open**, so the keyboard covers the checklist at once.
   **Keep, do not autofocus on touch.** Three of 20 tags: 4 taps, 0 characters.
9. **[Misfit] The Schedule plot traps vertical scrolling** (`touch-action: none`, `Schedule.module.css:200`):
   a schedule that fills the screen cannot be scrolled past by swiping on it; the lane headers do scroll.
   **Keep; give a scroll route or document it.**

## Handover table (touch only, desktop unchanged)

| Component | On touch | What native cannot show |
|---|---|---|
| DatePicker | hand over to `type="date"` | formats, wording, presets, Today/Clear, the `Date` contract |
| DateTimePicker, DateTimeRangePicker | hand over to `datetime-local` | seconds, Now/Apply, wording |
| DateRangePicker | needs a design: two native dates, or a year jump in the library | preview band, presets, one gesture for both ends |
| Select | already native (ADR-0043) | - |
| Combobox | keep (2 taps + typing for 1 of 200; [platform] 10–20 flicks natively) | typed filter, styling |
| MultiSelect | keep, no autofocus | search, chips |
| NumberInput | keep, fix `inputmode` | notation, `decimals`, `prefix`/`suffix` |
| Slider | keep (already a native range) | - |
| Menu, ContextMenu, Tooltip | keep | the web has no action sheet or touch tooltip |
| everything else | keep | - |

## Wishes (all unlisted)

A year/month jump in the DatePicker (MUI year view, Mantine `YearPicker`) · a long-press helper for
ContextMenu (Radix has it built in) · a touch route to the Tooltip text (MUI `enterTouchDelay`) · overflow
handling for TabList (MUI `variant="scrollable"`) · a built-in open button for the CommandPalette (kbar, cmdk)
· +/- steppers on the Slider for exact values (37 of 0–100 needs drag corrections at 3 px per unit).

## Held up

Select gives the OS picker · Popover and Menu close on an outside tap · the CommandPalette fills the screen
with a 16 px input once opened by a button · the Table frame scrolls horizontally on its own while vertical
swipes scroll the page, the pinned column sticks, row checkboxes and the ColumnMenu work · a chart tap shows
the value, an outside tap clears it, a vertical swipe scrolls the page · dashboard edit by touch drag works,
the head menu is the drag-free path · no console output anywhere.
