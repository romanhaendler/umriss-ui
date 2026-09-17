# 03 — The prose and the suites follow

Status: done
Type: task

Blocked by: 02

Spec: `.scratch/demo-rubrics/spec.md`

## Scope

Four places name core's rubrics and would otherwise be half true:

- **`packages/core/tests-visual/features-shell.spec.ts`** — `rail.rubricId` and
  `palettePage.rubricName`. Both must name a rubric that exists, and `rail` must
  name one whose id does **not** appear in the address (that is what the shared
  test asserts).
- **`CONTEXT.md`, under Rubric** — the list of the three demos' rubrics, which
  `demo-consolidation` 03 and 09 last corrected. It gains core's new set.
- **`CONTEXT.md`, under Rubric** — one added sentence: a rubric sorts, and
  within a rubric the pages run from the simple to the composed. The rule exists
  only in this spec today, which is the one place a person editing the outline
  will not look.
- **`docs/testing.md`** — the opening paragraph counts "forty pages in four
  rubrics" for core.

## Acceptance

- `grep -rn "Foundation\|Structure and overlays" --exclude-dir=.scratch` finds
  nothing.
- `pnpm test:visual --project=ui-light -g "sidebar"` passes.
- `CONTEXT.md` names the new rubrics and the order rule.

## Comments

**Delivered — three of the four places needed an edit, and the fourth turned out
to be true already.**

- **`packages/core/tests-visual/features-shell.spec.ts`.** `palettePage.rubricName`
  is `"Navigation and structure"` (the query is `treeview`, and `TreeView` now
  stands there). `rail` is unchanged — `Meter` under `monitoring`, whose id still
  does not occur in `#/meter`, which is what the shared suite asserts. One probe
  the ticket did not name had to move with them: **`neighbours` promises *two
  pages of the same rubric*** and stood at `Tabs` and `Menu`, which the new cut
  puts in different rubrics. It is now `Tabs` and `TreeView`, both under
  `Navigation and structure` — and it matches the `palettePage` probe, so the two
  tests that use it exercise one rubric between them. `chip` (`Tabs`, absent
  `button` and `dock`) needed nothing: it asserts which page blocks are in the
  document, not which rubric they come from.
- **`CONTEXT.md`, the rubric list.** Core's eight are named with their ids, with
  one clause on what the regrouping did. The `Ebene`/`Level` argument that hung on
  "Structure and overlays" now hangs on **Overlays**, which is where it belongs,
  and a second sentence records why **Status and waiting** is not "State"
  (ADR-0007) — the collision was stated in the spec and nowhere a later editor
  would look.
- **`CONTEXT.md`, the order rule.** Added to the **Rubric** entry itself: the
  order inside a rubric is part of the sorting, simple before composed, and not
  the order of delivery — *"which is how a sidebar quietly becomes a list of
  arrivals"*.
- **`docs/testing.md` needed no edit.** The ticket expected the opening paragraph
  to count *"forty pages in four rubrics"*. It does not: since `docs-structure` it
  reads *"forty pages in core, fourteen in charts, twelve in table"* and counts no
  rubrics at all. Forty pages is still forty, so the sentence is true as it
  stands; adding a rubric count would be a second number to keep in step for no
  reader's benefit.

**On the acceptance grep — the criterion is knowingly unmet, and this note
first inventoried the hits wrongly.** Run outside `.scratch/`, `grep -rn
"Foundation\|Structure and overlays"` returns:

- **`docs/journal.md:215`** — an entry of `english-and-umriss-ui` 37 calling
  `UmrissProvider` *"the first in the Foundation rubric"*.
- **`.agents/skills/teach/RESOURCES-FORMAT.md:13`** — *"Found**ational** text on
  programming"*, an unrelated false positive of the pattern.
- **`docs/journal.md`, the entry this work added** — it names both retired
  rubrics in saying what was retired, which is the point of a journal entry.
- **`packages/core/demo/outline.ts`, the head comment** — it names `Foundation`
  and `Structure and overlays` as the shapes this cut retired, to say what the
  remaining three "and" names are *not*. Added by the review pass, deliberately.

An earlier version of this note claimed "two lines, both in `docs/journal.md`"
and named as the second an August inventory reading *"thirty-nine pages in four
rubrics"* (`docs/journal.md:381`). That line contains neither search word and is
not a hit at all; the count was right by accident and the inventory was wrong.

The journal hits are left standing **deliberately**: the journal is the dated
record of what was worked on and when (`docs/README.md`), and those sentences
were true on the day they were written. Editing them would not correct a stale
claim, it would falsify a log.

**What the criterion was really protecting holds:** no rubric list, no page
head, no palette find and no test probe carries a retired name. Where the two
names still stand — in the journal and in the outline's head comment — they
stand as history, naming what was replaced rather than claiming it is still
there. A grep for a retired name is therefore the wrong check, and this is the
shape the next effort should expect: retiring a name multiplies its mentions
before it removes them.

### Addendum: a fifth place named the rubrics, and only a browser could find it

The ticket named four places. There was a fifth, and it cost the first
verification run a red test: **`pointer` in the same `checkShell` call**, which
stood at `{ wide: "ta", narrow: "tag" }`.

**Why a regrouping reaches it at all.** `find()` in `packages/core/src/lib/search.ts`
searches a candidate's **name** first and its **group** as a fallback — and the
group of a page *is its rubric name* (`Shell.tsx`, `paletteCandidates`). Renaming
the rubrics therefore changes which candidates a query matches. Under the old
names, `"ta"` pulled in all eleven pages of "S**t**ructure **a**nd overlays" by
group; under the new ones it pulls "Layou**t** **a**nd text",
"Sta**t**us **a**nd waiting" and "Naviga**t**ion **a**nd structure" — a different
set, in a different order.

**What broke, precisely.** The test hovers the fourth row, types the narrower
query, and asserts the mark falls back to the first row. That only holds when the
hovered row *drops out*: `activeId` (CommandPalette.tsx, line 196) is derived —
the held candidate keeps the mark while it is still in the list, and the mark
falls to the first only when it is not. Under the new order the fourth row for
`"ta"` is the example **`Mono, tracking and links`**, which carries t-a-g and
survives `"tag"`. The mark stayed on it, which is correct behaviour, and the test
read it as the defect it exists to guard.

**No component behaviour changed, and none was changed to suit the test.** The
probe now reads `{ wide: "ta", narrow: "tab" }`: 78 finds become 15, the fourth
row does not survive, and the first find is `Tabs`. The pair was chosen by
computing `find()` over the real candidate list offline rather than by trying
queries in a browser. The comment above the probe records why the old pair
stopped working, so the next regrouping does not have to rediscover that the
matcher searches rubric names.

`pnpm test:visual --project=ui-light packages/core/tests-visual/features-shell.spec.ts`:
18 passed.
