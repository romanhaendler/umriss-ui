# Spec: The demo is the documentation

Status: done

Origin: `/grill-with-docs` session, 10 Sep 2026. The brief, in the words it was
given in: "ich möchte die Demo-Seite so überarbeiten, dass sie wie zB bei MUI
ist. Ausführliche Beispiele inklusive Code. Bessere Strukturierung." — that is,
rework the demo page to be like MUI's, with detailed examples including code
and better structuring — with the standing goal of a professional, clean result
in the library's own idiom. Sharpened over five rounds.

Scope is `@umriss/ui` only. `packages/charts/demo` is not touched and keeps its
current shell; the two demos share no code today (the shell is copied, not
imported), so nothing breaks, and they diverge on purpose — see **Further
Notes**.

Tickets: `.scratch/demo-as-documentation/issues/` — nine.
Glossary: four terms added to `CONTEXT.md` under **The demo** during the
session. One existing line corrected: **Cell** listed `Kachel` as "a demo panel",
which stops being true here.
ADRs: none proposed. See **Further Notes**.

Prose is English per `CONTEXT.md`, identifiers German. The demo's own visible
text stays German, as it is today.

---

## Problem Statement

The demo shows thirty-six components and tells a reader how to use none of them.

It is a good gallery. Five rubrics, one visible at a time, a real command
palette, linkable addresses, a screenshot suite that photographs every panel in
both themes. What it does not have is the one thing a person opening it actually
wants: **the code that produced what they are looking at.** Not one line of
source is visible anywhere on the page. A developer who sees the `Stat` with its
limit set and wants that has to find `packages/ui/demo/KennzahlenKachel.tsx`,
read past its header comment, and reconstruct the call. That is not
documentation; it is a screenshot with a repository attached.

The second half of the problem is that the structure hides things. A panel is
the unit, and a panel may hold three components: `Select`, `Combobox` and
`MultiSelect` share one address, so two of the three cannot be linked to at all.
Bundling was a reasonable answer to a long scrolling page — but it means the
address space of the demo is a fact about page length rather than about the
library.

The third is quieter and worse. **Eleven exported components have no entry at
all**: `Badge`, `Card`, `Checkbox`, `Sparkline`, `Meter`, `EmptyState`, `Stack`,
`Grid`, `Popover`, `Skeleton`, `Spinner`, `VisuallyHidden`. Most of them are used
inside other panels — `Card` *is* the panel chrome — so they are visible
everywhere and documented nowhere. A public export with no page is a gap only
the author knows about.

And there is no API surface anywhere. Seventy `*Props` interfaces exist in
`src/`, with JSDoc coverage at roughly forty percent and very unevenly spread:
`Table` 25/35 and `Dock` 13/16, against `MultiSelect` 0/11, `Tabs` 0/7,
`Combobox` 2/11, `DatePicker` 1/7. The uneven half is invisible today, which is
exactly why it stayed uneven.

## Solution

One page per component, in the shape a reader of MUI's documentation already
knows: name and one-line purpose, a copyable import line, a run of examples each
showing its own source, the props table, and — only where there is something to
explain — a closing section on why it is built this way.

What is taken from MUI: the page anatomy, the example-with-code affordance, the
props table as a first-class part of the page, and the rule that public means
documented.

What is refused: the TypeScript/JavaScript toggle (everything here is
TypeScript, and a second output mode is a second truth with no reader), the
component-gallery landing page (it answers the same question as the sidebar,
more expensively), and MUI's twelve-colour syntax theme (see **Highlighting**).

What is taken from this library: the tokens, the restraint, the standing rule
that two lists meaning the same thing will drift apart — which is the single
constraint that decided almost every mechanism below.

## The page list

Forty-one pages in five rubrics. The rule that produced it: **one page per
component a developer would search for by name.** Compound parts share their
parent's page — `CardHeader` and `CardBody` are on `Card`, `TabList`/`Tab`/
`TabPanel` on `Tabs`, `ModalHeader`/`ModalBody`/`ModalFooter` on `Modal`,
`Th`/`Td`/`TableToolbar`/`TablePagination` on `Table`, `TagGruppe` on `Tag`,
`SplitButton` on `ButtonGroup`, `Text`/`Heading`/`Link` on `Typography`.

**Fundament** (12): Button · ButtonGroup · Tag · Divider · Badge · Alert ·
Typography · Card · Spinner · Skeleton · EmptyState · VisuallyHidden

**Formulare** (13): Input · FormField · Textarea · NumberInput · Checkbox ·
RadioGroup · Select · Combobox · MultiSelect · DatePicker · DateTimePicker ·
DateRangePicker · DateTimeRangePicker

