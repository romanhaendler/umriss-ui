# 01 - The ADR: the upgrade promise

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/upgrade-promise/spec.md`

## What to build

Record the decision as an ADR in `docs/adr/`. Take the next free number, and add its row to the ADR index.
In ADR-0035, mark the consequence "no deprecated aliases" as superseded in part by the new ADR, and add the
amendment to its status line in the index. Use the text below as the decision, in the house style of the
other ADRs: the question, the alternatives that were real, and the costs.

Then point at it from three places that tell a caller about versions. Each keeps its own few sentences and
links the ADR, and none repeats the ADR:

- **`docs/releasing.md`**: one sentence under "Publishing a version". Ticket 02 rewrites the peer mechanics,
  and ticket 05 the changelog step.
- **The root README's "Maturity"**: rewrite the paragraph to state the promise in one breath: one number,
  peers over the minor, a rename lives one minor and warns, fixes in the latest minor only, TypeScript 5.4.
  Then link the ADR.
- **Each package's `CHANGELOG.md`**: "The numbers" keeps its rule about "Changed". It drops "no number
  promises compatibility" and says instead what the ADR promises, in two sentences, with the link.

No code changes in this ticket.

### Decision text

Title: **The upgrade promise: one number, peers over the minor, a rename lives one minor**

umriss is `0.x` and has been public for about two months: more than fifty releases per package, and minors
0.34 to 0.40 with a "Changed" section in most packages. Nothing told a caller what an upgrade would cost:

- The peers were written `workspace:^`, which pnpm packs as `^<version>`. Table 0.40.4 named core
  `^0.40.4`, so npm refused core 0.40.3 with `ERESOLVE`, although nothing between the two differed for the
  table. Under `0.x` a caret covers patches only, so `npm update` never crossed a minor either.
- The packages have been released together since 0.34, but as a habit of the release mechanics, not as a
  promise.
- ADR-0035 renamed by a hard cut, "no deprecated aliases". Later renames kept an alias for one minor, by
  habit. A caller met silent breaks: a removed token read in an application's own CSS resolved to nothing.
- "Deprecate" meant only `npm deprecate` of a broken version.
- The declarations use `NoInfer`, which needs TypeScript 5.4. That stood nowhere.

**The six packages are released in step under one number. A package of `0.x.y` names its umriss peers as
`^0.x.0`. A renamed prop, export, wording key or token keeps working under its old name for one further
minor, and warns once in development; the minor after that removes it. Every entry under "Changed" carries
a migration line. Fixes go into the latest minor only. TypeScript 5.4 is the floor. 1.0 stays no goal.**

"One further minor" means: the rename lands in minor N with the old name kept, its patches keep it, and
N+1 removes it.

## What follows

- **In step.** A release moves the version of all six packages, a package with no change of its own
  included. There is no table of which version needs which. `check:dist` refuses six versions that differ.
- **Peers.** The manifests write `workspace:^0.<minor>.0`, which pnpm packs as `^0.<minor>.0`. A patch
  release leaves the ranges; a minor release moves them in its release commit. `check:dist` refuses any
  other form.
- **A rename.** The old name carries `@deprecated since 0.<N> - use <new>.`. The editor strikes it through,
  and the props tables and `API.md` list it last. It warns once in development through the package's own
  `warnOnce`.
  - A prop: the component reads the new name, then the old.
  - An export: the old name re-exports the new one.
  - A wording key: the merge copies the old key onto the new one.
  - A token: the old name is declared in the same layer as an alias of the new one, and the library's own
    rules read the old name for that minor. So setting or reading either name works. A development scan
    of the page's stylesheets names an old token that the application's CSS uses.

  `check:dist` refuses a marker older than the package's own minor. The release N+1 therefore cannot go out
  with a name deprecated in N.
- **What cannot keep an old form** is a break: where a ref lands, or a behaviour. It says so under "Changed".
- **The migration line.** Every entry under "Changed" carries an item `Migration:`. It says what a caller
  changes, or that nothing changes and what to look at. `check:dist` refuses an entry without one in the
  section of the version it checks.
- **Support.** A fix is released for the latest minor only. There is no backport branch, and the packages are
  published from `main` alone.
- **TypeScript.** Every README names 5.4 as the floor. `check:dist` compiles its strict consumer under 5.4
  as well as under the workspace's TypeScript. Raising the floor is a "Changed" entry with a migration line.
- **1.0.** Not a goal (roadmap G2). The first digit stays 0, and this promise holds under it. It does not
  anticipate what 1.0 would promise.
- ADR-0035's hard cut stands as history. Its "no deprecated aliases" no longer binds a rename.

## Alternatives that were real

- **Peers `^0.x.y` and the advice to upgrade everything at once.** It was rejected because npm refuses an
  application that is one patch behind on one package, and no code difference justifies that refusal.
- **Peers `>=0.x.0 <1`, or `*`.** It was rejected because a minor may change what a dependent reads from core
  (a context, a token, a type). The range would accept pairings nobody has run.
- **Independent numbers per package, with a compatibility table.** The packages left that behind at 0.34,
  and the table is what it cost.
- **A deprecation window of several minors, or of a time span.** It was rejected because minors come weekly,
  so a time span says nothing. Several minors multiply the aliases in the code. One minor is what the
  releases have done by habit, and an upgrade tested that way showed it workable.
- **Hard cuts, as ADR-0035 had them.** It was rejected because a caller then has to upgrade and migrate in
  one step, and finds silent breaks only at run time.
- **Codemods.** They were not taken now: a migration line per entry costs in proportion to the change.
- **Fixes for older minors.** One maintainer, and publishing from `main`, make a backport line a promise
  that would not be kept.
- **1.0 now.** It was rejected because the surface still moves (the root contract, the alarms package).

## What it costs

- Every minor release moves the umriss peer ranges of four manifests.
- A rename costs two releases, an alias in the code for one minor, and a removal at the next minor. The check
  makes the removal unavoidable, not optional.
- For one minor the library's rules read a token under its old name. A caller who sets the *new* token on an
  element below `:root` sees it take effect only from the removal release. The migration line says so.
- An application on an older minor gets a fix only by moving to the latest minor, "Changed" entries
  included.
- TypeScript below 5.4 is refused, although most of the declarations would compile there.

## Acceptance criteria

- [ ] The ADR stands in `docs/adr/` with the next free number and the decision above, in the ADRs' style.
- [ ] The ADR index lists it. ADR-0035's row, and its consequence about the hard cut, name it as superseding
      "no deprecated aliases" in part.
- [ ] `docs/releasing.md`, the root README's "Maturity" and the six changelogs' "The numbers" point at it,
      and none of them still says that no number promises compatibility.
- [ ] No source, manifest or script changes.
