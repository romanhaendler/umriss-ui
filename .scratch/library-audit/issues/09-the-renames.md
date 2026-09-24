# 09 — The renames

Status: wontfix

Spec: `.scratch/library-audit/spec.md`
Decided in: `issues/06-one-grammar-for-the-surface.md`,
`docs/adr/0015-props-are-english-identifiers-are-german.md`

## Scope

The mechanical work that follows from ticket 06. Three parts, each its own
commit.

### A — Props become English (ADR-0015)

Every rename keeps the old prop as a deprecated alias for one minor version:
the old name stays in the props interface with `/** @deprecated … */`, the
destructuring pattern reads `new ?? old`, and a DEV `warnOnce` (charts:
`dev.ts`; ui: add the same helper to `lib/`) names the replacement once. String
literal values a prop takes directly change with it; the old literal is accepted
for the same version and mapped at the destructuring pattern. Types and the keys
of object-valued props stay German (ADR-0015, Scope) and are **not** on this
list.

`@umriss/charts`:

| Where | Old | New | Literal values |
|---|---|---|---|
| `SerienBasis` (every series) | `ton` | `tone` | `"warnung"` → `"warning"`; `"ok"`, `"alarm"` stay |
| `StateBand` | `zustaende` | `states` | |
| `StateBand` | `spurVon` / `spurBis` | `laneFrom` / `laneTo` | |
| `Span` | `bis` | `end` | |
| `Span` | `hoehe` | `height` | |
| `Matrix` | `wert` | `value` | |
| `Matrix` | `faerbung` | `coloring` | |
| `XAxis`, `YAxis` | `kalender` | `calendar` | |
| `Limit`, `LimitBand` | `stufe` | `severity` | `"warnung"` → `"warning"` |
| `Limit`, `LimitBand` | `rolle` | `type` | `"spezifikation"` / `"eingriff"` / `"zone"` → `"specification"` / `"control"` / `"zone"` |
| `Limit`, `LimitBand` | `imBereich` | `inDomain` | |
| `LimitBand` | `von` / `bis` | `from` / `to` | |
| `ControlChart` | `herkunft` | `origin` | |
| `ControlChart` | `regeln` | `rules` | |
| `ControlChart` | `zonenLinien` | `zoneLines` | |
| `ControlChart` | `labelOben` / `labelUnten` | `upperLabel` / `lowerLabel` | |
| `ControlChart` | `onVerletzungen` | `onViolations` | |

`@umriss/ui`:

| Where | Old | New |
|---|---|---|
| `Stat` | `einheit` | `unit` |
| `Stat` | `nachkomma` | `decimals` (as on `NumberInput`) |
| `Stat` | `grenzwerte` | `limits` |
| `Stat` | `verlauf` | `trend` |
| `Stat`, `AlarmList` | `stand` | `asOf` (glossary: **As-of time**) |
| `Stat`, `AlarmList` | `schwellen` | `freshness` (glossary: **Freshness**; not `thresholds`, which the glossary avoids for a limit) |
| `AlarmList` | `sicht` | `view` |
| `AlarmList` | `auswahl` | `selection` |
| `AlarmList` | `onQuittieren` | `onAcknowledge` |
| `TreeView`, `TreeSearch` | `baum` | `tree` |

### B — The accessible name (ADR-0015)

| Where | Old | New | Why |
|---|---|---|---|
| `TreeView` | `ariaLabel` | `aria-label` | names the root (`role="tree"`) |
| `Dock` | `label` | `aria-label` | names the root strip |

`Popover.ariaLabel` stays: its panel is portalled. `Meter.label` and
`TableFilter.label` stay: they say what is measured or filtered.

### C — The README principles and the tone set

Principle 1 — forward `ref`, accept `className`, spread rest on the root.
Not met today (surveyed on `main`, 11 Sep 2026): `AlarmList`, `Badge`,
`Card`, `Combobox`, `CommandPalette`, `ConfirmDialog`, `EmptyState`,
`FormField`, `Modal`, `MultiSelect`, `Skeleton`, `Spinner`, `Stat`, `Tabs`,
`TreeView`, `TreeSearch`, `Sparkline`, `Meter`, `DatePicker`,
`DateTimePicker`, `DateRangePicker`, `DateTimeRangePicker`. Re-check each
against its source before starting: a component that already takes
`className` through `HTMLAttributes` may need only the ref. The wrappers
`Popover`, `Tooltip`, `Menu` and `ToastProvider` are exempt.

Principle 2 — `Tabs` gains `defaultValue` (and `onChange` becomes optional);
`Card` gains `collapsed` and `onCollapsedChange` next to `defaultCollapsed`.

Tones — `Toast` gains `accent`. The five-tone union becomes one exported type in
`lib/` that `Alert`, `Badge`, `Tag`, `Meter`, `Toast` and `lib/rolleVonTon.ts`
use; `AlertTone` and `ToastTone` stay as aliases of it. `Sparkline`, `Menu` and
`ConfirmDialog` keep their own sets.

When C is done, the README loses its "Noch nicht erfüllt" lists.

## Out of scope

- Component names (`TagGruppe`), exported functions and hooks (`pareto`,
  `useBaum`, `meldeModell`) and their options — ADR-0015, Scope.
- Removing the aliases. That is the next minor version and its own `Geändert`.

## Acceptance

- `dist/index.d.ts` of both packages is built before and after and diffed; the
  diff contains only the renames, their deprecated aliases and the additions of
  part C. The diff is attached to the delivery note.
- A test per package renders one component with an old prop name and asserts
  it still works and warns once.
- Every demo example and the charts demo use the new names; `pnpm --filter
  @umriss/ui typecheck` regenerates `props.json`, and the props tables show the
  new names with the old ones marked deprecated.
- `packages/ui/CHANGELOG.md` and `packages/charts/CHANGELOG.md` each carry a
  `Geändert` entry listing old → new.
- No screenshot baseline moves.

## Comments

### Status corrected (2026-09-24)

Superseded by `english-and-umriss-ui` and ADR-0018, which rules out deprecated aliases; the renames themselves are in (`laneFrom`, `tone`, `Stat.asOf`). The Status line had not been moved when the work landed.
