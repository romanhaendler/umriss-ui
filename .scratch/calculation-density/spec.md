# Calculation density: a calculation stands as close as the table beside it

Status: ready-for-agent
Date:   2026-10-10
Origin: the user's question on `@umriss-ui/calculation` 0.6.1: "Meinst du
nicht, dass der kompakte Modus auch bei calculations Sinn ergeben würde?" The
answer is yes; this is what it takes. The terms are in `CONTEXT.md`
(**Provider**, **Row pitch**, **Control size**, "Calculations"); what compact
measures is ADR-0042, how a calculation is shown is ADR-0028.

## Problem Statement

An application built for a data-dense screen says `density="compact"` on its
tables and alarm lists, or once on the `UmrissProvider`, and those surfaces
close up: 11 px type, 27 px a row under a fine pointer. A `Calculation` on the
same screen does not hear it. It has no `density` and does not read the
provider's, so it stands at 13 px type and - by its stylesheet, not measured -
36.5 px a line, whatever the surfaces around it do.

- A calculation beside a compact table reads as a component from another
  screen: a third larger in type-and-line, on the same material.
- A derivation of ten lines takes about 365 px where a compact table shows the
  same ten lines in 270. In a side panel, a row detail or a control room
  region the calculation is the surface that pushes the fold down.
- `<UmrissProvider density="compact">` promises "the default for the density
  of every component that reads it" and the calculation, a data surface of
  rows like the other two, is not among them. The application has no way to
  say it for a calculation at all, short of CSS against internals that
  ADR-0045 declares off limits.

## Solution

- **`Calculation` takes `density="regular" | "compact"`**, with the same
  default as `Table`: its own value, else the density a provider explicitly
  set, else `"regular"`.
- **Compact is the table's compact, not a second one.** Lines at 11 px type on
  an 18 px line with 4 px above and below: 27 px a line under a fine pointer,
  the compact row pitch. Under a finger the type stays and the padding goes
  back to 8 px: 35 px, the compact row pitch under a finger.
- **Only how close the lines stand and how large their type is changes.** The
  columns, the indent per depth, the disclosure, the falling line of an open
  derivation, the hover coupling, emphasis and rule, the verdicts' badges, the
  narrow and two-line forms, and the sentence each line is read as all stay
  exactly as they are.
- **The Result stays the Result**: one type step above its lines, on the
  sunken surface, underlined twice, the double rule in full inside its row.
- A regular calculation does not move by a pixel.

## User Stories

1. As an application developer, I want to write `density="compact"` on a
   `Calculation`, so that one calculation in a tight place stands close
   without CSS of my own.
2. As an application developer who set `<UmrissProvider density="compact">`,
   I want every calculation under it to be compact, so that I say "dense"
   once for the whole application.
3. As an application developer, I want a calculation's own `density` to win
   over the provider's, so that one statement meant to be read at length
   stays regular in a dense application.
4. As an application developer whose provider is silent about density, or who
   has no provider, I want a calculation to stay regular, so that upgrading
   changes nothing I did not ask for.
5. As an application developer, I want the prop to carry the same two values
   and the same name as the table's, so that I do not learn a second
   vocabulary for the same decision.
6. As an application developer, I want the prop in the props table with the
   example that shows it, so that I find it where I look up every other prop.
7. As a reader of a screen with a compact table and a calculation side by
   side, I want their lines to stand at the same height and in the same type,
   so that the page reads as one surface.
8. As a reader, I want a compact calculation's numbers to end on one column
   edge at every depth, so that I can still add them up by eye.
9. As a reader, I want the Result to remain the heaviest line of a compact
   calculation, so that I find the answer first.
10. As a reader, I want the Result's double rule drawn in full in compact, so
    that the final figure is not marked with a cut line.
11. As a reader, I want a line I click to stay where it is and its derivation
    to open beneath it in compact too, so that nothing jumps under the
    pointer.
12. As a reader, I want an open derivation's group - sunken surface, falling
    line, closing "= label" - to look the same in compact, only closer, so
    that I do not relearn the component.
13. As a reader, I want a strong line, a muted line and a rule above to work
    in compact as they do in regular, so that the writer's emphasis survives
    the density.
14. As a reader, I want an interim's rule and a closing line's rule to stay
    across the figures in compact, so that a chain still reads as on paper.
15. As a reader, I want a line's notes - explanation, source, freshness, the
    caller's aside - to stay beneath its label in compact and still recede,
    so that I can tell the note from the line.
16. As a reader, I want verdict badges, targets and the worst verdict of a
    folded row to fit a compact line without making it taller than its
    neighbours, so that lines with an assessment do not stand out by height.
17. As a reader of a calculation with metrics, I want the head and every
    metric's column to close up with the lines, so that a staff report of
    thirty lines fits where twenty did.
