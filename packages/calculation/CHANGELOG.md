# Changes to `@umriss-ui/calculation`

This document describes what changes for **callers** of the package: exports,
props, behaviour.

**The numbers.** The middle digit rises when something is added; the last one
when something is repaired. The seven packages are released in step, and a rename
keeps its old name for one further minor, with a warning, before the minor after
it removes the name ([the upgrade promise, ADR-0066](../../docs/adr/0066-one-number-peers-over-the-minor-a-rename-lives-one-minor.md)).
Whatever changes existing behaviour stands under a heading "Changed" of its own,
no matter which digit rose, with a `Migration:` line.

From 0.34.0 the packages share one number - five, six from 0.40.0, when the dashboard joined, and seven from 0.47.0, when alarms joined: they are released together, and a package without a change of its own still gets a heading for it.

---

## 0.49.0 – The second shakedown: lists that shrink, a flood that scrolls, five things the table lacked (Oct. 2026)

### Fixed

- **README links resolve on npm**: links to files the package does not ship point to the repository on GitHub.

## 0.48.0 – Released in step with core (Oct. 2026)

No change of its own; the number moves with core's touch scale, now an opt-in (ADR-0079): a `md` control of core stays 32 px under a finger unless the application imports `@umriss-ui/core/touch-scale.css`.

## 0.47.1 – Released in step with the table (Oct. 2026)

No change of its own; the number moves with the table's repaired exports.

## 0.47.0 – Released in step with alarms (Oct. 2026)

No change of its own; the number moves with the new package `@umriss-ui/alarms`.

### Changed

- **The peer ranges move to `^0.47.0`.**
  - Migration: install the 0.47 version of `@umriss-ui/core` beside it.

## 0.46.0 – Moves along (Oct. 2026)

No change of its own; the calculation is released with the other five under one number.

### Changed

- **The peer range on core moves to `^0.46.0`.**
  - Migration: install the 0.46 version of `@umriss-ui/core` beside it.

## 0.45.0 – A given says how far its source vouches for it (Oct. 2026)

### Added