**Tabelle** (1): Table

**Struktur und Ebenen** (11): Tabs · Menu · Tooltip · Popover · Modal ·
ConfirmDialog · Toast · CommandPalette · TreeView · Dock · Stack und Grid

**Betrieb** (4): Stat · AlarmList · Sparkline · Meter

Three notes on the edges of that rule.

`Tabelle` stays a rubric of one. It looks odd in a list and is right on the
page: `Table` has thirty-five props, its own model, its own view and its own
virtualisation, and filing it among the layout components would be the same
mistake the current `gliederung.ts` comment already argues against.

`Stack und Grid` is one page under two names because they are one layout module
with one idea; splitting them would produce two pages that each only make sense
next to the other. `Sparkline` and `Meter` do *not* get that treatment — they
share a folder called `DataViz` and nothing else, and `DataViz` is a category
name, not something anybody searches for.

**Hooks and lib modules do not get pages.** `useToast` is documented on `Toast`,
`useTableSelection` on `Table`, `useFormField` on `FormField`,
`useAktualitaet` on `Stat`, `useCommandPaletteShortcut` on `CommandPalette`. The
cross-cutting ones — `sprache`, `anbieter`, `glyphen`, `grenzwert`,
`aktualitaet` — have no component to hang on and are **out of scope for this
work**; they are a second piece of documentation with a different shape, and
inventing that shape here would be the fourth thing this spec tries to do at
once.

## The address space

`#/button`. Flat, one segment, the component's own name lowercased.

The rubric is deliberately **not** in the address. A rubric sorts the sidebar
and means nothing inside the library, so putting it in the address would make
re-sorting the sidebar break every link that exists — the property that
`CONTEXT.md` now records under **Rubric**. Component names are unique across the
library, so one segment is enough.

Examples are addressable too: `#/button/varianten` opens the `Button` page and
brings that example into view. "Look at this one" becomes a link, which is most
of what an address space is for.

`adresseVon()` in `gliederung.ts` stays the only place that knows the format.

## Page anatomy

    Rubrik · Name                      ← rubric small, component name large
    One or two sentences: what it is for.
    import { Button } from "@umriss/ui"    ← copyable

    ── Beispiele ──
    Varianten            [running]  [Code ▾]
    Größen               [running]  [Code ▾]
    Laden und Sperre     [running]  [Code ▾]
    (optionally, last: one Vorführung)

    ── API ──
    ButtonProps    Name · Typ · Standard · Beschreibung

    ── Warum so ──        ← only where there is something to explain
    The essays.

The API table comes **before** "Warum so" because the reader who opens the page
to look something up came for the table and should not scroll past prose to
reach it.

There is **no separate accessibility section**, though MUI has one. In this
library accessibility is not an appendix; it is the reason for half the
construction, and it belongs where that reason is given. A component whose
keyboard model needs explaining explains it under "Warum so", next to
everything else that was a decision.

## Implementation Decisions

### Examples are files

Every example is its own file under `demo/beispiele/<Baustein>/NN-<slug>.tsx`,
with a default export that renders it and `export const titel` naming it. The
page gets the running component from a normal import and the source from the
same file via `?raw`, so **the code shown is the code that ran** — not by
discipline, but because there is only one file.

The list of examples is not written anywhere. `import.meta.glob` over the
directory produces it, ordered by the `NN` prefix, and the anchor comes from the
`<slug>`. A new example is a new file and nothing else; there is no second place
to remember. This is the same constraint the existing `gliederung.ts` header
comment states in its own words, applied one level down.

Fixtures stay inside the example file that needs them, as they already do today
(`ABLAGE`, `START`, `STATIONEN` are all file-local). The one exception in the
current demo, `TABELLEN_SPALTEN`, is copied into the examples that use it rather
than shared: an example that reaches out of its own file is an example the
reader cannot copy.

### What the code block shows

The whole file, minus the `titel` export, which is demo bookkeeping and no
business of the reader.

Imports stay — an example the reader copies has to run — but the specifier
`"../../../src"` is rewritten to `"@umriss/ui"` for display. That is the only
place in this work where the shown text differs from the file on disk, it is a
plain string substitution rather than a parse, and it exists because the import
path is the one point at which "what runs here" and "what runs for you"
genuinely differ.

A copy button on every block. No TypeScript/JavaScript switch.

### Highlighting

`sugar-high` as a devDependency of `@umriss/ui`. About one kilobyte, no grammar
bundle, JSX and TSX natively, and it emits roughly six token classes rather than
twelve.

