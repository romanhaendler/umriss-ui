# What of the young packages' surface changes before 1.0

Type:   grilling
Status: resolved
Blocked by: 01, 15, 16

## Question

"The surface of the three young packages" found the calculation and the dashboard fit to freeze and the
alarms the least settled (`.scratch/release-1-0/research/08-the-surface-of-the-three-young-packages.md`).

- **Alarms at 1.0**: frozen whole, frozen with parts marked as "What 1.0 promises" allows for the unfinished,
  or held back. Its projection and input are the table's model types, so the answer follows what "What of
  the table's surface changes before 1.0" does with the pure model.
- **`freshness` or `ages`** for a `FreshnessAges` prop, and one type for `asOf`.
- **Density** on the calculation and `AlarmList`: follows the word "What of core's surface changes before
  1.0" picks; do their defaults (regular, compact) stay?
- **The dashboard**: `catalogue` as prop and as function; `defaultView` / `initialView` against React's
  `default*`; the stored `DashboardView` as a format that is frozen with 1.0.

Every one breaks a caller, so every one is the maintainer's. The answer is one line per point, shaped for
`/to-spec`. What is not a break (`lifecycleAt` named but not exported, the dashboard's `API.md`) the agent
decides.

## Answer

The maintainer answered eight questions (2026-11-23). Letters are the findings' in
`.scratch/release-1-0/research/08-the-surface-of-the-three-young-packages.md`. All before 1.0; each rename
keeps its old name for one minor (ADR-0066), each break carries its migration line.

**Alarms**

- **Goes to 1.0 with the others** (A3). Frozen: `AlarmList`, `AlarmBanner`, `PriorityMark` and the lifecycle
  functions (`acknowledge`, `snooze`, `disable` and those beside them). `@experimental`: what is made of the
  table's model types - `alarmModel`, `AlarmProjection`, `alarmColumns`, `ALARM_COLUMNS`, `DEFAULT_ORDER`.
- **`freshness` becomes `ages`** on `AlarmList` and `AlarmBanner` (A1), a break. `asOf` takes `Date | number`
  everywhere: `AlarmInput` is widened; `null` leaves the alarm components unless it turns out to mean
  something of its own there, which then goes back to the maintainer.
- **"snooze" in code, "Shelve" on screen stays** (A4), as `CONTEXT.md` records it.

**Dashboard**

- **`catalogue()` in the hook's return becomes `openCatalogue()`** (D3), a break. The prop `catalogue` stays.
- **`defaultView` and `initialView` stay** (D4): the table's pair, in the table's meaning.
- **`DashboardView` is the supported storage format** (D1), and the documents say so: an addition is a
  minor; renaming or removing `widgets`, `type` or `size` is a major.

**Calculation and the rest**

- **Density's defaults stay**: `"regular"` in the calculation, `"compact"` in `AlarmList`.
- **Frozen as it stands** (C3, A5, D5): the restrictions of `metrics` as run-time errors; `snooze`'s
  positional arguments; `hiddenOnly` controlled only; `WidgetType` exported directly and from the hook.

*(agent)*, no break: `lifecycleAt` is exported, as the 0.47 changelog says; `AlarmType.returnBand.limit`
becomes optional; the dashboard's `API.md` closes with the generator; the doc sentences of `PriorityMark`,
`snoozeDurations` and `AlarmList.density`; the calculation warns in development where `emphasis` or `rule`
stand on the result.
