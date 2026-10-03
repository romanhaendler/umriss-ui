# Spec: The sidebar tree, read again: rubrics by subject, pages by reading order

Status: ready-for-agent

Origin: session of 2–3 Oct 2026. The brief, in the words it was given in:
"Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art,
sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen."
The follow-up brief, given with the request for these specs: "Bitte überdenke
zusätzlich noch einmal ausdrücklich die Struktur des Menü-Baums. Ist es in Core
z. B. richtig, Sizes mit konkreten Inputs zu mischen? Ist dort die Einsortierung
korrekt, die Reihenfolge, etc.?" Research and gap analysis:
`docs/research/component-docs-2026-10/` (six notes). Roadmap of all sixteen
specs: `.scratch/docs-roadmap/spec.md`.

Builds on: `.scratch/demo-rubrics/spec.md` (core's rubrics, Sep 2026, and the
order rule under **Rubric** in `CONTEXT.md`), `.scratch/demo-consolidation/spec.md`
(the charts' rubrics), `.scratch/demo-rework/spec.md` (the rubrics of table,
schedule and calculation as they stand), ADR-0037 (pages are addressed by
path), ADR-0041 (control size and field width).

Blocked by: nothing. The two pages this tree makes room for, core's **Theming**
(`theming-and-wording-reference`) and every package's **API index**
(`api-index`), slot in when their specs land. Until then, their places stay
empty and nothing waits on them.

ADR: none. A rubric has no address and no meaning inside the library
Tickets: `issues/01`–`04`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.
(`CONTEXT.md`, **Rubric**). The three page addresses that move here are
forwarded, so no link breaks. Nothing here is a decision a caller of the
packages could notice.

---

## Problem Statement

The question in the brief has an answer: **no.** `Sizes` stands in core's
**Forms** rubric between `FormField` and `Textarea`. It is not a form control.
It is the page for the **Control size** of every control that has two
heights, buttons included, and for how wide every field stands (ADR-0041). An
application sets it once, with `ControlSizeProvider`, for a whole place. The
table's toolbar is one such place. That makes it the same kind of page as
**Language**, which sits in Getting started: something every component shares
and an application decides once. A reader looking for "how do I make my
controls smaller" does not look between `FormField` and `Textarea`. A reader
looking for `Textarea` does not expect a page about the size of buttons on the
way there. It landed in Forms with the commit that delivered it
(`core, table: a Sizes page …`), because that is where the fields were.

That one misplacement is a symptom. Reading all five outlines the way
`demo-rubrics` read core's in September turns up four more kinds of fault:

**A rubric too long to be one subject.** Forms holds 17 of core's 54 pages.
That is a third of the sidebar under one heading. In it, two separate subjects
sit in the order they were delivered: fields you type into or set directly
(`Input`, `NumberInput`, `Checkbox`, `Switch`, `Slider`, …), lists that open to
choose from (`Select`, `Combobox`, `MultiSelect`), and four date and time
pickers. `CONTEXT.md` itself says "the pickers" for the date pickers alone.
Mantine, the closest reference for a library of this breadth, cuts the same
material into Inputs, Combobox and Dates
(`docs/research/component-docs-2026-10/component_api_reference.md`).

**Orders that break the rule written under Rubric.** The rule says pages run
from the simple to the composed. Today's outlines break it in five places:

- **Layout:** `Card` comes before `Divider`.
- **Feedback:** `Alert` and `Toast`, messages with tone and actions, come
  before `Spinner`, `ProgressBar` and `Skeleton`.
- **Navigation:** `Stepper` comes before `Tabs` and `Accordion`.
- **Data display:** values (`Stat`, `Meter`, `Sparkline`) come before the
  labels (`Badge`, `Tag`) they are built from.
- **The charts' Series:** `BoxPlot` comes before `Scatter`.

**A page in a rubric that says the opposite of it.** `Pagination` stands under
the table's **Finding rows**. It finds nothing: it cuts many rows into pages,
which is what **Many rows** is about.

**Getting started that is not the same thing twice.**
- The table's Getting started ends with its first working page, `First table`.
- The schedule's `First schedule` stands inside **Plan**, behind nothing, so
  its Getting started is one page long.
- The charts call their install page "Getting started" at
  `/charts/getting-started/`, where the four other packages say "Installation".
- The schedule's **Findings** is a rubric of one page whose sentence is
  **Reading**'s sentence said again.