Six is the point, not the size. `tokens.css` says motion explains state changes
and does not decorate; the same discipline applied to a code block means colours
that carry meaning and no others. The token classes are mapped onto existing
tokens so that a code block looks like this library rather than like somebody's
editor theme, in both themes.

The demo is not published (`files: ["dist", "CHANGELOG.md"]`), so this
dependency reaches no consumer of the package. Both packages keep their zero
runtime dependencies.

### Code is collapsed, with one switch for the page

Each example's code is collapsed behind a control, and the page header carries
"alle Beispiele mit Code", whose state the page keeps while the reader is on it.

The two reading modes are genuinely different: someone scanning wants the
examples as a gallery, and someone who has found the right one wants every block
open without five clicks. One switch serves both; a per-example toggle serves
only the first, and always-open serves only the second.

### The demonstration

Some components are not a handful of props. `Table` has a model, and a page of
five isolated miniatures would misrepresent it by leaving out that the filter,
the selection, the shared view and the export are one thing. Those components get
a **Vorführung** as the last item of the example run: one larger file, shown
whole, with its code like any other example.

`Table`, `TreeView` and `Dock` are expected to keep one. `VirtuelleTabellenKachel`
becomes an example on the `Table` page rather than a page of its own, since
virtualisation is a prop of `Table` and not a component.

The demonstration is also the migration bridge — see **Sequencing**.

### The props table

Generated at build time from TypeScript, by a script in
`demo/werkzeug/props.ts` written directly against the TypeScript compiler API.
`typescript` is already a devDependency; no new one is added.

Three behaviours make an off-the-shelf tool the wrong shape here, and all three
would have to be written by hand on top of one anyway:

- **Inherited DOM props collapse to one line.** `ButtonProps extends
  ButtonHTMLAttributes<HTMLButtonElement>` must not produce two hundred and
  fifty rows. The table lists what this library declares and closes with a
  sentence: "nimmt zusätzlich alle Attribute von `<button>`".
- **Generic components resolve sensibly.** `Table<T>` and `TreeView<T>` are
  generic in the row type; the table shows `T` as `T` rather than as its
  constraint or as `unknown`.
- **The build breaks on an undocumented prop.** This is the point of the whole
  mechanism.

The output is a JSON file produced by a `prebuild:demo` step and **not checked
in**. A committed generate drifts from its source, which is the failure this
whole spec is arranged to avoid.

### The JSDoc gate

Every prop that lands in a table must carry a JSDoc comment, and the generator
throws when one does not. Roughly sixty comments are missing today; writing them
is part of this work, not a follow-up.

"Public" is defined by the mechanism rather than by a second list: a prop is
public when it appears in some page's table, which is exactly what the generator
already collects. So `Kalender` (7/15) and `BereichsTrigger` (3/20) stay
undocumented, because they are internal parts of the picker and are meant to be.

The gate lives in the generator and not in ESLint. An ESLint rule would have to
reimplement the module resolution the generator does anyway, and a
self-written rule duplicating a self-written script is two things to keep in
step.

### "Warum so" is optional

It appears where there was a real decision and is absent otherwise. Seven
`hinweis` paragraphs exist on the page today; more of the same voice sits in
source-file header comments in `src/`, and fourteen ADRs already answer this
question for specific components (0003 and 0004 for `TreeView`, 0006 and 0010
for `Stat`, 0012 for the material, 0013 and 0014 for `Dock`).

So: the existing paragraphs move, the relevant header comments come along, and
where an ADR answers the question the section links it rather than retelling it.
Where there is nothing to explain, there is no section.

Making it mandatory would produce roughly thirty pages of filler, and a section
that is always present stops carrying information. This is the same discipline
by which the ADRs themselves are written.

### The shell

The existing `Huelle.tsx` is rebuilt rather than extended: one rubric per
sidebar run with every page always visible (about forty-six lines, which scrolls
fine and keeps the whole library in view), a rubric heading that is a heading and
not a button, and the page — not the rubric — as the thing an address names.

The command palette finds **pages and examples**, examples grouped under their
component. Around one hundred and eighty candidates, which is nothing for a
filtered list. `Huelle.tsx`'s own header comment calls the palette the one thing
in this repository that gets used daily; its value goes up with what it can find.

The overview stays what it is: five rubric cards with their chips, growing to
cover the new pages. It answers "what is this", which the sidebar does not, and
it answers it better with five sentences than with forty-one thumbnails.

The shell keeps its standing rule — built from plain elements and tokens, not
from the components it exhibits — and keeps its one deliberate exception, the
command palette, for the reasons its header comment gives.

