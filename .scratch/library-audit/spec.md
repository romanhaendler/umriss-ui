# Spec: Where the library contradicts itself

Status: ready-for-agent

Origin: a full read of both packages on 11 Sep 2026 — every source module of
`@umriss/ui` and `@umriss/charts`, every stylesheet, the demo tooling and the
repository documents, read against `CONTEXT.md`, the fourteen ADRs, the
earlier specs and the library's own README principles. The brief: "check the
library for consistency and bugs, and say what it takes to lift it to the
next level."

The baseline before reading was clean: typecheck green, lint two warnings,
347 + 1065 unit tests green, 433 browser tests green. **Nothing in this spec
was found by a failing test.** That is the finding behind the findings: the
checks guard the pure modules, and the pure modules are sound. What has
drifted is everything the checks cannot see — the components around the
modules, the documents around the components, and the seams between the two
packages.

Sequencing: independent of `tone-contrast` (open since Aug. 2026) and of
`visuelle-wertigkeit`, which exists only on the worktree branch
`worktree-wertigkeit-spec` and has never reached `main`. Ticket 07 overlaps
both and names where; ticket 08 brings the second one onto `main`. Ticket 06
is a decision and belongs before 03 and 04, because both touch public props.
The rest can run in any order and in parallel.

Tickets: `.scratch/library-audit/issues/` — eight.
Glossary: no new terms.
ADRs: one proposed — the language of the public interface. See **Further
Notes**.

Prose is English per `CONTEXT.md`, identifiers German. Line numbers are those
of the state the audit read.

---

## Problem Statement

The library is in better shape than a list this long suggests. The models
are pure and tested at the seam, the glossary is kept, the ADRs are read, and
the review follow-ups in the history show a habit of going back. The problems
below are not the problems of a careless codebase. They are the problems of
a codebase whose discipline stops at the edge of what a unit test can reach.
Seven of them.

**Two overlays never learned about the top layer.** The popover seam decided,
correctly, that a floating surface portals into the nearest `<dialog>`
ancestor, because a portal at the body cannot reach the top layer. `Tooltip`
was left out of that migration and still portals to `document.body`
(`Tooltip.tsx:98`), ignoring both the dialog rule and the provider's
`portalZiel`. A tooltip on a button inside a `Modal` is therefore rendered
behind the modal, and so is every tooltip of a `Dock` placed inside one,
because the dock wraps each tool in a `Tooltip`. Next door, `Modal` and
`CommandPalette` both call the caller's `onClose` twice per close: once from
the gesture, and once more when the choreography finally calls
`dialog.close()` and the native `close` event fires into the same handler
(`Modal.tsx:64`, `CommandPalette.tsx:348`). A caller that counts, logs or
toasts on close sees two.

**The date pickers disagree with each other and with the clock.** The
`DateTimePicker`'s "Jetzt" takes an exact instant, decomposes it into
wall-clock fields, resolves them through `loeseLokaleZeit` and on a doubled
hour always chooses the earlier one — so during the second 02:30 of the
autumn change it emits a time sixty minutes in the past
(`DateTimePicker.tsx:130-142`; run, not read). Reopening either time picker
resets the doubled-hour choice to "früh", so a stored later-occurrence value
silently moves an hour on the next "Übernehmen" (`DateTimePicker.tsx:97`,
`DateTimeRangePicker.tsx:167`). Enter in the time fields commits in the range
picker and does nothing in the single one. `DateTimeRangePicker` builds its
presets from the module constant and ignores `wortlaut.presets`, while
`DateRangePicker` honours it. The range-with-time panel is named by a
placeholder key. Two of four pickers draw their trigger inline while the
other two share `BereichsTrigger` — the exact shape of drift the popover-seam
spec described. And no test, in either suite, renders a picker.