- The table's `First table` lives at `/table/table/`, an address that names the
  package twice.

None of these is large. Together they are why the sidebar reads like a log of
arrivals in the places where it was appended to, and the order rule exists to
prevent exactly that.

## Solution

Core gets three new rubrics, for a different reason each: **Customising** for
what an application sets once, and **Choosing** and **Dates and times** to
break up Forms. Six orders are corrected to the rule. Three pages change
rubric in table and schedule. One rubric of one page folds into its
neighbour. Three page addresses change, each forwarded from its old address
by a mechanism the outlines declare. The two new pages from sibling specs get
fixed places: **Theming** opens Customising, and **API index** closes every
package.

The tree after this spec. Pages in reading order; "new" marks a page another
spec creates.

**core**
| Rubric | Pages |
|---|---|
| Getting started | Installation · UmrissProvider |
| **Customising** *(new)* | Theming *(new, S8)* · Sizes · Language |
| Layout | Stack and Grid · **Divider · Card** · Splitter · Dock |
| Typography | Typography · VisuallyHidden |
| Actions | Button · IconButton · ButtonGroup |
| Forms | Input · FormField · Textarea · NumberInput · Slider · Checkbox · Switch · RadioGroup · FileInput |
| **Choosing** *(new)* | Select · Combobox · MultiSelect |
| **Dates and times** *(new)* | DatePicker · DateTimePicker · DateRangePicker · DateTimeRangePicker |
| Feedback | **Spinner · ProgressBar · Skeleton · Alert · Toast** · EmptyState |
| Overlays | Tooltip · Popover · Menu · ContextMenu · Modal · Drawer · ConfirmDialog · CommandPalette |
| Navigation | Breadcrumb · **Tabs · Accordion · Stepper** · TreeView |
| Data display | **Badge · Tag** · Stat · Meter · Sparkline |
| API index | API index *(new, S7)* |

**charts**
| Rubric | Pages |
|---|---|
| Getting started | **Installation** (was "Getting started", now at `/charts/installation/`) |
| Chart | Chart · Axis |
| Series | Line · Area · Bar · **Scatter · BoxPlot** · StateBand · Matrix |
| Limits and alarms | LimitLine · ControlChart · Pareto |
| Around the chart | Tooltip & Legend · Benchmark |
| API index | API index *(new)* |

**table**
| Rubric | Pages |
|---|---|
| Getting started | Installation · First table (now at `/table/first-table/`) · Provider |
| Columns | Column · Formats · Width and pinning · Presets |
| Finding rows | Sorting · Search · Filter · Pre-filter |
| Grouping | Grouping · Tree rows · Aggregate |
| Rows | Selection · Row appearance · RowDetail · RowActions |
| Around the table | Toolbar · Toolbar controls · ColumnMenu · Export · View |
| Many rows | **Pagination** · Virtualisation · Manual mode |
| Editing | Grid mode · Edits |
| Limits and alarms | VerdictColumn · AlarmList |
| API index | API index *(new)* |

**schedule**
| Rubric | Pages |
|---|---|
| Getting started | Installation · **First schedule** |
| Plan | Lanes · Lane groups · Subtasks · Bar labels · Appearances · Overlap · Dependencies · Routes |
| Time | Time axis and calendar · Blocked time · Now line · Pan and zoom |
| Reading | Selection · Interactions · Tooltip · Linked schedules · The handle · **Findings as data** |
| Editing | Move and lane · Stretch, lead-in, lead-out · Snapping · Placing from outside · Where a subtask may go · Ripple |
| API index | API index *(new)* |

**calculation**
| Rubric | Pages |
|---|---|
| Getting started | Installation |
| Writing a calculation | Calculation · Tree · Chain · Given · Metrics |
| In practice | What can go wrong · Worked examples |
| API index | API index *(new)* |

### Each move, argued

**Sizes leaves Forms for Customising.** The page answers two questions: how
tall every control is (`size`, `ControlSizeProvider`, the Control size) and
how wide every field is (`chars`, the place's width). The first applies to
`Button` and `IconButton` as much as to `Input`. The second is a rule over all
fields, not a field. Neither is a component a reader looks up by name, and
"one page per component a developer searches for by name" is the rule the
other Forms pages follow (`demo-as-documentation`, still in force). An
application decides both once per place. **Language** and the coming
**Theming** are decided once per application. The three together are what
"customise" means in every library the research looked at: MUI's
"Customization", Mantine's "Theming" and "Styles", Chakra's tokens. The
rubric is called **Customising** (British spelling, as the workspace writes
"colour") with the sentence *"What every component shares and an application
sets once: its colours, its size, its words."* Order: Theming (the broadest:
every colour, every surface), then Sizes, then Language (the narrowest: text
and notation).

