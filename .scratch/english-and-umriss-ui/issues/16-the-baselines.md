# 16 — The baselines

Status: done
Type: task

Blocked by: 15

Spec: `.scratch/english-and-umriss-ui/spec.md` (Testing Decisions)

## Scope

370 screenshots (core 226, table 118, charts 26). Nearly all of them show text that has changed, so nearly all of them move. **This is the only ticket permitted to move a baseline**, and the way it moves them is the point.

`CONTEXT.md` defines a baseline and states the rule: a moving baseline is either a defect or the purpose, the ticket says which, and *"ein Sammel-Neuaufbau ohne Durchsicht ist in keinem Fall zulässig"* — a bulk rebuild without inspection is never permissible. Here the purpose is the movement, which makes the temptation to run `--update-snapshots` once over everything strongest exactly where the rule matters most: an unreviewed bulk rebuild would silently cement any layout defect the translation introduced. English strings are not German strings — they are shorter or longer, they wrap differently, and a button that now clips its label looks identical to a button that was always fine, in a diff nobody read.

Work **rubric by rubric**, in the demo's own order:

1. Rebuild one rubric's snapshots.
2. Look at every image that moved. Confirm the change is text, not layout: nothing clipped, nothing wrapped that did not wrap, no toolbar pushed into a second row, no truncated accessible name.
3. Record anything that is a real layout defect and fix it in its own commit before continuing — not by adjusting the baseline.
4. Then the next rubric.

Charts first (26 images, least text), then table (118), then core (226).

The accessibility suites (`accessibility.spec.ts` in core and table) run again at the end: the wording change touches accessible names, and a contrast tolerance recorded as a named exception must still state its measurement and reason after translation.

## Acceptance

- `pnpm test:visual` is green across all three packages.
- Every moved baseline was looked at; the ticket records how many moved per rubric and names any that were fixed rather than accepted.
- `pnpm typecheck && pnpm lint && pnpm test:unit && pnpm test:visual` passes from a clean checkout.
- The effort is done: `git grep -nE '[äöüßÄÖÜ]' -- packages docs CONTEXT.md README.md` returns only quotations and the German wording file.

## Inherited: two baselines are already red

`seite-uebersicht-table-hell` and `seite-uebersicht-table-dunkel` were red
before this effort began and are not a consequence of any rename in it. They
were last written by `table-demo`; `table-filters` 07 changed what the
overview page head shows - 11 pages to 12, 41 examples to 46, a new `Filter`
tag, the rubric "Leiste" renamed "Freie Bausteine" - and renewed twenty other
table baselines but not these two.

When this ticket rebuilds the table's rubrics, that image must be checked
against the *current* outline rather than against its predecessor, or the stale
four will be cemented under the heading of "the text changed". See ticket 03's
Finding.

## Moved by ticket 04, and why (rebuild these with the rest)

Four images moved for a reason the effort's plan did not foresee, and they were
deliberately left failing rather than rebuilt outside this ticket:

    seite-tag-ui-hell / seite-tag-ui-dunkel
    seite-stat-ui-hell / seite-stat-ui-dunkel

A page head prints the package's export names - `Seite.tsx` renders
`import { ${ausfuhren.join(", ")} } from "${paket}";` out of the outline's
`ausfuhren`. Renaming a public name therefore changes visible text on the page
that names it. `tag` shows `TagGruppe` -> `TagGroup`, `stat` shows
`useAktualitaet` -> `useFreshness`.

The purpose is the movement, so these are accepted rather than fixed - but the
check still applies when you rebuild them: the import line is longer than it
was, so confirm it does not wrap or clip in either theme before you accept the
image.

Expect every other page head to move for the same reason once tickets 07, 08,
10 and 12 rename the remaining exports: there is one such image per page per
theme, and the import line is on all of them.

## Run the visual suite ALONE - it cannot share the machine

Found while running this effort, and it cost a wasted 40-minute run plus a
false alarm of 333 failures on a commit that was in fact green.

`playwright.config.ts` starts its three demo servers on FIXED ports - 4173
core, 4174 charts, 4175 table - with `reuseExistingServer: !process.env.CI`.
That flag means: if anything is already listening on those ports, Playwright
does not start its own server, it ATTACHES to the foreign one. So a second
checkout of this repository building or previewing a demo at the same time -
another worktree, another agent, a `pnpm dev` left open - silently serves its
own, possibly half-renamed, demo into this suite. The failures that produces
look like real regressions, including behavioural ones in
`funktionen-basis.spec.ts` and `funktionen-baum.spec.ts`, and they are not.

Two symptoms that identify it rather than a genuine break:
- the run takes far longer than the usual ~3 minutes (it took 40.7);
- interaction tests fail, not just screenshot comparisons. A rename moves
  pixels; it does not stop Escape from closing a modal.

The suite is also the memory peak of this repository: three Vite builds plus
Chromium. A background verification was killed outright for low memory while
four worktrees each held a 193 MB `node_modules`.

So, for this ticket: before every run, make sure nothing else in this
repository is building, serving or testing, and that no other worktree holds
installed dependencies you do not need. `pgrep -fl "vite preview"` answers the
first question in one line.