### Naming

`Kachel` is gone, not renamed: `Seite`, `Beispiel`, `Vorführung`, `Rubrik`, per
`CONTEXT.md`. `data-kachel` becomes `data-baustein` on the page and
`data-beispiel` on each example. `Gruppe` in `gliederung.ts` becomes `Rubrik`,
since `Gruppe` is now spoken for by the chart legend.

## Testing Decisions

Every existing baseline falls: the addresses change, the layout changes, and
`kacheln.ts` derives its list from a structure that no longer exists. They are
regenerated rather than repaired.

- **Baselines**: one shot per example, light and dark, with code **collapsed**.
  Photographing the code block would tie the baselines to the source text, and
  renaming a variable inside an example would become an image diff.
- **Page shot**: one per page, cropped from the header to the first example —
  enough to catch the title, the import line and the table's top, without
  producing forty-one very tall images in which every change touches every
  baseline.
- **Behaviour (Playwright)**: the code toggle opens one example; the page switch
  opens all of them and survives navigation within the page; the copy button
  puts the displayed source on the clipboard, with the rewritten import
  specifier and without the `titel` line; an example anchor scrolls to that
  example; the palette finds both a page and an example.
- **Unit**: the generator against a fixture source file — inherited props
  collapse, a generic stays generic, and an undocumented prop throws. The
  import-path rewrite as a pure string function.
- **Accessibility**: axe over a sample of pages in both themes, WCAG 2.1 AA,
  including one page with all code blocks open.
- **The gate itself**: `pnpm build:demo` fails on a fixture with a bare prop.

Commands before delivery: `pnpm test:unit`, `pnpm test:visual`, `pnpm lint`,
`pnpm typecheck`.

## Sequencing

The old demo and the new one cannot coexist: two shells are two truths and two
sets of baselines. But decomposing twenty-one panels into roughly a hundred
examples in one go is a ticket nobody finishes.

The bridge is the **Vorführung**, and it costs nothing because it is a category
this spec needed anyway. Ticket 03 puts every existing panel, unchanged, onto its
own page as a single demonstration. The demo is then already entirely in the new
form — correct addresses, correct vocabulary, real props tables — and merely
poor in examples. Each rubric ticket afterwards decomposes its demonstrations
into examples. Where one should stay (`Table`, `TreeView`, `Dock`), it stays, and
it is then not a leftover but the outcome the spec asked for.

Every ticket leaves a demo that works.

Tickets 01 and 02 come first and are independent of each other. Ticket 03
depends on both, and its acceptance is `Button` complete in final form — the
shape proven on one real case before forty pages follow it.

## Out of Scope

- `packages/charts/demo`, and any shared shell package between the two demos.
- Pages for hooks, and for the cross-cutting lib modules (`sprache`, `anbieter`,
  `glyphen`, `grenzwert`, `aktualitaet`).
- A component gallery on the landing page.
- Editable or forkable examples, CodeSandbox/StackBlitz links.
- A TypeScript/JavaScript toggle, or any second rendering of the same source.
- Versioned documentation, search over prose, or a site generator.
- Documenting anything not exported from `src/index.ts`.
- Changing any component's public API. Only JSDoc comments are added to `src/`.

## Further Notes

**No ADR is proposed.** Every decision here is reversible at the cost of an
afternoon, and none of them will read as surprising to a future reader who has
the spec. The one candidate — the flat address space — is recorded where it
belongs instead: under **Rubric** in `CONTEXT.md`, as the reason a rubric name
never enters an address.

**The two demos diverge on purpose.** They share no code today; after this they
will not share a shape either. Charts is a different animal — canvas, few
discrete props, nothing a props table would carry — and a shared shell built
now would freeze a form that has just started moving. If the charts demo should
follow later, the shell is extracted then, from something that has proven
itself.

**The JSDoc gate will feel worse before it feels better.** Around sixty comments
on props somebody wrote without them, most of them in `MultiSelect`, `Combobox`,
`Tabs` and the pickers. That is the honest cost of a table that is true, and it
is a cost paid once. If it turns out that a prop genuinely resists description,
that is a finding about the prop and not about the gate.

---

## Comments

### Handover

All nine tickets are delivered. What deviates from the planned *order* stands in
the tickets themselves; here are the three things that concern the spec.

**The bridge does not exist.** Ticket 03 provided for putting every existing tile
unchanged onto its page as a demonstration and decomposing it rubric by rubric
afterwards. The bridge exists so that an *intermediate state* stays deliverable
between two sessions — and there was no such intermediate state here. Copying
panels out first and throwing them away again an hour later would have been work
nobody sees. The decomposition happened directly; tickets 03 and 05–09 landed
together. For anyone retracing the sequencing: it was rightly conceived and has
merely become superfluous at this point.