**Words escaped the dictionary, and props say one thing and do another.**
`TableFilter` renders "Zurücksetzen" and "Fertig" as literals
(`TableFilter.tsx:72,78`); the alarm model carries seven German column labels
that end up in the CSV header and the column menu (`meldeModell.ts:328-346`);
`MultiSelect` assembles "3 / 12" by hand. `Toast` announces a danger tone
with `role="status"` while `Alert` gives the same tone `role="alert"`. In
charts, a package that decided to have no text layer, four German defaults
stand anyway: "OEG"/"UEG", "Sonstige", "Serie n" and "– Regelverletzung".
On the props side, `NumberInput`'s JSDoc promises clamping only on blur while
the code clamps on every path — and that JSDoc is what the generated props
table publishes. `FormField.required` promises `aria-required` and sets only
an asterisk. `TablePagination` documents four default page sizes and ships
three. `Textarea` spreads `...rest` after its own `onInput`, so a consumer's
`onInput` silently disables autosize and the counter. `TreeView` builds
checkbox ids from the node key without a namespace, so two trees on a page
collide; `Tabs`, `RadioGroup` and the palette's group headings build ids from
caller values, which may contain spaces — and an IDREFS attribute splits on
spaces.

**A series does not keep its colour.** The glossary promises that
registration order is JSX order and decides the palette. It is JSX order on
first mount only. A series that unmounts and mounts again — a legend toggle,
a conditional child — registers at the end, and every series in the chart
changes colour: A/B/C in blue/pink/green become B/C/A in blue/pink/green.
Verified with a throwaway test against `ChartScene`. Beside it: the legend
lives inside the root's `role="img"`, which hides its hover affordance from
assistive technology; the default tick label of an operating-time axis uses
`toLocaleString(undefined, …)` and so depends on the machine, in a workspace
whose other package fixes German at twelve points; and `FALLBACK_THEME`
carries three hex values that are a second copy of `tokens.css`.

**The surface has three grammars.** The README lists two principles for new
components: forward `ref`, `className` and `...rest`; support controlled
*and* uncontrolled. Sixteen components do not forward a ref, six do not
accept `className`, `Tabs` is controlled-only, `Card` uncontrolled-only. The
accessible name arrives as `ariaLabel` (TreeView, Popover), as `label` (Dock,
Meter) and as `"aria-label"` (ButtonGroup, TagGruppe). And the charts
instruments introduced German public props — `zustaende`, `spurVon`, `hoehe`,
`faerbung`, `wert`, `bis`, `kalender`, `ton`, `rolle`, `imBereich` — next to
the English ones of the original four series (`strokeWidth`, `barWidth`,
`markers`). The Dock and the palette explicitly chose an "English outside";
the instruments chose the opposite. Both are defensible. Having both is not.

**Tokens the components stopped reading.** Colour discipline is nearly
absolute — three literals in 4,650 lines of CSS — and each of the three is a
bug: `Modal`'s backdrop is `rgba(12,12,14,.45)` although `--u-color-scrim`
exists and the palette uses it, so the dark theme dims with the light value;
`Button`'s danger variant hard-codes `#ffffff`, which is exactly the failing
pair the accessibility run tolerates under `OFFEN`. Durations are written
twice: `Modal.tsx:47` says `160` and its stylesheet `160ms`; `Toast.tsx:54`
says `210` and its stylesheet `200ms`. `MultiSelect` hard-codes `ABSTAND = 8`
with the comment `/* var(--u-space-2) */`. The button's press transform
survives `prefers-reduced-motion`. The provider's `dichte` setting is read by
nothing. The hover edge `color-mix(in srgb, var(--u-color-text) 30%,
transparent)` is copied seven times, and `Textarea` alone rings on `:focus`
instead of `:focus-visible`.

**The documents have drifted from the code.** `TESTS.md` says 920 ui tests;
there are 1065. `STATUS.md` says "C.1–C.7 plus mixed-series-kinds" and has no
section for `StateBand`, `Matrix`, `Span`, `Limit` or `ControlChart`. The
README's component table omits `TreeView`, `AlarmList`, `Stat`,
`CommandPalette` and `Popover`. Lint reports two warnings and nothing fails on
warnings; five `eslint-disable` comments exist. There is no CI configuration
and no `license` field in either manifest. `@umriss/charts` has no changelog
and no `prepublishOnly`, while `@umriss/ui` has both. And a 420-line spec with
five tickets — `visuelle-wertigkeit` — has sat on a worktree branch since
24 Aug 2026 where no agent working from `main` can see it.

