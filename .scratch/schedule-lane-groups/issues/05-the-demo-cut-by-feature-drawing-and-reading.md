# 05 — The demo cut by feature: Drawing and Reading

Status: done
Type: task

Blocked by: 02, 03, 04
Spec: `.scratch/schedule-lane-groups/spec.md` (user stories 21, 22, 26, "The demo")

## Scope

- The rubrics Drawing and Reading with the chapters the spec lists (the chapter *Lane groups* is created by 08, not here).
- One feature per example: `route`, `attach`, `ends` apart; one example per appearance; `in-step` split into linked schedules and the handle.
- `outline.ts`, `data-example` callers, the named lists in the specs and the snapshot names move together.

## Acceptance

- A renamed example shows an unchanged picture under a new name; the ticket states how that was verified (hash or pixel comparison old against new).
- Count of pictures removed, renamed and new, stated.
- The demo's overview counts what is there; all suites green.

## Comments

### Delivery

The outline is the table of contents of the component now, not a list of its
four exports. **Drawing** has eleven chapters and **Reading** five; the chapter
*Lane groups* is left for 08, as the ticket says.

    Drawing   First schedule · Lanes · Time axis and calendar · Pan and zoom ·
              Now line · Subtasks · Bar labels · Appearances · Overlap ·
              Transports · Routes
    Reading   Selection · Interactions · Tooltip · Linked schedules ·
              The handle

One feature per example, which needed four splits:

- **Appearances** was one example showing seven lanes at once. It is five now -
  `provisional`, `fixed`, `muted`, `progress`, `open` - each with the marked
  bar beside an unmarked one at the same times, which is the only way a
  statement about a MARK can be read: against the thing it is not.
  `combinations` stays as the sixth.
- **`routes`** showed `route`, `attach` and `ends` in five schedules. It is
  three examples on two pages: `routes` keeps the shape, `Transports/02-attach`
  and `Transports/03-ends` take the other two.
- **`in-step`** taught two things. The pair in step stays under *Linked
  schedules*; the pin and `positionAt` moved to *The handle*, which is its own
  chapter and shows both directions of `ScheduleHandle`.
- **Pan and zoom** had no example at all - it was demonstrated in passing on
  the first schedule, and four browser tests aimed at it there. It has a
  chapter, an example with its own plant, and those four tests.

### How the renames were verified

Two ways, and both are in the repository rather than in this report:

1. **The files.** Every moved example was moved with `git mv` and not edited;
   git records them as pure renames at 100 per cent similarity. The code that
   produced the picture did not change at all, which is stronger than any
   comparison of the pictures.
2. **The pictures.** Ten baselines are **byte-identical under their new name** -
   git detects them as renames too: `many-lanes`, `now-line`, `overlap`,
   `operating-calendar` and `combinations`, light and dark.

The other five renamed examples - `selection`, `interactions`, `tooltip`,
`own-tooltip`, `bar-labels` - re-rendered, and were compared pixel by pixel
before being renewed. The result: **the plot is byte-identical; every
difference is in antialiased TEXT.** Measured on `selection`, 988 × 404:

    whole image        6392 of 399152 differ
    the plot only         0   (bars, lines, grid, findings)
    the lane headers   1147   (text)
    the time labels    2338   (text)

and on `tooltip`, 0 inside the plot as well. The cause is the cut itself: an
example now sits at a different scroll position on a shorter page, and the text
lands on a different subpixel. It is the same drift `docs/testing.md` records
under **Known open** for the charts, which sits "on the numeric tick labels and
along the marks" - it has reached the schedule's pictures because its examples
moved, and ticket 11 should say so there.

Two examples changed on purpose and are not renames: `routes` (five variants
became three) and `in-step` (the pin left for its own chapter).

### Tests

- `plot.ts` already named lanes instead of numbering them (04), so not one of
  the pixel tests needed a new coordinate when the examples moved.
- Two wheel tests stopped measuring the PAGE'S scroll position and now read the
  mechanism itself - whether the schedule prevented the wheel's default. They
  had failed for a reason that had nothing to do with schedules: the chapters
  are short pages, and a short page cannot scroll. `watchWheel` is the helper
  and says so at its site.
- `features-page` moved to the `appearances` page, which is now the one with
  three examples.
- All schedule suites: 243 passed, 117 skipped.

### Pictures

70 baselines read beforehand, **110 now**:

- **10 renamed, byte-identical** (see above).
- **16 removed**: the ten that re-rendered under a new name, `subtasks--appearances`
  (split into five), `transports--routes` and `schedule--in-step` (both split).
- **8 modified**: the page heads of `overview`, `schedule`, `lane` and
  `transports` - their names, sentences and example lists changed.
- **56 added**: 24 page heads for the twelve new chapters, 18 for the nine new
  examples, and 14 re-rendered under new names.