**The JSDoc debt was larger than estimated.** The spec reckoned with "roughly
sixty"; the gate found **149** props without a comment. The per-component figures
in the tickets were right — the sum underneath them was not. All 149 are
written.

**Seventy-eight examples, not a hundred.** The spec estimated "roughly a
hundred". The tickets' rule ("Four examples that differ only in one prop value
are one example plus a table") yielded fewer, and that is the rule working and
not a breach of it.

### Findings from looking at the pictures

Three things only became apparent once the baselines were there:

1. **`--u-color-text-muted` on `--u-color-bg` misses the threshold** (3.26:1
   light, 4.31:1 dark). An example's stage stood on the page ground at first;
   help texts from `FormField` and `Text tone="muted"` thereby fell below the
   tolerated limit. Fixed by putting the stage on `--u-color-surface` — there the
   token holds what it already held on the surface. The exception list in
   `barrierefreiheit.spec.ts` has **not** been widened; two percent of brightness
   difference would have been the wrong trade.

2. **The number beside a rubric in the sidebar** likewise stood in the muted
   tone and misses the threshold on the bar's ground. It now stands in the second
   text colour.

3. **A finding about the library, not about the demo: a disabled AND checked
   `Checkbox` shows an empty box.** `.input:disabled + .box` resets the
   background to the recessed surface, and the tick in `currentColor` becomes
   invisible on it. The old demo never showed the case, which is why it was never
   noticed. It is **not fixed** here — this spec explicitly excludes changes to
   `src/` other than JSDoc — and the example does not show the case, because
   otherwise it would document the defect instead of the component. **Worth its
   own ticket.** The fix is one rule:
   `.input:disabled:checked + .box .check { color: … }` with a tone that carries
   on the recessed surface.

### Props that were hard to describe

Ticket 06 asked for these to be recorded. Three:

* **`SelectProps.selectSize`** — so called because `<select size>` on the native
  element is the number of visible rows. The name is right and still reads like a
  slip; the description has to explain that as well, every time.
* **`InputProps.clearable` together with `onClear`** — two props for one thing,
  and either without the other does nothing. A single
  `onClear?: () => void` would have said both.
* **`PopoverProps.role`** — "omit it when an inner element carries it" is a rule
  about the *caller* and not one about the value. Props like that are the ones
  where a table reaches its limit.

None of them has been changed: the spec excludes changes to the public
interface.

### What disappeared from the old state

The old demo's seven `hinweis` paragraphs have all found a home: four from
`Stat` and `AlarmList` stand under "Warum so" on their pages (in
`demo/warum/stat.tsx` and `demo/warum/alarmlist.tsx`), the dock's two in
`demo/warum/dock.tsx`, the command palette's in `demo/warum/commandpalette.tsx`.
**None has been dropped.**

**No** assurance has been dropped from the behaviour tests.

### New dependencies

Two, both `devDependencies` of `@umriss/ui` and both invisible to callers of the
package (`files: ["dist", "CHANGELOG.md"]`):

* `sugar-high` — the highlighting, as provided for in the spec.
* `@types/node` — for the generator, which is a Node script. The spec had not
  foreseen it; without it `tsc` knows neither `node:fs` nor `process`.
  Both packages keep zero runtime dependencies.

### Addendum: what the review found

Two runs over the diff — one against the repo's standards, one against this spec
— found eight things, which are fixed. The three that a reader of the demo would
have noticed:

1. **Three behaviour tests required by this spec were missing** (code toggle,
   page switch, copy button). They now stand in
   `tests-visual/funktionen-seite.spec.ts`.
2. **The import line's copy button could throw into the page.** It was written
   twice, and only one of the two versions caught the case that there is no
   clipboard (http, frames, refusal). Now there is one:
   `demo/Kopierknopf.tsx`.
3. **`warum/datepicker.tsx` claimed that the three other picker pages referred
   to it** — but those had no "Warum so" section at all. Now they have one, and
   it really does refer.

Also: the jump palette assembled addresses by hand and took them apart with a
`split()` beside it, instead of using `ortVon()` and `ausAdresse()`;
`Showcase.tsx` was still called that, although CONTEXT.md puts the word on the
avoid list under "Vorführung" (now `Anwendung.tsx`); two test files carried a
local variable named `kachel`; `beispiel.css` also carried the page header, the
API table and "Warum so" (now `seite.css`); and the axe report stood twice
verbatim in the same file.
