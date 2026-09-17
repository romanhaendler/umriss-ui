# 02 — The pickers and the clock

Status: done

Spec: `.scratch/library-audit/spec.md`

## Scope

`packages/ui/src/components/DatePicker/` — `DateTimePicker.tsx`,
`DateTimeRangePicker.tsx`, `DatePicker.tsx`, `zeit.ts`, `BereichsTrigger.tsx`,
and `lib/sprache/wortlaut.ts`.

Bugs (the first was run, the rest read):

- **"Jetzt" during the doubled hour.** `DateTimePicker.tsx:130-142` decomposes
  `new Date()` into fields and resolves them through `loeseLokaleZeit`,
  choosing `frueh` on `doppelt`. During the second 02:30 of the autumn change
  it emits the first — sixty minutes early. Fix: "Jetzt" truncates seconds
  and emits the instant it has. An exact instant has nothing to resolve.
- **Reopen resets the choice.** `openPanel` seeds the time fields from `value`
  but sets `dstWahl` (`DateTimePicker.tsx:97`) and `dstWahlVon`/`dstWahlBis`
  (`DateTimeRangePicker.tsx:167-168`) to `"frueh"`. A value that *is* the
  later occurrence reopens as the earlier one and moves an hour on
  "Übernehmen". Fix: one helper in `zeit.ts` that derives the choice from
  `value.getTime()` against the resolved `frueh`/`spaet`; both pickers use it.

Inconsistencies between the four:

- Enter in the time row commits in `DateTimeRangePicker.tsx:432-440` and
  does nothing in `DateTimePicker.tsx:215-228`. The single picker gets the
  same handler.
- `DateTimeRangePicker.tsx:117` uses the constant `STANDARD_PRESETS`;
  `DateRangePicker.tsx:81` uses `standardPresets(wortlaut)`. The former
  follows the latter, so `wortlaut.presets` reaches both.
- `DateTimeRangePicker.tsx:407` names its panel with
  `zeitraumMitZeitPlatzhalter`, a placeholder key. It gets a
  `zeitraumMitZeitPanel` entry; the placeholder key is removed if unused.
  The clear-× of the two range pickers share `zeitraumLeeren`; add
  `zeitraumMitZeitLeeren` so an application can word them apart.
- `DatePicker.tsx:82-119` and `DateTimePicker.tsx:146-183` draw their trigger
  inline; the range pickers use `BereichsTrigger`. All four use it.
- `DateTimeRangePicker.tsx:445` wraps its checkbox in a second
  `FormFieldBoundary` although the popover already resets the context; drop
  it. `effektivBisZeit = ganztagEnde(withSeconds)` (line 199) allocates each
  render and defeats two memos; memoise it.

Left alone, on purpose: the compat re-exports in `format.ts`,
`DateTimePicker.tsx:17-20`, `DateRangePicker.tsx:17-18`, `Kalender.tsx:21-25`
— removing them is a `Geändert` entry for another day. The arrow-only
calendar keyboard model (no Home/End/PageUp/PageDown) is a feature gap, not
a defect.

## Acceptance

- `zeit.test.ts`: the seeding helper returns `frueh` for the earlier instant,
  `spaet` for the later, and `frueh` for an unambiguous time.
- New `tests-unit/datePicker.test.tsx` (jsdom, TZ pinned as today): "Jetzt"
  at a frozen instant inside the doubled hour emits that instant to the
  minute; reopening a later-occurrence value and pressing "Übernehmen"
  emits the same instant; Enter in the single picker's minute field commits;
  a `wortlaut.presets` override changes the label in both range pickers.
- `sprache.test.tsx` covers the two new entries and the removed one.
- The two `react-hooks/exhaustive-deps` warnings at
  `DateTimeRangePicker.tsx:217-218` are resolved, either by listing `loese`
  or by a disable that names why it is safe (it closes only over
  `withSeconds`).
- No baseline moves; `BereichsTrigger` renders pixel-identical to the inline
  triggers or the migration is not accepted.

## Comments

**11 Sep 2026 — delivered.** "Jetzt" truncates on the time axis
(`schneideZeitpunktAb`, `zeit.ts`): `setSeconds(0)` would resolve the doubled
wall-clock time to the earlier occurrence and reintroduce the bug. The seeding
helper is `dstWahlFuer` (named `dstWahlVon` until the review, because
"Von" also means the start of a range next to it). The two lint warnings are
gone without a disable: `loese` and `aufloesen` moved to module scope. The four
triggers render the same DOM through `BereichsTrigger`; the full Playwright
suite moved no baseline.
