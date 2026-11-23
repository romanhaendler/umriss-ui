# The releases up to 1.0

Type:   grilling
Status: resolved

## Question

Everything that changes before 1.0 is decided: the answers of the nine decisions and the "(agent)" lists in
them and in the reviews. How is it cut into specs, and in which releases does it go out?

- **How many minors carry breaks**, and which break goes into which. Each is a step the maintainer's
  applications migrate through. Fixed already: a theme that crosses packages lands in one minor (density's
  word; the table's model with the alarms; `aria-label` or `aria-labelledby` on charts and the schedule), and
  a rename needs the minor after it to drop the old name, so the last breaking minor is not the candidate.
- **What comes first.** The generator of `API.md` (it is the list of the surface, and every later change is
  read from it); `check:dist` and the manifests for `1.x`; the `@experimental` marker.
- **What needs no break and can ride with any release**: the "(agent)" lists, the documents, the demos'
  missing examples, CI running three browsers, axe on every page.
- **What waits for the candidate**: the muted text's screenshots, the VoiceOver pass, the look through the
  demos, the small shakedown, the guide, the two tickets only the maintainer can close.
- **The specs**: one per package, one per theme, or one per release; each ready for `/to-tickets`.

The answer is the list of specs with their release, in order, each naming the decisions it takes from. With
it the map has reached its destination.

## Answer

The maintainer answered four questions (2026-11-23).

One sentence of the question above was wrong: the last minor with breaks *is* the candidate. ADR-0066 has
the minor after a rename drop the old name, and that next step is `1.0.0` itself.

### Three releases

1. **`0.57.0`, no break.** Everything that breaks no caller.
2. **`0.58.0`, the candidate.** Every decided break, in one minor across all packages: one move for an
   application, which the old names let it make step by step. After it the surface is frozen; what the
   acceptance turns up goes out as `0.58.x`. It is built spec by spec onto `main` and released when all of it
   is in.
3. **`1.0.0`.** Drops the old names and the texts that say `0.x`, nothing else.

### Ten specs

Each takes its content from the answers named; `/to-spec` writes it, `/to-tickets` cuts it.

For `0.57.0`:

| # | Spec | Takes from |
|---|---|---|
| 1 | **`API.md` lists the surface**: components a hook returns, members written as methods, the members of unions, `@experimental` apart, the glyphs' defaults; a guard that an ADR's status stands once | "The documents agree with the source", "What 1.0 promises" |
| 2 | **Ready for `1.x`**: `check:dist` for the peer form, the deprecation marker and the changelog's sections; `engines`; React `^19`; the browser floors derived from the source; `SECURITY.md`; the sentence on right-to-left | "What the packages ship", "What 1.0 promises", "The acceptance criteria" |
| 3 | **Browsers and axe in CI**: the `@quick` checks in three engines, axe on every demo page | "The acceptance criteria" |
| 4 | **The documents set right**: counts, the glossary's two stale entries, `SKILL.md`, the amendments of ADR-0045 and ADR-0019, comments that cite tickets, `.scratch/` cleared | "The documents agree with the source", "What `.scratch` still holds", "What of the tokens and the wording changes before 1.0" |
| 5 | **Fixes without a break**: the "(agent)" lists of every decision and the missing examples, one ticket per package | all nine decisions, "What the demos leave unfinished", "Which keyboard items of the shakedowns still stand" |

For `0.58.0`:

| # | Spec | Takes from |
|---|---|---|
| 6 | **Core, tokens and wording**, with the muted text at 4.5:1 and density's word in every package | "What of core's surface changes before 1.0", "What of the tokens and the wording changes before 1.0", "The acceptance criteria" |
| 7 | **The table**, with the model `@experimental` in the table and the alarms | "What of the table's surface changes before 1.0" |
| 8 | **Charts** | "What of the charts' surface changes before 1.0" |
| 9 | **The schedule**, with lead-in and lead-out by keyboard | "What of the schedule's surface changes before 1.0" |
| 10 | **The young packages** | "What of the young packages' surface changes before 1.0" |

After `0.58.0` no spec but a list: the acceptance on the candidate ("The acceptance criteria": the guide from
`0.56.0`, screenshots of every demo page for the maintainer, the VoiceOver list, the small shakedown, the
four keyboard items that need a run), then `1.0.0`.

### Fixed with it

- **The muted text goes into `0.58.0`**; the maintainer sees before and after before it reaches `main`.
- *(agent)* **Order of building**: the generator first, since every later change is read from `API.md`; in
  `0.58.0` core before the others, which follow density's word and `Wording`'s shape.
- **This map and ADR-0083 go to `main`**, so that every later session reads the decisions.