**Language leaves Getting started.** Getting started is the path to the first
working screen: install the package, wrap the application in
`UmrissProvider`. Language is optional on that path. English is the default
and needs nothing, so it sits with the other decisions an application makes
once, not on the path every reader walks. Getting started becomes two pages,
and both are mandatory.

**Forms becomes three rubrics.** The cut follows what the user does with the
control:
- **Forms:** types a value or sets it directly on the screen. *"Where a user
  types a value or sets one directly on the screen."*
- **Choosing:** opens a list and chooses from it. *"Where a user chooses one
  value or several from a list that opens."*
- **Dates and times:** opens a calendar. *"Where a user picks a day, a moment
  or a span of them from a calendar that opens."*

Not one rubric called "Pickers": `CONTEXT.md` uses "the pickers" for the date
pickers alone, and putting `Select` under that word would blur a term the
codebase uses. `RadioGroup` stays in Forms. Its options stand on the screen
and nothing opens, which is the line between Forms and Choosing. Forms falls
from 17 pages to 9. The largest rubric in core becomes Forms with 9 pages,
then Overlays with 8.

**Inside Forms, FormField stays second, right after Input.** By the
composition rule `FormField`, a label and message around a control, would
come last. But every later page in Forms, Choosing and Dates and times labels
its control with `FormField` in its examples. A reader meets it on every page
after Input and needs it explained before the second one. **When every later
page uses a page, reading order beats composition order.** `CONTEXT.md`'s
**Rubric** entry gains that sentence, so the next person to sort a rubric
does not "correct" it back. The rest of Forms is grouped by the kind of value:
text (`Input`, `Textarea`), number (`NumberInput`, `Slider`), on/off
(`Checkbox`, `Switch`), one of few (`RadioGroup`), file (`FileInput`).
Choosing runs from one value to several (`Select` → `Combobox`, which adds
typing → `MultiSelect`). Dates and times keep today's order: a day, a moment,
a span of days, a span of moments.

**Six orders follow the rule.**
- **Layout:** `Divider` before `Card`; a line is simpler than a surface with
  a head and a body.
- **Feedback:** the indicators that say "something is under way" (`Spinner` →
  `ProgressBar` → `Skeleton`), then messages with tone (`Alert`, then `Toast`,
  which needs the provider), then `EmptyState`, which composes text, a glyph
  and an action.
- **Navigation:** `Breadcrumb` → `Tabs` → `Accordion` → `Stepper` →
  `TreeView`. Stepper carries states and an order; the tree carries a whole
  model.
- **Data display:** labels before values. `Badge` → `Tag` (which adds a
  remove action and a group) → `Stat` → `Meter` → `Sparkline`. That is the
  rubric's own sentence, "single values and labels, read at a glance", in the
  order of what is built from what.
- **The charts' Series:** `Scatter` before `BoxPlot`. A point is simpler than
  a box with whiskers and outliers, and `BoxPlot` is the one series with an
  ADR of its own (ADR-0040).
- **Unchanged and checked:** Typography, Actions, Overlays (already `Tooltip`
  → `Popover` → `Menu`, the example `CONTEXT.md` gives), and Dates and times.

**Rubric order in core** keeps today's sequence and inserts the new rubrics
where their pages came from. Customising goes right after Getting started:
the decisions an application makes once come before the components, as in
MUI and Mantine. Choosing and Dates and times go right after Forms. API index
is last. Layout before Typography stays as it is today. Swapping them would
churn every page head for no reader's gain.

**Charts: "Getting started" becomes "Installation".** The page installs the
package and draws a first chart, the same content the four other packages
call Installation. One name across five packages lets a reader who knows one
demo find their way in the next. The page moves to `/charts/installation/`,
and `/charts/getting-started/` forwards there. The rubric keeps its name,
Getting started, as in the other four packages.

**Table: Pagination opens Many rows.** **Many rows** reads *"Tables of
thousands of rows, in the browser or on a server"*. Paging is the simplest
answer to that, virtualisation the second, manual mode the third. **Finding
rows** keeps Sorting, Search, Filter and Pre-filter, all of which reduce or
order rows towards the ones that matter. `First table` moves from
`/table/table/` to `/table/first-table/`; the old address forwards.