## Two things must be done before the suite is run

Both were created by earlier tickets and both would read as a baseline problem
while being nothing of the kind.

**1. Stale selector strings in six visual specs.** Ticket 10 translated the core
demo's page ids, titles, rubric names and visible text. Ticket 09 rewrote the
specs that select on them but, correctly, left their string literals alone — a
rename pass may not touch a string, and it could not verify a value it could not
see. So these still name things that no longer exist: `funktionen-huelle`
(`"laden-und-sperre"`, `"Laden und Sperre"`, `"betrieb"`, `"Struktur"`),
`funktionen-seite`, `funktionen-basis` (four `openExample` anchors),
`funktionen-baum` (~25 German data names), `funktionen-dock` and `screenshots`
(`"vorfuehrung"`, `"befehle"`, `"Palette öffnen"`).

These fail as **behaviour**, not as pixels. That matters, because the symptom is
indistinguishable from the port-contention false alarm above: interaction tests
failing rather than screenshots. Reconcile them against the merged tree first,
then run the suite, or the run cannot be read.

**2. Three transitional accommodations in ticket 05's shell.** Ticket 10 could
not rename `packages/core/demo/beispiele/` without breaking the table's demo,
which was still German at the time, so it widened three things in the shared
shell and commented each: `EXAMPLE_PATTERN` accepts `beispiele|examples`,
`ExampleModule` accepts `title` beside `titel`, and `withoutTitle` strips either
spelling. Once ticket 12 has landed, all three are dead code that quietly
tolerates the very thing this effort removed. Delete them and confirm both demos
still mount.

### The stale selectors, located

Run after ticket 09 landed, so these are exact:

- `features-dock.spec.ts:18` and `:271` — `openExample(page, "dock", "vorfuehrung")`
- `features-page.spec.ts:11` — `examples: ["varianten", "groessen", "laden-und-sperre"]`
- `features-shell.spec.ts:10` — `rubricId: "betrieb"`; `:16` — `id: "laden-und-sperre"`,
  `title: "Laden und Sperre"`; `:17` — `rubricName: "Struktur"`
- `features-tree.spec.ts:19`, `:20`, `:23` — `"vorfuehrung"`, and the file carries
  about thirty further lines of German tree data
- `screenshots.spec.ts:59` (comment), `:87` — `"befehle"`; `:88` —
  `getByRole("button", { name: "Palette öffnen" })`

Also stale, and cheaper to fix in the same pass: comments naming spec files that
ticket 09 renamed — `packages/core/tests-visual/features-basics.spec.ts:21`,
`packages/demo/checks/page.ts:13`, `packages/demo/checks/shell.ts:8`,
`packages/table/tests-visual/features-table.spec.ts:2` and `:128`,
`packages/table/tests-visual/features-virtual.spec.ts:2`. Each names a
`funktionen-*.spec.ts` that no longer exists.

## The inventory, counted

Taken after ticket 13 landed. 370 baselines: **core 226, charts 26, table 118.**

**342 of the 370 filenames carry a German word.** That is not a handful to fix —
it is almost all of them, and it changes what this ticket is. A baseline's name
is built from its test title and the example's anchor, so a file is called
`beispiel-button--laden-und-sperre-ui-hell-ui-hell-darwin.png`. Tickets 09 and 10
translated the titles and the anchors; the files on disk still carry the old
ones. So after regenerating, the old files are **orphans, not files that moved** —
exactly what ticket 06 reported for its 26.

**The check that catches an orphan is the count, not the eye.** Regenerating
writes the new names; it does not remove the old ones. So after the run the total
must be exactly 370 again, per package 226 / 26 / 118. Anything above that is a
stale file to delete, and `git status` names them: new ones appear untracked, old
ones stay tracked and unmodified.

## `hell` and `dunkel`: the reason to keep them expires in this ticket

Every filename carries its Playwright project name **twice** — `ui-hell` 113
files, `ui-dunkel` 113, `table-hell` 59, `table-dunkel` 59, `charts-hell` 13,
`charts-dunkel` 13, which is exactly 370. That doubling was the whole argument
for leaving the project names German: renaming `ui-hell` to `ui-light` would
rewrite every snapshot filename in the workspace.

But this ticket rewrites every snapshot filename in the workspace. The cost the
exception was protecting against is **zero for exactly the length of this
ticket**, and non-zero again the moment it closes — and `hell`/`dunkel` would
otherwise be the largest single surface of German left in the repository, in 370
filenames and in `playwright.config.ts`.

So decide it here rather than inheriting it: rename the six projects to
`ui-light`/`ui-dark`, `table-light`/`table-dark`, `charts-light`/`charts-dark`
in `playwright.config.ts` **before** the regenerating run, so the new names are
written correctly the first time and no file is touched twice. Check afterwards
that no `hell` or `dunkel` remains under any `-snapshots/` directory.

### Where the German baseline names actually come from

One line, not 342 decisions: `packages/core/tests-visual/screenshots.spec.ts:52`
builds every example's baseline name as

```ts
await expect(target).toHaveScreenshot(`beispiel-${name}-${testInfo.project.name}.png`);
```