18. As a reader on a narrow place, I want a compact calculation to take its
    narrow form and its two-line form by the same rules as a regular one, so
    that the density never costs me the figures.
19. As a reader on a touch device, I want a compact calculation's foldable
    lines to stay tall enough to tap, so that dense does not mean
    unreachable.
20. As a reader with a long label, I want it to wrap in compact as it does in
    regular, so that nothing I need is cut off for the sake of height.
21. As a screen reader user, I want every compact line read as the same
    sentence as before, so that density is a matter for the eye alone.
22. As a keyboard user, I want every disclosure reachable and its focus ring
    in full in compact, so that the tighter line does not clip where I am.
23. As a user of forced colours, I want the hover outline and the falling
    line in the system's colours in compact, so that the mode I rely on is
    not a regular-only feature.
24. As a user of the dark theme, I want compact to hold the contrast of every
    text colour it uses, so that smaller type is not also fainter type.
25. As an application developer switching density at runtime, I want the
    calculation to re-measure whether its figures need a second line, so
    that a toggle in my toolbar leaves no stale layout.
26. As an application developer with a regular calculation in production, I
    want this release to leave it untouched to the pixel, so that I can
    upgrade without reviewing my screens.
27. As an application developer theming umriss, I want compact built from the
    same tokens as regular, so that my token overrides hold in both.
28. As a coding agent reading `docs/llms-full.md`, I want the prop, its
    default and its example there, so that I write `density` and not a
    `style`.
29. As a maintainer, I want the glossary to say what density is and which
    surfaces follow it, so that "compact mode" does not become a second word
    for it.
30. As a maintainer, I want the provider's own comment and core's README to
    name the calculation among the components that read the density, so that
    the documents do not say "table and alarm list" while the code says
    three.
31. As a maintainer, I want the changelog to say that a calculation under a
    provider with `density="compact"` becomes compact, so that the one
    visible change of this release is announced.
32. As a visitor of the control room page, I want the kiln line's OEE to
    stand as close as the compact alarm list above it, so that the page
    shows what the prop is for.

## Implementation Decisions

- **One new prop on `Calculation`**: `density?: "regular" | "compact"`,
  resolved with core's `useDensityFor(density, "regular")` - the hook the
  table and the alarm list already use. No new hook, no new context, no new
  export from core; `@umriss-ui/calculation` already depends on core.
- **The provider's density becomes the calculation's default.** This is the
  one change a caller can see without touching their code: an application
  that already has `<UmrissProvider density="compact">` gets compact
  calculations on upgrade. It is what the setting says it does; it goes into
  the changelog as a change, and the release is a minor.
- **Compact takes the table's measures** (ADR-0042), so that the two can
  stand side by side:
  - lines: `--u-text-xs` on an 18 px line, `--u-space-1` above and below,
    1 px hairline: 27 px;
  - under a coarse pointer the padding returns to `--u-space-2`: 35 px. A
    foldable line is its own target, so it is the line that grows, not a
    control in it;
  - the Result's number: one step above its lines, so `--u-text-sm`;
  - notes, target, worst verdict and the metrics' head are at the smallest
    type step already and stay there; they keep receding by colour and
    place;
  - a line's further rows - notes, an assessment moved beneath the label, the
    figures of the two-line form - and the metrics' head take the compact
    padding with the line.
- **The line height is said in whole pixels in compact** (18 px), as the
  table's is. Regular keeps the line it has; see Out of Scope.
- **Horizontal measures do not change**: the column gaps, the indent per
  depth, the label's padding, the distance between metrics. A compact table
  keeps its horizontal padding too.
- **The disclosure stays 20 px.** It fits a 26 px line with 3 px to spare and
  is the pointer's target; the 20 px badge fits by the same margin. Neither
  may make a line taller than a line without them.
- **The Result's double rule gives way in its offset, never in the row's
  height**: the row is as tall as its neighbours and the rule stands in full
  above the frame's clipped edge.
- **A line is still as tall as what it says.** A label wraps, a note adds a
  row; compact changes the padding and the type, not that rule. The row pitch
  is and stays the table's word - a calculation has lines, and "27 px" is the
  height of a line that says one thing.
- **The thresholds stay**: the narrow form at 34 rem of its own width and the
  two-line form where the figures leave the label less than 10 rem. Both are
  in rem and measured, so compact - narrower figures - simply reaches them
  later. The measure already runs after every commit; a change of density is
  a commit.
- **How the stylesheet learns the density is internal** (ADR-0045): a marker
  on the frame, like the ones it carries today for "nothing folds", metrics
  and two lines. Tokens only; no variable named like a token.
- **The calculation does not compose core's `dense` step.** That step trades
  the small control height for the extra-small one; a calculation holds no
  sized control.