## Solution

Eight tickets, ordered by what a user of the library would notice first.

Three of them fix bugs: the overlays and the top layer (01), the pickers and
the clock (02), the series that loses its colour (05). Two restore the rule
that the library already has: every word through the dictionary, every prop
doing what its comment says (03, 04). One is a decision rather than work —
the grammar of the public surface (06) — and it is marked for a human,
because the language of the props is a question of taste that an agent
should not settle. One reconnects the components to the tokens (07), in
coordination with the two open design specs. The last one makes the
documents true again and adds the two guards that were missing: a lint run
that fails on warnings, and a place for the spec that got lost (08).

Three rules for all of them.

Every bug lands with the test that would have caught it, at the level where
it lives: the DST cases in `zeit.test.ts` and a new picker behaviour test,
the palette in `scene.test.ts`, the tooltip portal in `tooltip.test.tsx`.

Documents are corrected in the same commit as the code they describe. A
JSDoc that lands in the generated props table is public interface and is
held to the same standard.

Screenshot baselines do not move except where a ticket names the picture
and the reason. Ticket 07 names two.

## User Stories

1. As a developer, I want a tooltip on a control inside a modal to be visible, so that the one place I most need a hint is not the one place it is hidden.
2. As a developer, I want `onClose` to fire once per close, so that a counter, a log line or a toast bound to it is not doubled.
3. As an operator, I want "Jetzt" to mean now, so that a value entered during the autumn change is not an hour old before I have saved it.
4. As an operator, I want a time I chose as the later occurrence to still be that time when I reopen the picker, so that reopening does not move it.
5. As an operator, I want Enter in a time field to commit in every picker that has time fields, so that the four pickers feel like one component.
6. As an application, I want a preset label I override to change in both range pickers, so that a wording override is not a lottery.
7. As an application, I want every visible string to come from `Wortlaut`, so that "Zurücksetzen" does not survive an override that changed everything else.
8. As a screen-reader user, I want a danger toast announced as an alert, the way a danger `Alert` is, so that the tone means the same thing on both surfaces.
9. As a developer, I want the props table to tell the truth about clamping, `aria-required` and default page sizes, so that I do not learn the contract by debugging.
10. As a developer, I want my `onInput` on a `Textarea` to add behaviour, not remove the library's, so that autosize does not stop when I listen.
11. As a developer, I want two trees on one page to have distinct checkbox ids, so that a label click reaches the right box.
12. As a developer, I want ids the library builds from my values to be valid ids whatever my values contain, so that `aria-labelledby` does not break on a space.
13. As a reader of a chart, I want a series to keep its colour when a sibling is toggled, so that "blue is temperature" stays true for the whole session.
14. As a screen-reader user, I want the legend of a chart to be reachable, so that the one interactive element of the chart is not hidden behind `role="img"`.
15. As a developer, I want an operating-time axis to be labelled the same on every machine, so that a screenshot from a colleague matches mine.
16. As a developer, I want every component to take a `ref`, a `className` and rest props, the way the README promises, so that I do not have to read the source to know which ones do.
17. As a developer, I want one spelling for the accessible-name prop, so that I do not guess between `label`, `ariaLabel` and `aria-label`.
18. As a maintainer, I want one decision, recorded, on whether public props are German or English, so that the next component does not have to choose again.
19. As a user of the dark theme, I want the modal backdrop to dim with the dark scrim, so that the modal looks like it belongs to the theme I chose.
20. As a user with reduced motion, I want the button not to shrink when pressed, so that the setting means what it says.
21. As a maintainer, I want a duration to be written once, so that a stylesheet and a timer cannot disagree by ten milliseconds.
22. As a maintainer, I want `TESTS.md`, `STATUS.md` and the README to describe the code that exists, so that a reader is not told there are 920 tests, seven series kinds, or thirty-six components.
23. As a maintainer, I want lint to fail on a warning, so that the two warnings in `DateTimeRangePicker.tsx` are either fixed or explained.
24. As a maintainer, I want every open spec on `main`, so that an agent asked "what is open" can answer without checking out a worktree.
25. As a second consumer, I want a `license` field and a charts changelog, so that adopting the second package asks the same questions as the first.