and the table's `screenshots.spec.ts` does the same. That literal `beispiel-`
prefix, plus the German page ids and anchors in `${name}`, plus the project name
`ui-hell` / `ui-dunkel`, is the whole of why 342 of the 370 filenames are German.

So the rename is three edits made **before** the regenerating run, not a sweep
over the files afterwards: the prefix here, the six project names in
`playwright.config.ts`, and nothing else. Then regenerate, then check the count
comes back to exactly 370 (226 / 26 / 118) and delete whatever is left over.

### Eight baselines will keep a German word, and that is correct

After the regeneration, `packages/core/tests-visual/screenshots.spec.ts-snapshots/`
will contain

```
dock-oben-ui-light-darwin.png      dock-oben-ui-dark-darwin.png
dock-rechts-…  dock-unten-…  dock-links-…
```

because the name is built as `dock-${place}` and `Place` is the **public API**
type of `@umriss-ui/core`: `"oben" | "rechts" | "unten" | "links"`. Ticket 07 kept
those four literals deliberately — they are values a caller writes
(`defaultPlace="unten"`), not prose, and the demo and both suites pass them
through.

So the check at the end of this ticket is "no German **except** these eight", and
the right response to seeing them is to leave them alone. Renaming them is a
public API change and belongs to a ticket that says so, with the four literals,
the `Place` type, the demo, the CSS and the suites moving together.

Everything else in a regenerated filename should be English: the prefixes
`page-`, `example-`, `palette-window`, `palette-resting`, and the project names
`ui-light`/`ui-dark`, `charts-light`/`charts-dark`, `table-light`/`table-dark`.

## The suite is green but for one test, and that one predates this effort

Final run: **569 passed, 148 skipped, 1 failed.**

The failure is `packages/table/tests-visual/features-virtual.spec.ts:44`, "the
scrollbar measures the full set". It asserts

```ts
expect(Math.abs(scrollHeight - 20_000 * rowHeight)).toBeLessThan(200);
```

and receives **29942** — the same number in all three runs, before and after every
selector fix, so it is deterministic and not a flake.

**Why it is not this effort's doing**, checked rather than assumed:

- In the last commit before this effort, the example already declared
  `virtuell: { zeilenHoehe: 37 }` over `erzeuge(20_000)`.
- `.td` in `Table.module.css` is byte-identical before and after — padding,
  border and font-weight unchanged. Ticket 11's hunks there are pure renames
  (`.huelle` → `.frame`), with the `font-size` lines moved, not altered.
- The only commits touching this spec since are renames of selectors, data
  attributes and demo ids. None touched line 44 or its arithmetic.

**What it looks like.** 29942 ≈ 20 000 × 1.5, i.e. a per-row discrepancy of about
1.5 px. `lib/virtual.ts` computes the filler heights straight from the option —
`vorher: von * zeilenHoehe`, `nachher: (anzahl - bis) * zeilenHoehe` — so the
scroll area is sized from 37 while the rendered row measures nearer 38.5. The
example's own header says `zeilenHoehe` "is the initial value; it is re-measured
at the first row", and that re-measurement does not reach the filler arithmetic.

**Left failing on purpose.** The tolerance is the assertion: widening it until the
test passes would remove the only thing that noticed. It wants its own ticket —
either the fillers read the measured height, or the guarantee is restated to be
about the option.

One flake was also seen and is recorded rather than chased:
`features-virtual.spec.ts:173` failed once under parallel load and passed in the
runs either side of it, with nothing touching it in between.

### Correction: the second virtualisation failure is not a flake

Recorded earlier in this ticket as "one flake was also seen". The evidence across
five runs says something more specific, and the earlier wording waved it away.

| run | mode | total failed | `:44` scrollbar | `:173` selection |
|---|---|---|---|---|
| 1 | update | 35 | FAILED | passed |
| 2 | update | 3 | FAILED | FAILED |
| 3 | plain | 1 | FAILED | passed |
| 4 | update | 1 | FAILED | passed |
| 5 | plain | 2 | FAILED | FAILED |

`features-virtual.spec.ts:44` fails in **every** run with the identical 29942.
`:173` fails in **two of five**, and both times with the same reason:
`[data-row="2"]` expected 0, received 1, after `el.scrollTop = el.scrollHeight`.

**They are probably one fault, not two.** If the scroll area is sized from
`zeilenHoehe: 37` while the rendered row measures nearer 38.5 — which is exactly
what `:44` measures — then scrolling to `scrollHeight` stops about 30 000 px short
of the true bottom, and whether row 2 has left the window at that point depends on
rounding. That would make `:44` the deterministic symptom and `:173` the
intermittent one, of a single pre-existing cause.

Both belong to the follow-up ticket recorded above. Neither was caused by this
effort: the example declared the same row height over the same row count
before it, and `.td` is byte-identical before and after.

A note on how the first tally was got wrong, since it matters for whoever checks
this: grepping a Playwright log for a test's path counts **passes too**, because
the list reporter prints the path for every test it runs. A tally has to come from
the numbered failure block (`^\s+[0-9]+\) \[`) and should reconcile against the
run's own "N failed" line.