**Schedule: First schedule joins Getting started; Findings folds into
Reading.** `First schedule` is the page that draws the first plan, so it
belongs on the path to it, as `First table` does in the table. Plan then
opens with `Lanes`. Findings was a rubric of one, and "a rubric of one is
allowed when the page is heavy" does not apply. Its page is one of several
ways a planner reads a plan. Reading's sentence already says *"what a planner
takes out of the picture"*, and findings as data are exactly that, so the page
becomes Reading's last.

**Calculation: unchanged.** `Calculation` stays at the head of **Writing a
calculation**, as `Chart` heads the charts' **Chart** rubric. It is the
container of the two forms the rubric is about, not a first screen of its
own. Installation already points to it ("Start with Calculation").

**Across the packages:** Getting started is the first rubric, API index the
last, and the rest stands as listed. The scenarios page stays at the head of
the sidebar, above every rubric, as it is today.

### Forwarding a moved address

Three addresses move: `/charts/getting-started/` → `/charts/installation/`,
`/table/table/` → `/table/first-table/`, and the schedule page that moves
rubric keeps its address. A rubric is not in the address. Only page ids that
change need forwarding. This spec builds the one mechanism every later rename
will use, and owns it. No other spec renames a page.

## User Stories

1. As an application developer looking for how to make every control smaller, I want Sizes under a rubric about settings the whole application shares, so that I find it without scanning seventeen form fields.
2. As an application developer looking for `Textarea`, I want Forms to hold only things I type into or set directly, so that I am not sent past a page about button heights on the way.
3. As a reader new to umriss, I want Getting started to hold only what I must do before the first screen, so that I can finish it in two pages and start building.
4. As an application developer about to theme my product, I want Theming, Sizes and Language side by side under Customising, so that every "set once for the whole application" decision lives in one place.
5. As a reader scanning core's sidebar, I want no rubric longer than about nine pages, so that a rubric heading stays a meaningful landmark rather than a scroll.
6. As a developer who needs a dropdown, I want `Select`, `Combobox` and `MultiSelect` under one rubric about choosing from a list, so that I compare the three where they stand together.
7. As a developer who needs a date or a time range, I want the four pickers under Dates and times, so that I choose between them without hunting through Forms.
8. As a developer reading Forms top to bottom, I want `FormField` explained right after `Input`, so that the labels in every later example already make sense.
9. As a maintainer sorting a rubric later, I want the exception "reading order beats composition when every later page uses a page" written under Rubric in `CONTEXT.md`, so that I do not move `FormField` to the end by rule.
10. As a reader learning layout, I want `Divider` before `Card`, so that the pages build from the simple to the composed as the glossary promises.
11. As a reader learning feedback, I want spinners, progress bars and skeletons before alerts and toasts, so that the indicators come before the messages that compose them.
12. As a reader learning navigation, I want `Tabs` and `Accordion` before `Stepper` and `TreeView`, so that the simplest ways through a screen come first.
13. As a reader learning data display, I want `Badge` and `Tag` before `Stat`, `Meter` and `Sparkline`, so that labels come before the values built with them.
14. As a reader of the charts, I want `Scatter` before `BoxPlot`, so that the series grow in complexity as I read down.
15. As a reader of the charts who already knows the core demo, I want the first page called Installation, so that every package starts the same way.
16. As a table user looking for pagination, I want it under Many rows next to virtualisation and manual mode, so that I compare the three answers to the same problem.
17. As a table user looking for how to narrow rows, I want Finding rows to hold only sorting, search and filters, so that its heading means what it says.
18. As a schedule user, I want First schedule in Getting started, so that the path to my first plan ends with a plan on the screen, as the table's does.
19. As a schedule user, I want the findings page under Reading, so that the sidebar has no one-page rubric that repeats its neighbour's sentence.
20. As a reader in any package, I want Getting started first and the API index last, so that the start and the complete list sit in the same places everywhere.
21. As someone with a bookmark to `/table/table/`, I want to land on First table at its new address, so that my bookmark keeps working.
22. As someone with a link to `/charts/getting-started/`, I want to land on Installation, so that links from blogs and issues keep working.
23. As someone with an example link such as `/table/table/#basic`, I want to land on the same example at the new address, so that deep links survive the rename too.
24. As a search engine, I want a forwarded address to name its new address as canonical and to be absent from the sitemap, so that the old address is not indexed as a duplicate.
25. As a reader without JavaScript, I want the old address to show a plain link to the new one, so that I am never stranded on an empty page.
26. As a reader using the command palette, I want results grouped under the new rubric names, so that the palette and the sidebar agree.
27. As a reader, I want each rubric's page count in the sidebar to match its pages after the moves, so that the numbers stay true.
28. As a reader on a page, I want the rubric label above its name to show the new rubric, so that the page head agrees with the sidebar.
29. As a reader of the site's front page, I want its lists of pages in the new order and rubrics, so that the front page and the demos tell the same story.
30. As a coding agent reading `llms.txt` and `llms-full.txt`, I want the pages in the new order with their new addresses, so that my index matches the site.
31. As a maintainer, I want the shell suite's probes and the screenshot baselines updated in the same change as the outlines, so that the suite is green at every commit.
32. As a maintainer renaming a page in the future, I want to declare the old id in the outline and get the forward for free, so that no one writes a one-off redirect again.