- **Documents**, all in this change:
  - `CONTEXT.md` gains **Density** under "How the library is built": how
    close a data surface sets its lines, regular or compact, said on the
    surface or once on the **Provider**; followed by the table, the alarm
    list and the calculation. _Avoid_: compact mode, dense mode, size (a
    **Control size**'s word), row height. The two sentences that call the
    provider's density "how close a table sets its rows" are corrected.
  - A short ADR-0051, "A calculation follows the density", with the
    alternatives that were real: a prop the provider does not reach (the
    application says it once per calculation, and the setting stays half
    true); tighter lines at the regular type (27 px lines of 13 px type are
    cramped, and still do not match the table beside them); a compact set of
    tokens for the whole library (work package B.13, still not built, and not
    needed for a third surface of rows).
  - The provider's comments and core's README name the calculation beside
    the table and the alarm list.
  - The calculation's README and changelog; a demo example on the
    Calculation page in the shape of the table's density example - one
    calculation three ways: regular, `density="compact"`, and under a
    provider that says compact - so the props table links the prop to it and
    `docs/llms-full.md` carries it.
- **The control room's kiln line sets its OEE calculation compact**, beside
  the alarm list that already is. This is an assumption about that page, and
  the one item here that can be dropped without touching anything else.

## Testing Decisions

A good test here measures what a reader sees - a line's height, a column's
edge, a row that did not move - on the rendered demo, in the browsers the
workspace supports. It does not assert the marker on the frame, a class name
or a custom property: those are the internals ADR-0045 keeps free.

One seam carries the feature: **the demo's density example in the browser
suite** of `@umriss-ui/calculation`, through the public prop and the public
provider. jsdom has no layout, so a unit test could only see the marker; the
resolution of `useDensityFor` itself is already covered in core's provider
tests and is not tested again.

- **Line height, three browsers**: in the density example, every line that
  says one thing is 27 px in the compact calculation and in the one under the
  provider, in Chromium, Firefox and WebKit. The regular one beside them is
  taller. Prior art: the table's suite holding every row at one pitch
  (row-pitch, ADR-0042).
- **Under a finger**: the same lines are 35 px with a coarse pointer
  emulated. The table's browser suite has no test under a coarse pointer to
  copy; this one is new, and it is the only new kind of test here.
- **Own wins**: a `density="regular"` calculation under a compact provider
  measures as the regular one.
- **Uniform lines**: a compact line with a disclosure, one with a verdict
  badge and one with neither measure the same.
- **Figures in one column**: the right edges of the numbers at every depth of
  an opened compact derivation are equal.
- **The clicked line does not move**: the existing test of that name, run
  against the compact example as well.
- **Metrics**: a compact calculation with metrics, set to the widths the
  existing two-line test uses, throws no page error (a flag that flips ends
  in React's update-depth error) and never grows wider than its frame.
- **Screenshots**: the new example is shot with every other example, light
  and dark, by the suite that reads the outline - the Result's double rule in
  full is judged there. The forced-colours suite takes the example as well.
- **Nothing regular moves**: every existing snapshot of the calculation's
  demo passes unchanged. This is the regression guard of the release; a
  changed snapshot of a regular calculation is a defect, not a baseline to
  renew.
- **Gates that already exist and must stay green**: the style guard (layer
  order, no token-named variable), the props gate (the new prop has JSDoc and
  an example; `unshown.json` stays empty), the demo smoke test, the
  accessibility suite on the page with the new example.
- Core's suite renews the control room's snapshots if the kiln line's OEE is
  set compact, and only those.

## Out of Scope

- **The schedule and the charts.** A schedule's lanes and a chart's frame are
  not rows of text; whether density means anything there is its own question.
- **A compact set of tokens** for the whole library (B.13). Compact stays a
  property of the surfaces that have lines.
- **A fixed pitch for a calculation's lines.** No ellipsis on a label, no
  one-line rule: a calculation's label is the name of a quantity and is read
  in full.
- **The regular line's half pixel.** By its stylesheet a regular line is
  13 px × 1.5 + 16 + 1 = 36.5 px - the half pixel ADR-0042 removed from the
  table. Setting it to a whole pixel would move every regular calculation and
  renew every snapshot; it is a change of its own, with its own measurement in
  three browsers first.
- **A third density**, or a density per line.
- **Sized controls inside a note.** A caller who puts a control into a
  quantity's aside sizes it themselves.

## Further Notes

- The numbers for the regular calculation above are read from the stylesheet,
  not measured in a browser. The first step of the implementation is to
  measure a regular and a compact line in the three browsers and correct this
  spec's figures if they differ; the target - a compact line as tall as a
  compact table's row - holds either way.
- The seams were not confirmed with the user before writing (the spec was
  produced unattended). If the browser suite on the density example is not
  the seam wanted, that section is the one to change; nothing else depends on
  it.
- In compact a line and its note are both at 11 px and differ by colour and
  place alone. If that reads as too flat on the rendered page, the fix is the
  note's, not a smaller type step - there is none.
