# 07 — `core` components A–K

Status: done
Type: task

Blocked by: 04

Spec: `.scratch/english-and-umriss-ui/spec.md`

## Scope

Runs in parallel with 06, 08 and 11. Owns 61 files under `packages/core/src/components/` and the unit tests that belong to them — tests travel with their subject so that no branch depends on another's paths.

Components: **Alert, Badge, Button, ButtonGroup, Card, Checkbox, Combobox, CommandPalette, DataViz, DatePicker, Divider, Dock, EmptyState, FormField, Input.**

- `DatePicker/` is the heavy one (15 files): `bereich.ts` → `range.ts`, `raster.ts` → `grid.ts`, `zeit.ts` → `time.ts`, `vertrag.ts` → `contract.ts`, `Kalender.tsx` → `Calendar.tsx`, `ZeitFeld.tsx` → `TimeField.tsx`, `BereichsPanel.tsx` → `RangePanel.tsx`, `BereichsTrigger.tsx` → `RangeTrigger.tsx`.
- `DataViz/skala.ts` → `scale.ts`; `Dock/platz.ts` → `place.ts`.
- CSS-module class names are part of this: a German class name is an identifier.
- Matching tests in `core/tests-unit/`: `alert`, `bereich`, `datePicker`, `dock`, `dockPlatz`, `formField`, `kommandopalette`, `monatsPaar`, `raster`, `skala`, `splitButton`, `vertrag`, `zeit`.

Prose headers translated in full. Props are already English (ADR-0015) and do not change; what changes is everything below the destructuring pattern.

## Acceptance

- `pnpm --filter @umriss-ui/core typecheck` and `test:unit` pass; `pnpm lint` clean.
- No German identifier, filename, CSS class or comment remains in the fifteen directories or their tests.
- Baselines not touched — ticket 16 owns them.