## Implementation Decisions

**Tooltip takes the popover's portal rule and nothing else.** It stays its
own component — it has no focus, no dismissal, no anchor width — but it
resolves its target the way `Popover.tsx:143` does: nearest `<dialog>`
ancestor of the trigger, then `usePortalZiel()`, then the body. The rule is
lifted into one function in `lib/` so that the two callers cannot drift a
second time.

**A dialog closes once.** `useDialogChoreographie` owns the `close()` call
and therefore owns the knowledge that the close was requested. It exposes a
handler for the element's `onClose` that swallows the event when the
choreography itself closed the dialog and lets it through otherwise — the
browser-initiated close, which is the case the handler exists for. Both
`Modal` and `CommandPalette` use that handler instead of wiring `onClose`
directly.

**"Jetzt" truncates seconds and keeps the instant.** It does not go through
`loeseLokaleZeit`: an exact instant has no ambiguity to resolve. Reopening
seeds the doubled-hour choice by comparing `value.getTime()` with the
resolved `frueh` and `spaet`, in both time pickers, through one helper in
`zeit.ts`. Enter in the single picker's time fields calls the same commit as
in the range picker. `DateTimeRangePicker` builds presets from
`standardPresets(wortlaut)` like its sibling. The range-with-time panel gets
its own `*Panel` wording key; `zeitraumMitZeitPlatzhalter` is deleted if it
then has no caller. The two inline triggers move onto `BereichsTrigger`.

**Every visible string is a `Wortlaut` entry.** `TableFilter` gets
`filterZuruecksetzen` and `filterFertig`. The alarm model's column labels
become a function — `meldeSpalten(wortlaut)` — following the precedent of
`standardPresets(wortlaut)`, and `MELDE_SPALTEN` is kept as the German
default for pure-module callers. `MultiSelect`'s "n / m" becomes a
parametrised entry. `Toast` derives its role from the tone with the same
table `Alert` uses, moved to `lib/` so it is one table.

**Charts keeps no text layer, so its German defaults go.** `ControlChart`'s
`labelOben`/`labelUnten` default to no label; `pareto`'s `restName` is
required whenever `sammelRang` is finite; the "– Regelverletzung" suffix
becomes a caller-supplied `verletzungName`; "Serie n" stays as the legend's
last resort, with a DEV warning when a series has no name. The
operating-time default tick label is formatted by hand as `dd.MM. HH:mm`
without `Intl`, which is locale-free and happens to match the sibling
package's notation.

**A prop's comment is its contract.** `NumberInput`'s `onChange`, `min` and
`max` comments are rewritten to what the code does: clamped on every path,
text local while typing. `FormField.required` sets `aria-required` through
the context, and every consumer that reads the context applies it.
`TablePagination`'s default is stated as `[10, 25, 50]`. `Textarea` composes
the consumer's `onInput` with its own instead of being overwritten by the
spread. Every id the library builds from caller data goes through one helper
that yields `${useId()}-${index}` — never the raw value — in `TreeView`,
`Tabs`, `RadioGroup` and `CommandPalette`.

**A series keeps its colour by name.** The scene holds a map from series
name to palette slot, filled at first registration and consulted on every
later one; a series that remounts with the same name gets its slot back. A
series without a name keeps today's behaviour and earns a DEV warning when
it remounts. Draw order stays registration order and the glossary entry is
corrected to say so: the palette follows the *name*, the drawing follows the
registration. `Chart`'s `role="img"` and `aria-label` move from the root to
`.kc-plot`, so the legend is a sibling outside the image. A conformance test
in `@umriss/ui` reads `FALLBACK_THEME` against `tokens.css` the way
`grenzwertKonformitaet.test.ts` reads the two limit models — the ui side
reads the charts side, never the reverse (R-1.2).