- **`quality` on `Given` and the chain operands** `Plus`, `Minus`, `Times` and `DividedBy` (core's `Quality`, ADR-0077): every quantity built on a given carries the worst quality of its operands, as a word in the assessment column, a dotted or wavy line under the amount and in the line's sentence; a doubtful result shows that line in place of its double rule. Freshness is not carried up.

### Changed

- **The peer range on core moves to `^0.45.0`.**
  - Migration: install the 0.45 version of `@umriss-ui/core` beside it.

## 0.44.0 – A calculation without a name says so (Oct. 2026)

### Added

- **A `Calculation` with neither `aria-label` nor `aria-labelledby` (or an empty label) warns once in development.**

### Changed

- **The peer range on core moves to `^0.44.0`.**
  - Migration: install the 0.44 version of `@umriss-ui/core` beside it.

## 0.43.0 – Places that carry down, and a calculation's root (Oct. 2026)

### Added

- **`Calculation` takes a `ref`**, which receives its surface `<div>` (ADR-0068).

### Changed

- **A quantity without its own `decimals` takes those of the quantity it is an operand of**, where both have the same `unit` and `format`: down the tree, through a chain's interims, and for a `Ref` where its quantity is defined (ADR-0069).
  - Migration: nothing to change; an operand that showed the default places beside a parent with its own now shows the parent's - give it `decimals` of its own to keep the old figure.
- **A non-zero derived value no longer reads 0 at the default places;** it is shown without fixed places, in scientific notation where tiny. A caller's own or carried places are kept as given.
  - Migration: nothing to change; a tiny result that read "0.00" now reads its value.
- **The rest and the `ref` reach the surface**, and the name (`aria-label`, `aria-labelledby`, `aria-describedby`) still reaches the list (ADR-0068). No old form is kept, since an attribute stands on one element.
  - Migration: a selector or a test id that found the list now finds the surface.
- **The peer range on core moves to `^0.43.0`.**
  - Migration: install the 0.43 version of `@umriss-ui/core` beside it.

## 0.42.0 – A calculation written in a Server Component (Oct. 2026)

### Added

- **A calculation is written in a Server Component** (ADR-0067). The entry carries no `"use client"`: `<Calculation>` reads its tree where it is written, on the server, and hands the model to the view, a client component in `calculation.client.js` that the entry imports. The release check renders a costing sheet through React's Flight server and client.
- **Loadable in Vitest and Jest** with core's lines: the `.` entry carries a `default` condition, the README's "Testing" section points at core's, and the release check runs a test of a changed input under both runners.
- **TypeScript 5.4 or newer**, stated in the Install section (the declarations use `NoInfer`); the release check compiles a strict consumer under 5.4 as well as the current TypeScript.

### Changed

- **The peer range on core covers the minor: `^0.42.0`.** It named the exact patch before (`^0.41.1`), so npm refused an install beside an earlier patch of core with `ERESOLVE`; the six packages move under one number and a minor moves the range (ADR-0066).
  - Migration: nothing to change; any `@umriss-ui/core` 0.42 patch satisfies the peer.
- **An element rendered outside its calculation throws in development.** `Given`, the operators, `Chain`, `Ref` and the other elements are read by `<Calculation>`, never rendered; one that is rendered - passed through a client component, say - now throws a message saying to write the tree directly inside its `<Calculation>`.
  - Migration: write the elements directly inside `<Calculation>`, in the same file; a tree written directly inside renders as before.
- **The compact line follows the type tokens**, derived from `--u-text-xs` as the compact table's is, where it was 18 px written out; at the default tokens it is still 18 px.
  - Migration: nothing to change at the default tokens; under an application's own type tokens a compact calculation stays as close as the compact table's rows.

## 0.41.1 – The documentation runs where the code is (Oct. 2026)

### Changed

- **The documentation is no longer hosted.** The site on GitHub Pages is gone, and the package's `homepage` now names its README on GitHub. The running documentation of this version opens from a checkout of the tag `calculation-v0.41.1` with `pnpm install` and `pnpm start`, at `http://localhost:4170/umriss-ui/` - the repository README says how, under "See it running".
  - Migration: nothing to change; a bookmark or link to the old hosted site no longer resolves - open the documentation from a checkout of the tag, as described above.
- **`docs/llms-full.md` in the package stands on its own:** a link to another page points at that page's heading in the same file, a link to a place on the site that the file does not hold keeps only its text, and ADR-0032 is linked at this version's tag.
  - Migration: nothing to change; look at any tool that read `docs/llms-full.md` and followed its links to the site, which now find the heading in the same file.

## 0.41.0 – Money rounds as written, and no name clash in a dashboard (Oct. 2026)

### Fixed

- **A figure rounds its shortest decimal value half away from zero:** 1.005 shows 1.01 and 2.675 shows 2.68. It rounded the binary value before, so an invoice could show 1.00 + 2.67 + 0.28 and a total marked "≈" where every format beside it said 1.01 and 2.68.
- **A tiny given is never shown as 0:** without `decimals` a non-zero value so small that ten places would round it to zero is written in scientific notation (through core's formats) - 1.602E-19 C, shown and spoken - so a derivation no longer reads "… times 0 equals 96,485".
- **A calculation inside a dashboard widget is laid out right.** The dashboard set an unprefixed `--column` on each widget and the calculation read the same name, so labels, figures and units piled into the first column. Every private custom property now carries its package's name (`--_calculation-…`).

## 0.40.4 – No change of its own (Oct. 2026)

Released with the other five packages under their one number. No change of its
own.

## 0.40.3 – No change of its own (Oct. 2026)

Released with the other five packages under their one number. No change of its
own.

## 0.40.2 – No change of its own (Oct. 2026)

Released with the other five packages under their one number. No change of its
own.

## 0.40.1 – No change of its own (Oct. 2026)

Released with the other five packages under their one number. No change of its
own.

## 0.40.0 – No change of its own (Oct. 2026)

Released with the other five packages under their one number. No change of its
own.

## 0.39.0 – No change of its own (Oct. 2026)

Released with the other four packages under their one number. No change of its
own.

## 0.38.0 – No change of its own (Oct. 2026)

Released with the other four packages under their one number. No change of its
own.

## 0.37.0 – No change of its own (Oct. 2026)

Needs `@umriss-ui/core` 0.37; the peer range is `^0.37.0`. No change of its
own.

## 0.36.0 – No change of its own (Oct. 2026)

Needs `@umriss-ui/core` 0.36; the peer range is `^0.36.0`. No change of its
own.

## 0.35.0 – React 19 is the floor (Oct. 2026)

Needs `@umriss-ui/core` 0.35; the peer range is `^0.35.0`.

### Changed

- **React 19 is required.** The peers `react` and `react-dom` are `>=19`; `0.34.0` is the last version that serves React 18.

- **The package ships ES2022 syntax.** An application that serves older browsers transpiles it itself.

No other change of its own.

---

## 0.34.0 – One number for all five packages (Oct. 2026)

From this version all five packages carry one number and are released
together. Needs `@umriss-ui/core` 0.34; the peer range is `^0.34.0`. No change
of its own.

---

## 0.7.3 – Core 0.33.0 (Oct. 2026)

Needs `@umriss-ui/core` 0.33; the peer range moves to `^0.33.0`.

### Added

- **The unit tests run against React 18.3.1 and 19 in CI**, and a calculation is rendered to a string with no `window` in a test (`tests-unit/ssr.test.tsx`).

### Changed

- **Every entry begins with `"use client";`.** The built file `dist/calculation.js` starts with the directive, then the stylesheet import, so a bundler that splits server from client code takes each as client code. The directive is written to the built entries only; the sources are unchanged.

- **Every export is a client component.** A hook called in a Server Component now fails with React's message about a client reference, not one about `useState`.

---

## 0.7.2 – Core 0.32.0 (Oct. 2026)

Needs `@umriss-ui/core` 0.32; the peer range moves to `^0.32.0`. Nothing else changes for a caller.

---

## 0.7.1 – Core 0.31.0 (Oct. 2026)

Needs `@umriss-ui/core` 0.31; the peer range moves to `^0.31.0`. Nothing else changes for a caller.

---

## 0.7.0 – Density (Oct. 2026)

A calculation beside a compact table stood a third larger than it, on the same
material. It follows the density now (ADR-0051).

### Added

- **`density="regular" | "compact"` on `Calculation`.** Compact sets the lines
  at the compact table's measures: 11 px type and 27 px a line under a fine
  pointer, 35 px under a finger. A compact line that says one thing is exactly
  that tall - with a disclosure, with a verdict, the Result included. Columns,
  folding, emphasis and rule, the narrow and the two-line form, and what a
  screen reader hears stay as they are.

### Changed

- **A calculation takes the `UmrissProvider`'s density as its default.** Under
  a provider that says `density="compact"` every calculation becomes compact,
  without a change to your code; `density="regular"` on a calculation keeps
  that one as it was. Without a provider, or under one that is silent about
  density, nothing changes - a regular calculation does not move by a pixel.

---

## 0.6.1 – Core 0.30.0 (Oct. 2026)

Needs `@umriss-ui/core` 0.30; the peer range moves to `^0.30.0`. Nothing else changes for a caller.

---

## 0.6.0 – Rows from data (Oct. 2026)

A payslip's corrections, an invoice's surcharges, a team's movements: rows
that come from data, any number of them and of either sign, as one line that
folds (ADR-0049). Needs `@umriss-ui/core` 0.29; the peer range moves to
`^0.29.0`.

### Added

- **`Sum` takes any number of operands**, one or none included. With one it
  still folds and opens onto that one; with none it is worth zero, has no
  disclosure, and says "no entries" where its formula would stand
  (`calculationNoOperands` in core's wording). `Difference`, `Product` and
  `Quotient` keep their counts.
- **`emphasis="strong" | "muted"` and `rule="above"`** on every quantity:
  a line read first, a line that recedes and still counts in full, a section
  ruled off that is no interim - without CSS. On the Result either fails on
  the first render.
- **A demo page "Rows from data"**, ten examples from none to many rows, both
  signs, a tree and metrics; four examples of emphasis and rule on the page
  Calculation.

### Changed

- **A line that adds or takes away shows its contribution**: the direction as
  its operator, the number without a sign. A negative operand of a sum used to
  stand as "+ Corrections -18.00"; it now stands as "− Corrections 18.00", and
  so do the folded formula and the sentence. This holds for the operands of
  `Sum` and `Difference`, the first operand included (a negative one draws a
  leading "−"), and for a chain's `Plus`, `Minus` and first quantity. The
  quantity keeps its own sign where its derivation closes, as an interim, as
  the Result and where a reference names it. A factor keeps its sign; a line
  worth zero or missing, and a line whose metrics point in different
  directions, keep the operator as written.

---

## 0.5.3 – Core 0.28.0 (Oct. 2026)

Needs `@umriss-ui/core` 0.28; the peer range moves to `^0.28.0`. Nothing else changes for a caller.

---

## 0.5.2 – Core 0.27.0 (Oct. 2026)

Needs `@umriss-ui/core` 0.27; the peer range moves to `^0.27.0`. Nothing else changes for a caller.

---

## 0.5.1 – Core 0.26.0 (Oct. 2026)

Needs `@umriss-ui/core` 0.26; the peer range moves to `^0.26.0`. Nothing else changes for a caller.

---

## 0.5.0 – Every export explained (Oct. 2026)

The package explains itself where it is used: every export carries a comment,
every default a `@default` tag, and the demo lists all of it in an API index
(ADR-0044). What a calculation shows and does is unchanged. Needs
`@umriss-ui/core` 0.25; the peer range moves to `^0.25.0`.

### Added

- **The Calculation page says what a screen reader meets**: a section
  Accessibility after Keyboard gives the sentence each line is read as, in
  English and in German, the derivation button's name and state, the label
  to pass and what forced colours and reduced motion change. Every other page
  links the Calculation page's keys from a Keyboard section of its own. In
  the demo, the Markdown twins and `docs/llms-full.md`; the calculation is
  unchanged.
- **Every export carries a comment**: what a component or a type is for. The
  editor shows it on hover, from the package's `.d.ts`. Nothing else changes.
- **A prop's default stands in a `@default` tag** where its comment used to say
  it in words: the editor shows it on hover, and the props table in its Default
  column. Nothing else changes.
- **`docs/llms-full.md` defines every type a props table names**: a type
  without a table of its own (`MetricValues`, core's `Limit`) stands under
  "Types on this page" of each page that names it, with its comment and its
  members or its declaration.
- **`docs/llms-full.md` ends with the API index**: every export of the
  package, grouped as components and types, alphabetical, each with its
  comment and declaration or a link to the page and table where it stands, and
  the pages that use it. It replaces the appendix "The rest of the API". The
  same index is a page of the demo, at `/calculation/api/`.

### Fixed

- **`docs/llms-full.md` names the peer in its install line**:
  `npm install @umriss-ui/calculation @umriss-ui/core`, read from the
  manifest. It had named the calculation alone, and an install after it
  lacked core.

---

## 0.4.8 – Core 0.24.0 (Oct. 2026)

Needs `@umriss-ui/core` 0.24; the peer range moves to `^0.24.0`. Nothing else changes for a caller.

---

## 0.4.7 – Core 0.23.0 (Oct. 2026)

Needs `@umriss-ui/core` 0.23; the peer range moves to `^0.23.0`. Nothing else changes for a caller.

---

## 0.4.6 – Core 0.22.0 (Oct. 2026)

Needs `@umriss-ui/core` 0.22; the peer range moves to `^0.22.0`. Nothing else changes for a caller.

---

## 0.4.5 – Core 0.21.0 (Oct. 2026)

Needs `@umriss-ui/core` 0.21; the peer range moves to `^0.21.0`. Its record
picker in the scenarios is a `Select` at its natural width now, beside its
line of text instead of before it. Nothing else changes for a caller.

---

## 0.4.4 – Core 0.20.0 (Oct. 2026)

Needs `@umriss-ui/core` 0.20; the peer range moves to `^0.20.0`. Nothing else changes for a caller.

---

## 0.4.3 – Core 0.19.0 (Oct. 2026)

Needs `@umriss-ui/core` 0.19; the peer range moves to `^0.19.0`. Nothing else changes for a caller.

---

## 0.4.2 – Core 0.18.0 (Sep. 2026)

Needs `@umriss-ui/core` 0.18; the peer range moves to `^0.18.0`. Nothing else changes for a caller.

---

## 0.4.1 – Core 0.17.0 (Sep. 2026)

Needs `@umriss-ui/core` 0.17; the peer range moves to `^0.17.0`. Nothing else changes for a caller.

---

## 0.4.0 – Metrics side by side (Sep. 2026)

### Added

- **Metrics: several numbers on every line, side by side** (ADR-0038).
  `<Calculation metrics={[{ id, label, unit?, decimals? }, …]}>` names each
  metric once; every `value` on a `Given` or a chain's line is then an object
  with a number for each metric id - `value={{ heads: 31, fte: 27.5 }}`. The
  derivation is the same for every metric, and each is worked on its own. The
  type `Metric` (and `MetricValues`) is exported.
  - A head above the figures names each metric with its unit; the unit stands
    again only where a result closes - the Result, an interim, the line that
    closes an open derivation.
  - `null` for one metric makes absent only what depends on it in that metric;
    the badge says which metric ("FTE is missing"), the sentence the full
    reason.
  - Where the figures leave the labels less room than they need, and less than
    10 rem, each line puts them on a line beneath its label, still in their
    columns. Measured, not a breakpoint.
  - Every line reads as one sentence: its formula in names once, then each
    metric's number - "Logistics equals Warehouse plus Dispatch: Headcount
    58 HC; Full-time equivalents 45.7 FTE".
  - Fails on the first render, with a message saying which and where: a
    `value` that is not an object by metric, a metric's number left out or one
    for no metric, `unit`, `format` or `decimals` on a quantity, `target` or
    `limits`, `Product`, `Quotient`, `Times`, `DividedBy`, `metrics` empty or
    with an id twice, and a `value` by metric where the calculation has none.
- **A demo page "Metrics"**, six examples from two teams to a whole company.

### Changed

- **A calculation wider than its place scrolls instead of being cut off.** The
  frame clipped what did not fit; it now scrolls sideways, still clipped to its
  radius. A calculation that fits looks as before.
- **Narrow, a verdict or a reason beneath the label no longer widens the
  statement past its frame**: a long badge is cut at the frame's edge instead of
  pushing the numbers out of view.

---

## 0.3.7 – Core 0.16.0 (Sep. 2026)

Needs `@umriss-ui/core` 0.16; the peer range moves to `^0.16.0`. Nothing else changes for a caller.

---

## 0.3.6 – Core 0.15.0 (Sep. 2026)

Needs `@umriss-ui/core` 0.15; the peer range moves to `^0.15.0`. Nothing else changes for a caller.

---

## 0.3.5 – Found by search (Sep. 2026)

### Fixed

- **The package's description and keywords say what it is in the words a
  search uses**, and the demo it links to addresses every page by a path
  (`…/calculation/<page>/`) instead of a hash, with the page's text readable before
  the demo starts. Old `#/<page>` links still land. Nothing in the package's
  code changed.

---

## 0.3.4 – Core 0.14.0 (Sep. 2026)

Needs `@umriss-ui/core` 0.14; the peer range moves to `^0.14.0`. Nothing else changes for a caller.

---

## 0.3.3 – Core 0.13.0 (Sep. 2026)

Needs `@umriss-ui/core` 0.13; the peer range moves to `^0.13.0`. Nothing else changes for a caller.

---

## 0.3.2 – Core 0.12.0 (Sep. 2026)

Needs `@umriss-ui/core` 0.12; the peer range moves to `^0.12.0`. Nothing else changes for a caller.

---

## 0.3.1 – Core 0.11.0 (Sep. 2026)

Needs `@umriss-ui/core` 0.11; the peer range moves to `^0.11.0`. Nothing else changes for a caller.

---

## 0.3.0 – Forced colours and agent-readable docs (Sep. 2026)

Needs `@umriss-ui/core` 0.10; the peer range moves to `^0.10.0`.

### Added

- **The Windows contrast mode** (`forced-colors: active`, forced-colors 03).
  The hover coupling keeps its band as an outline in the system's selection
  colour, the open derivation its spine, the frame and the disclosure's ring an
  outline where the box-shadow stood; the verdicts keep their words. Nothing
  changes outside forced colours.
- **`docs/llms-full.md`**, the package's documentation as one Markdown file for
  a coding agent, in the npm package and pinned to its version: every demo page
  with its import line, its examples' source, its props tables and why it is
  built as it is, and the declaration of every other export. The same text
  stands online as <https://romanhaendler.github.io/umriss-ui/calculation/llms-full.txt>,
  with an index of the pages beside it (`llms.txt`).

## 0.2.4 – Core 0.9.0 (Sep. 2026)

Admits `@umriss-ui/core` 0.9, which only adds a token; the peer range moves to `^0.9.0`. Nothing else changes.

---

## 0.2.3 – Core 0.8.0: the canon of states (Sep. 2026)

Needs `@umriss-ui/core` 0.8: it reads core's pressed surfaces and motion tokens; the peer range moves to `^0.8.0`.

### Changed

- **The disclosure sinks while pressed** - on the key and on a foldable row -
  with core's `--u-color-surface-pressed`, like every quiet key of the library.

---

## 0.2.2 – Core 0.7.0 (Sep. 2026)

### Changed

- **The worst-verdict glyph and the lost freshness read core's
  `--u-color-danger-text`** - lighter in the dark theme, 4.5:1 on every surface.
  The peer range moves to `@umriss-ui/core` `^0.7.0`.

---

## 0.2.1 – Core 0.6.0 (Sep. 2026)

### Changed

- **The calculation takes `@umriss-ui/core` 0.6.** Nothing in the calculation
  changed; the peer range moves to `^0.6.0`, so that it installs beside
  `@umriss-ui/table` 0.3, which needs core's new wording.

---

## 0.2.0 – A chain stands open (Sep. 2026)

0.1.0 was committed in the repository but never published; this is the first
version on npm.

### Changed

- **A chain in view no longer folds.** Every line and every interim stands
  open, as on paper - gross salary, each deduction with its minus, the net
  salary beneath a rule once they all stand. What should show only on request
  is written as a tree in one line: a `<Sum>` held by a `<Minus>` folds like
  any tree and opens beneath its line. A chain that is an operand still folds,
  as a whole, and opens whole.
- **No disclosure column where nothing can fold**: a calculation of givens
  and chains alone starts its labels at the surface's edge.
- **The hover band on operands** is half the accent's surface instead of a
  grey, so coloured text in a marked row keeps its contrast.

---

## 0.1.0 – First release (Sep. 2026)

A calculation a reader can follow and redo: the package evaluates every
operation it shows, so what stands on the screen cannot disagree with the
number. Takes `@umriss-ui/core` `^0.5.0` as a peer, for its wording.

### Added

- **`Calculation`** and the **tree** (ADR-0027): `Given`, `Sum`, `Difference`,
  `Product`, `Quotient` and `Ref`, written as nested elements the way the
  derivation reads. Full precision throughout, rounding only on the screen.
- **The chain** (ADR-0028): `Chain`, `Plus`, `Minus`, `Times`, `DividedBy` and
  `Interim` - a calculation read top to bottom, each operand worked into the
  value before it, ended by an interim. No precedence: a `Times` or
  `DividedBy` stands alone between two named values. Tree and chain mix both
  ways.
- **Absence and approximation.** A missing given or a division by zero makes
  every dependent quantity absent, with the reason - never zero. Where the
  rounded operands do not give the rounded result, the result is marked "≈".
- **Assessment and freshness** through core: `target` and `limits` on any
  quantity, `source`, `asOf` and `ages` on a given; the worst verdict inside a
  folded row stands beside it.
- **The statement**: a surface in the material of the library's tables and
  cards, rows of one height, fixed columns for label, names, operator, number,
  unit and assessment. The outermost statement stands as on paper and closes
  on the Result, underlined twice. Every other derivation is folded and opens
  beneath its row, joined to it by a falling line and closing with
  "= label"; the row never moves. A folded row shows the formula it hides in
  names, or how many operands there are above four. The verdict is core's
  `Badge`; "≈" explains itself in a `Tooltip`. Narrower than 34 rem the
  layout gives the numbers room.
- **Accessibility**: a nested list, one sentence per row - "Availability
  equals Run time divided by Planned production time, equals 412 min divided
  by 450 min, equals 91.6 percent" - and a disclosure button per derivation.
- **Development errors** on the first render, each saying which and where: a
  `Ref` to nothing (listing the ids that exist), a circle through references,
  a wrong operand count, a duplicate id, a component of the caller's own
  wrapping an element, and every rule of the chain.