## Implementation Decisions

- **The outlines are the only source of the tree.** All moves in this spec
  are edits to the five demos' outlines: rubric membership, order inside a
  rubric, rubric order, two new rubrics in core, one rubric removed in
  schedule, and two page ids changed. The sidebar, page heads, palette groups,
  the front page's lists, `llms.txt`/`llms-full.txt` and the sitemap already
  derive from the outline, and nothing else is edited by hand to follow.
- **New rubrics in core:** ids `customising`, `choosing`, `dates-and-times`,
  with the names and sentences given under Solution. Forms' sentence changes
  to *"Where a user types a value or sets one directly on the screen."* Every
  other rubric's sentence stays. The rubric **API index** (id `api-index`) is
  added to the outline by `api-index`, not here. This spec fixes its place:
  last.
- **Theming's place** is first in Customising. Until `theming-and-wording-reference`
  lands, Customising holds Sizes and Language. That spec adds the page in that
  slot and moves nothing else.
- **Page ids that change:** charts `getting-started` → `installation` (name
  "Installation"), table `table` → `first-table` (name unchanged, "First
  table"). Every other page keeps its id, including the schedule's
  `schedule`, which only changes rubric.
- **Examples follow their page.** An example belongs to a page by its folder
  under the demo's examples. The folders of the two renamed pages are renamed
  so that the example ids, and therefore the anchors, stay the same under the
  new page id.
- **The moved-address declaration.** Each demo's outline module exports, next
  to its rubrics, a list of moved page ids: old id → current id. The shared
  outline code takes it as a second, optional input when it builds a demo's
  addresses. Two consumers read it:
  1. **In the app**, resolving a place resolves a moved id to its current
     page and keeps any example anchor. The shell's existing forward step
     already rewrites an old hash address to its path with `replaceState`. It
     rewrites a moved path the same way, so the address bar only ever shows
     the current address.
  2. **In the pages build**, each moved id gets a small static page at its
     old path. It has a canonical link to the current address, an immediate
     forward (meta refresh, zero seconds) to the current address with the
     anchor carried over by a one-line script, the page's title, and a plain
     visible link to the current page for readers without JavaScript. It
     carries `noindex`.
- **The built-site guard accepts forwarders.** Today the guard fails on any
  page file the sitemap misses. It fails instead on any page file that is
  neither in the sitemap nor a declared forwarder. It also checks that every
  declared forwarder exists, points to an address in the sitemap, and is not
  itself in the sitemap.
- **A moved id may not collide.** Declaring an old id that is also a current
  page id, or a current id that does not exist, is an error when the
  addresses are built, with a message naming the id. A rename cannot shadow a
  page or point into nothing.
- **`CONTEXT.md`**, entry **Rubric**, gains one sentence after the order rule:
  when every later page of a rubric uses a page, that page comes right after
  the first, and reading order beats composition order there (`FormField`
  after `Input`). Nothing else in the glossary changes; no new term.
- **Prose that names a rubric** follows the move: page texts, the
  Installation pages, and the README sections that say "under Forms" or name
  "Getting started" for Language. The prose that links `#/sizes` and
  `#/language` keeps working unchanged, because the rubric is not in the
  address.
- **The front page** is built by `site-front-page`, and its lists of pages
  come from the outlines. Whichever of the two specs lands second sees the
  other's result. Neither waits on the other.

## Testing Decisions

- **What a good test is here:** it states what a reader meets (the rubric
  under which a page stands, the order of the sidebar, where an old address
  lands), never how the outline is stored.
- **Seam 1, the built-site guard** (in the pages build, fails the build): each
  forwarder exists at its old path, names the current address as canonical,
  is not in the sitemap, and is the only kind of file the sitemap may miss.
  Prior art: the existing guard that every sitemap address is a file with a
  title, description, canonical and `h1`.
- **Seam 2, the shell suite** (the shared Playwright check every demo's
  `features-shell` spec calls):
  - Opening an old address lands on the renamed page.
  - The address bar ends on the current path.
  - An old address with an example anchor lands on that example, highlighted
    as any jump is.
  - The demos without a moved page pass an empty probe and skip this test.
  - The probes (`rail.rubricId`, `palettePage.rubricName`, the neighbours of
    one rubric) are updated in core, charts, table and schedule to the new
    rubrics.

  Prior art: the existing test that an old hash address is forwarded to its
  path.
- **Seam 3, the tooling unit tests:** building addresses with a moved list
  resolves the old id to the current page and keeps an example. A moved id
  that collides with a current page, or points nowhere, throws with the id in
  its message. Prior art: the tests of the address helpers and the
  prerendered pages in the shell's unit tests.
- **The demos' jsdom smoke tests** keep running every page and every example.
  They cover the renamed folders without change.
- **Screenshots:** pages whose rubric name changes move their `page-*` image
  (the rubric label in the page head), and the two renamed pages move their
  images under the new id. **No `example-*` image may change content.** The
  adopting commit states the before and after count, as `demo-rubrics` ticket
  04 did. A changed example picture is a fault, not a consequence.
- `pnpm lint`, `pnpm typecheck` and `pnpm test:unit` stay green. No file
  under `packages/*/src` is edited.

## Out of Scope

- **Splitting or merging pages.** "One page per component a reader looks up
  by name" holds. `Stack and Grid` stays one page, and so does `Tooltip &
  Legend` in the charts.
- **Renaming rubrics that work.** Feedback, Data display, Overlays,
  Navigation, Typography and Actions keep their names. `demo-rubrics` weighed
  the alternatives in September ("Status and waiting", "Signals"), and nothing
  read since changes that judgement.
- **Collapsible rubrics in the sidebar.** With Forms cut to nine pages, the
  largest rubric fits on a screen. Collapsing would hide what the sidebar
  exists to show.
- **The order of rubrics beyond the insertions above,** such as Typography
  before Layout.
- **Every other address.** Only the two page ids above change. A page that
  only changes rubric keeps its address by construction.
- **The pages Theming and API index themselves:** `theming-and-wording-reference`
  and `api-index`.

## Further Notes

- **Siblings:** `page-orientation` adds previous/next links in outline order
  across rubric boundaries, so that order now shows twice. `one-search` groups
  its results by package and page, not by rubric, and is unaffected.
  `shell-across-packages` scrolls the active sidebar entry into view, which
  matters more once Forms no longer pushes the rest down.
- **Numbers this rests on:** core 54 pages in 9 rubrics, Forms 17; after this
  spec core 54 pages (56 with Theming and API index) in 12 rubrics (13 with
  API index), largest Forms 9. charts 15 pages, table 30, schedule 26,
  calculation 8. Each gains its API index.
- **What this overturns, said plainly:**
  - `demo-rubrics` kept Forms "unchanged, and in today's order". That was
    right while Forms held 13 fields. It now holds 17 and two subjects
    besides fields.
  - `demo-rework` put Language under Getting started. It belongs with Sizes
    and Theming.
  - The charts named their first page differently from the other four
    packages.
  - Nothing in `demo-as-documentation`'s two standing arguments changes: one
    page per component, and no rubric in the address.

**Acceptance:**
- [ ] Sizes stands in Customising, next to Language; Forms holds nine pages.
- [ ] Choosing and Dates and times exist in core with the pages listed.
- [ ] Every rubric listed above has the order given; the order checks against
      the table under Solution page by page.
- [ ] `/charts/getting-started/` and `/table/table/` (with and without an
      example anchor) land on the renamed pages, in the app and as static
      files, and neither is in the sitemap.
- [ ] Schedule has no Findings rubric; First schedule stands in Getting
      started.
- [ ] `CONTEXT.md` **Rubric** carries the reading-order sentence.
- [ ] Shell suite, guard and unit tests green; no `example-*` picture changed.