**The grammar is one decision, then mechanical work.** Ticket 06 asks the
maintainer three questions and recommends an answer to each: public props are
English on the outside (the Dock and palette precedent), the accessible name
is spelled `aria-label` wherever the named element is the root and `ariaLabel`
only where it is not (Popover), and every component rendering a root element
forwards `ref`, `className` and rest. The README's second principle is
amended to name the components that are controlled-only and why —
`Combobox`, `MultiSelect`, `Modal`, `CommandPalette` — instead of being
silently false. Renames ship with deprecated aliases for one minor version
and a `Geändert` entry.

**Tokens are read, not copied.** `Modal` uses `--u-color-scrim`. `Button`'s
danger text uses a new `--u-color-on-danger`, defined in both themes — this
is the surface half of what `tone-contrast` covers on the text half, and the
two land together or the token contrast test names the tolerated pair.
Durations are read from the computed style with the Dock's `dauerAus`, moved
to `lib/motion.ts`; `EXIT_DAUER` and the literal `160` go. `MultiSelect`
reads its gap from the computed style. The button's press transition gets a
reduce block like every other module that hard-codes a duration. The hover
edge becomes one token used seven times; `Textarea` moves to
`:focus-visible`. The provider writes `data-dichte` next to `data-theme`, and
`Table` and `AlarmList` default their `density` prop from `useDichte()` — the
minimum that makes the setting true without pre-empting work package B.13.

**Documents are derived where they can be and corrected where they cannot.**
`TESTS.md` stops carrying test counts — they are one `pnpm test:unit` away
and have been wrong since the dock landed — and keeps the file lists.
`STATUS.md` gains a section per instrument. The README table gains the five
missing rows. `pnpm lint` runs with `--max-warnings 0`; the two warnings are
fixed or carry a reasoned disable; the five existing disables each carry
their reason. Both manifests get `license`; charts gets `CHANGELOG.md` and
`prepublishOnly`. The `visuelle-wertigkeit` spec is cherry-picked onto `main`
unchanged, status intact.

## Testing Decisions

**What is verified and how.** Every finding marked as a bug in this spec was
either reproduced by running code — "Jetzt" during the doubled hour, the
palette shift — or read at a specific line quoted above. Findings that could
not be verified are marked as such in the tickets.

**Tooltip and dialog.** `tooltip.test.tsx` gains a case rendering a tooltip
inside a `<dialog>` and asserting the panel's parent is the dialog; a second
case gives the provider a `portalZiel` and asserts it is used. `Modal` and
`CommandPalette` behaviour tests assert `onClose` is called exactly once per
gesture, including Escape.

**The pickers get their first behaviour tests.** A new
`tests-unit/datePicker.test.tsx` renders each of the four pickers in jsdom
with the zone pinned to Europe/Berlin as `vitest.config.ts` already does,
and covers: "Jetzt" at a frozen doubled-hour instant, reopening a
later-occurrence value, Enter in time fields, and a preset override reaching
both range pickers. `zeit.test.ts` gains the seeding helper's cases.

**Wording.** A unit test walks `components/**/*.tsx` as text and fails on a
JSX text node or string prop that contains a German letter sequence outside
`wortlaut.ts` — the same shape as the contrast test, which reads the
stylesheet rather than duplicating it. `sprache.test.tsx` covers the new
entries and the alarm column function.

**Props.** `propsLeser.test.ts` already reads JSDoc; it gains the rule that a
comment naming a default (`Standard …`) must match the destructured default,
checked for the three cases here. `Textarea` and `TreeView` get behaviour
tests for the composed `onInput` and for two trees on one page.

**The palette.** `scene.test.ts` gains: register three, unregister the
first, register it again by name, assert three colours unchanged; and the
nameless variant asserting the warning. The `role="img"` move is asserted in
`mount.jsdom.test.tsx`. The `FALLBACK_THEME` conformance test lives in
`packages/ui/tests-unit/`.

