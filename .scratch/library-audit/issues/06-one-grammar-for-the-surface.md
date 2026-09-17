# 06 — One grammar for the surface

Status: done

Spec: `.scratch/library-audit/spec.md`

## Scope

Three decisions the maintainer must take, each with a recommendation, and
the mechanical work that follows from them. The decisions are recorded as
one ADR; the work is then `ready-for-agent`.

**Decision 1 — the language of public props.** `CONTEXT.md` fixes
identifiers German and prose English and says nothing about props. The Dock
(`Dock.tsx:65-67`) and the palette (`CommandPalette.tsx:94-100`) chose an
"English outside" in their headers. The charts instruments chose German:
`zustaende`, `spurVon`, `spurBis` (`StateBand.tsx`), `bis`, `hoehe`
(`Span.tsx`), `wert`, `faerbung` (`Matrix.tsx`), `kalender` (`Axis.tsx`),
`ton` (`SerienBasis`), `rolle`, `imBereich`, `stufe` (`Limit.tsx`), `herkunft`,
`regeln`, `zonenLinien`, `labelOben` (`ControlChart.tsx`) — next to
`strokeWidth`, `barWidth`, `markers`, `radius`, `fillOpacity` on the four
original series and `axisId` next to `xAxisId`/`yAxisId`. In ui the same
mixture exists on `Stat` (`einheit`, `nachkomma`, `grenzwerte`, `verlauf`,
`stand`, `schwellen`) and `AlarmList` (`sicht`, `auswahl`, `onQuittieren`).
*Recommendation:* English outside, German inside — the rule the Dock wrote
down. Rename with deprecated aliases for one minor version, a `Geändert`
entry, and the ADR.

**Decision 2 — the accessible-name prop.** Three spellings: `ariaLabel`
(`TreeView`, `Popover`), `label` (`Dock`, `Meter`, `TableFilter`),
`"aria-label"` (`ButtonGroup`, `TagGruppe`, and every component that spreads
rest). *Recommendation:* the native spelling `aria-label` wherever the named
element is the root; `ariaLabel` only where it is not (`Popover`, whose panel
is portalled). `Meter.label` and `TableFilter.label` stay: they are semantic
("what is measured", "what is filtered") and feed the name rather than being
it.

**Decision 3 — the README's principles.** README "Prinzipien für neue
Komponenten" 1 and 2 are violated by the code: no `forwardRef` on
`AlarmList`, `Badge`, `Card`, `Combobox`, `CommandPalette`, `EmptyState`,
`FormField`, `Menu`, `MultiSelect`, `Popover`, `Skeleton`, `Spinner`, `Stat`,
`Tabs`, `Toast`, `Tooltip`; no `className` on `Combobox`, `MultiSelect`,
`CommandPalette`, `Menu`, `ConfirmDialog`, `TreeSearch`; `Tabs`
controlled-only, `Card` uncontrolled-only. *Recommendation:* every component
that renders a root element forwards `ref`, `className` and rest (`Popover`,
`Tooltip`, `Menu` and `Toast` are wrappers and are named as the exceptions);
`Tabs` gains `defaultValue`; `Card` gains `collapsed`/`onCollapsedChange`;
`Combobox`, `MultiSelect`, `Modal`, `CommandPalette` are named in the README
as controlled-only with their reason, which each already states in its
props.

Also in this ticket, because they are the same question: the tone
vocabularies. `Alert`/`Badge`/`Tag`/`Meter` share five tones; `Toast` has four
(no `accent`); `Sparkline` has `ink|accent`; `Menu` `default|danger`;
`ConfirmDialog` `primary|danger`. *Recommendation:* leave `Sparkline`, `Menu`
and `ConfirmDialog` — they are different questions — and give `Toast` the
fifth tone so the five-tone set is one type exported from `lib/`.

## Acceptance

- `docs/adr/0015-<slug>.md` records decisions 1 and 2 with the alternatives.
- `CONTEXT.md` gains a line under **Language** stating the prop rule.
- README principles 1 and 2 name their exceptions.
- After the decisions, a follow-up ticket (`09-…`) lists every rename with
  its alias, and lands with `packages/ui/CHANGELOG.md` and a new charts
  changelog entry (ticket 08) under `Geändert`.
- `dist/index.d.ts` of both packages is diffed before and after: only the
  named renames and additions appear.

## Comments

**11 Sep 2026 — the maintainer decided.** Asked the three questions with the
recommendations above; the answers were:

1. Public props: **English outside**, German inside.
2. Accessible name: **`aria-label`** where the named element is the root,
   `ariaLabel` only where it is not.
3. The README principles and the tone set: **as recommended**. This session
   records the decisions and writes ticket 09; the renames themselves are 09's
   work and are not done here.

Recorded as `docs/adr/0015-props-are-english-identifiers-are-german.md`. Two
lines the questions did not settle were drawn in the ADR so that 09 is
finite, and can be reopened: the rule covers component props and the string
literals a prop takes directly — not exported functions, hooks, their option
objects, or the keys of object-valued props, which are types and stay German.

The README's principles now name their exceptions and, separately, the
components that do not meet them yet. The `dist/index.d.ts` diff belongs to
09, where the surface actually changes.

Ticket 03's charts half used the decision already: the new name for the
violation series is `violationName`.