**Tokens.** `kontrast.test.ts` gains the `on-danger` pairs. A stylesheet text
test asserts no `ms` literal outside `tokens.css` except the named
exceptions, and no `rgba(`/`#` literal at all. The two baselines that move —
the modal backdrop in the dark theme and the danger button in the dark theme
— are named in the ticket and reviewed one by one.

**Documents.** The wording and props tests above are the guard; `TESTS.md`
loses the numbers that no test guards. A tiny script diffs the README table
against `src/index.ts` exports and is run in `pretypecheck` like `props`.

**Regression safety.** No baseline moves except the two named. The
Playwright suite is run in full before and after each ticket.

## Out of Scope

- **The colour work of `tone-contrast`** beyond the one surface token that
  ticket 07 needs from it.
- **The motion vocabulary, glyph stroke and state canon of
  `visuelle-wertigkeit`.** Ticket 08 brings the spec onto `main`; it does not
  implement it.
- **Handoff work packages B.1–B.15** — free-text dates, sliders, stepper,
  inline editing, the full density set (B.13). Ticket 07 wires the setting
  that exists; it does not define compact.
- **Translation.** German stays the only language; the dictionary rule makes
  it overridable, nothing more.
- **Server rendering.** Decided against in `consumable-package`.
- **New components or model features** for table, tree, alarm list or charts.
- **Performance work** on the tree's `hakeAlle`, which cascades every
  subtree twice and is O(n·depth) — noted in Further Notes, not ticketed.
- **A general CSV hardening** against formula injection; noted below.
- **Re-litigating the two limit models** (ADR-0006) or the affine scale
  (ADR-0001). Both hold.

## Further Notes

**Method.** Two of ten review agents finished — the date pickers and the
stylesheets — before the session limit cut the other eight off. Everything
else was read directly, module by module, and the claims that carry weight
were run: the doubled-hour "Jetzt" with a Node script, the palette shift with
a throwaway vitest file against `ChartScene`. Where a claim rests on reading
alone the ticket says "read".

**One ADR is proposed: the language of the public interface.** `CONTEXT.md`
fixes identifiers as German and prose as English; it says nothing about
props, which are both. The Dock and the palette decided on an "English
outside" in their file headers; the charts instruments decided the opposite
in theirs. Neither wrote it down where the next author would look. Ticket 06
recommends the English outside, because the four original series, the whole
of the ui form layer and every HTML attribute already are, and because a
consumer reads props more often than identifiers. Whichever way the decision
goes, it is an ADR.

**Seen and left.** `useTableSelection` never prunes keys of rows that left
the data, so `count` can exceed the visible selection. `alsCsv` writes a
field starting with `=`, `+`, `-` or `@` verbatim; a spreadsheet re-import
evaluates it. `Sparkline` spreads its data into `Math.min`, which the alarm
model explicitly avoids for large arrays. The scene detects an accessor
change by source text, a limit its own header documents and `ControlChart`
works around with `data.slice()`. `Menu` closes on Tab without moving focus
to the element after the trigger. None of these is a defect a user has hit;
all of them are the kind that will be.

**On the two review agents that did report.** The DatePicker report found
what this spec's second paragraph describes and confirmed the two lint
warnings benign — `loese` closes only over `withSeconds`, which is in the
dependency list. The stylesheet report found the three literal colours, the
duration duplicates and the dead density setting, and could not reproduce
the two-pixel table shift that `src/index.ts` cites as the reason for its
export order; whether that hazard still exists is unverified and the
ordering constraint may be broader than the actual risk.

**What this spec does not say.** It does not say the library is
inconsistent. It says the library has a rule for almost everything found here
and broke its own rule in a place its tests do not reach. The next level is
not a new rule. It is the same rules, one level further out.

## Comments

**11 Sep 2026 — tickets 01–08 delivered**, each marked `done` with its commits
and its deviations recorded in the ticket. Ticket 06's decisions are recorded in
ADR-0015. The spec stays open for `issues/09-the-renames.md`, the mechanical
work those decisions left, which is `ready-for-agent`.

