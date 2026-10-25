# The upgrade promise: one number, peers over the minor, a rename lives one minor

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "The upgrade promise" (its Answer holds every
decision below that is not marked *(agent)*); findings `.scratch/shakedown/cross-package.md` 7 and 12,
`audit-family.md` "Upgrade risk", `upgrade.md`; ADR-0035 (its "no deprecated aliases" is superseded in part).

## Problem Statement

Someone who upgrades umriss does not know what the upgrade costs, and the packages do not promise anything.

- **Peers refuse a patch.** Each dependent names its umriss peers as `workspace:^`, which pnpm packs as
  `^<version>`. Table 0.40.4 named core `^0.40.4`, so npm refused core 0.40.3 with `ERESOLVE`, although
  nothing between the two differed for the table. Under `0.x` a caret covers patches only, so
  `npm update` never crosses a minor either.
- **Release in step is a habit, not a promise.** The six packages share one number since 0.34. That stands in
  the release mechanics and in the changelog preambles, but nothing tells a caller they may rely on it.
- **No deprecation policy.** ADR-0035 renamed by a hard cut "with no deprecated aliases". Later renames kept
  an alias for one minor by habit. A caller met silent breaks: a removed token read in the application's
  own CSS resolved to nothing. The release document names deprecation only as `npm deprecate` for a broken
  version.
- **No support window.** Nothing says whether a fix reaches an older minor.
- **No migration rule.** "Changed" entries carry hints, inconsistently. ADR-0035 promised "a migration table
  in each changelog", and no changelog has one.
- **No TypeScript floor.** The declarations of charts, table and dashboard use `NoInfer`, which needs
  TypeScript 5.4. That stands nowhere; TypeScript 5.0 reports about 21 errors.

## Solution

One ADR, "The upgrade promise", and the checks that hold it:

- **The six packages always release in step**, one version for all, and `docs/releasing.md` says so and points
  at the ADR.
- **Peers cover the minor.** A package of `0.x.y` names its umriss peers as `^0.x.0`. A peer one patch behind
  is accepted. `check:dist` refuses six versions that differ, and a peer range of any other form.
- **A rename keeps its old name for one further minor.** A renamed prop, export, wording key or token keeps
  working under its old name in the minor that renames it. It is marked deprecated (the editor strikes it
  through), and it warns once in development. The next minor removes it. `check:dist` refuses a deprecation
  older than the package's own minor, so that next release cannot go out with it.
- **Every entry under "Changed" carries a migration line.** `check:dist` refuses an entry without one in the
  section of the version it checks.
- **Fixes go into the latest minor only.** 1.0 stays no goal (roadmap G2), and this policy does not change
  that.
- **TypeScript 5.4 is the stated floor**, named in every README. `check:dist` compiles its strict consumer
  under TypeScript 5.4 as well.

## User Stories

1. As an application developer, I want every umriss package I install to accept the others at any patch of
   the same minor, so that npm does not refuse an install over a difference that changes nothing.
2. As an application developer, I want to know that all six packages always carry the same number, so that I
   upgrade them in one command and never look up which version needs which.
3. As an application developer, I want `npm update` to bring me the latest patch of my minor for every
   package, so that fixes reach me without a manual bump.
4. As an application developer, I want a renamed prop to keep working for one minor, so that I can upgrade
   first and migrate after.
5. As an application developer, I want one development warning per renamed name I still use, naming the new
   name, so that I find every place to migrate without reading the whole changelog.
6. As an application developer, I want that warning to stay out of my production build, so that my users
   never see it.
7. As a TypeScript developer, I want a deprecated name struck through in my editor, so that I see the
   migration while I type.
8. As an application developer who passes my own wording, I want a renamed wording key to keep working for one
   minor, so that my translation does not silently fall back to English.
9. As an application developer whose CSS reads or sets a umriss token, I want a renamed token to keep working
   for one minor and to be warned about in development, so that my colours do not silently resolve to
   nothing.
10. As an application developer, I want every "Changed" entry to tell me what I change, or that I change
    nothing and what to look at, so that an upgrade is a list I work through.
11. As an application developer, I want to know that a fix only ships for the latest minor, so that I plan
    to stay on it rather than wait for a backport.
12. As an application developer, I want each README to name TypeScript 5.4 as the floor, so that I know
    before installing whether my project compiles the declarations.
13. As an application developer on an older TypeScript, I want the README to say why 5.4 (`NoInfer`), so
    that I know the floor is real and not a guess.
14. As a team lead weighing umriss, I want the promise written in one place, so that I can judge the upgrade
    cost before adopting a `0.x` library.
15. As the maintainer, I want `check:dist` to fail when the six versions differ, so that a release cannot
    leave one package behind.
16. As the maintainer, I want `check:dist` to fail when a peer range is not `^0.<minor>.0` of the version
    released, so that a minor release cannot forget to move them.
17. As the maintainer, I want `check:dist` to fail when a deprecation from an earlier minor is still in the
    source, so that a removal cannot be forgotten.
18. As the maintainer, I want `check:dist` to fail when a "Changed" entry has no migration line, so that the
    rule holds without my memory.
19. As the maintainer, I want `check:dist` to compile the strict consumer under TypeScript 5.4, so that a
    declaration that needs a newer TypeScript cannot slip into a release.
20. As a contributor renaming something, I want one recipe per kind of name (prop, export, wording key, token),
    so that every rename keeps its old name the same way.
21. As a coding agent reading the props table or `API.md`, I want a deprecated prop listed as deprecated
    with its replacement, so that I write the new name.
22. As the maintainer, I want ADR-0035's "no deprecated aliases" marked superseded in part, so that no reader
    takes the hard cut as today's rule.

## Implementation Decisions

- **ADR.** One new ADR, "The upgrade promise", written as the first ticket, with the next free number. It
  supersedes ADR-0035's "no deprecated aliases" in part: the hard cut stands as history. The release
  document, the root README's "Maturity" and each changelog's preamble point at it.
- **"One further minor".** A rename lands in minor N with the old name kept. Minor N+1 removes it. Patches of
  N keep it.
- **In step.** Every release moves the version of all six packages, as since 0.34. `check:dist` reads the
  six public manifests of the workspace and refuses unequal versions.
- **Peer ranges** *(agent: the exact form)*. Each umriss peer is written `workspace:^0.<minor>.0` in the
  manifest. pnpm packs it as `^0.<minor>.0`; this was tried with pnpm 9.14.4. A patch release leaves the
  ranges as they are. A minor release moves them in the release commit. pnpm keeps peers out of the
  lockfile, so the lockfile does not change. `check:dist` refuses an umriss peer of any other form. The
  devDependencies stay `workspace:*`.
- **The deprecation marker** *(agent)*. The old name carries `@deprecated since 0.<N> - use <new>.`:
  - in JSDoc for a prop, an export or a wording key;
  - as a CSS comment on the alias line for a token.

  TypeScript strikes a JSDoc-deprecated name through. The props tables and `API.md` already list a
  deprecated row last, with its sentence. A deprecated prop goes into the package's list of unshown props
  under its existing category "(g) deprecated alias".
- **The deprecation check** *(agent)*. `check:dist` scans the package's source (`.ts`, `.tsx`, `.css`) for
  `@deprecated`. Every marker must name `since 0.<N>`, and N must be the package's own minor or the next
  one. A marker from an earlier minor fails, named with its file and line. So the release of N+1 cannot go
  out while a name deprecated in N stands.
- **The development warning** *(agent)*. Each package keeps its own `dev.ts` with its own `warnOnce`, and
  no helper is shared (decided by `.scratch/dev-warnings/`). Beside `warnOnce`, each development module gains
  `warnDeprecated(old, replacement)`. It is one line over that package's `warnOnce`, keyed `deprecated:<old>`,
  so the wording stands once per package:
  `@umriss-ui/<pkg>: <old> is deprecated and goes in the next minor release; use <replacement>.`
  - Core's module today holds only `isDev`. It gains a `warnOnce` by table's rule, unless
    `.scratch/dev-warnings/` has added one by then.
  - Schedule and dashboard have no development module. Each gets one, a copy of table's, with its first
    warning. Calculation gets its own from `.scratch/dev-warnings/`.
- **Per kind of name** *(agent)*:
  - **Prop**: the component reads `new ?? old`, and calls `warnDeprecated` when the old one is given.
  - **Export** (a component, hook, type or constant): the old name is re-exported as the new one, with the
    JSDoc marker. A value export warns on its first use where it can (a component or hook on render); a type
    cannot warn and is marked only.
  - **Wording key**: the package's wording merge copies an old key onto the new one when the new one is not
    given, and warns.
  - **Token**: the old name is declared in the same tokens layer as `--u-<old>: var(--u-<new>)`, and the
    library's own rules go on reading the old name for that minor. So setting either name and reading either
    name works, without a cycle. The removal release moves the rules to the new name and drops the alias.
    The development warning comes from a scan of the page's stylesheets: once per page, it names an old token
    that a rule outside the umriss layers sets or reads. The scan exists in core and charts, the two packages
    that declare tokens. Each component whose rules read a deprecated token calls it on its first render in
    development; the once-flag makes many callers one scan.
  - **What cannot keep an old form** (where a ref lands, a behaviour) is a break. It says so under "Changed"
    with its migration line.
- **The migration line** *(agent: its form)*. Every top-level entry under `### Changed` carries a nested item
  that begins `Migration:`. It says what a caller changes, or that nothing changes and what to look at.
  - A rename's entry names the old name, the new one, and the release that removes the old one.
  - The removal's entry names what replaces it.
  - The rule stands in the release document's changelog step.
- **The changelog check** *(agent: where)*. `check:dist` reads the package's `CHANGELOG.md`, which is packed:
  - it requires a heading for the package's own version;
  - every top-level entry under "Changed" in that section must carry a `Migration:` item.

  `pnpm changelog` stays a draft printer. It prints commit subjects before the changelog is written, so it
  has nothing to check. The ticket that adds the check gives the current version's "Changed" entries their
  migration lines, so that the check is green from the start.
- **Support.** Fixes go into the latest minor only. There is no backport branch, and the publish workflow
  runs from `main` only. It stands in the ADR and the release document.
- **TypeScript floor** *(agent: the check's mechanics)*.
  - The root's devDependencies gain TypeScript 5.4 under an alias (`typescript-floor`, `npm:typescript@~5.4.5`).
  - `check:dist`'s strict consumer compiles under the workspace's TypeScript and under the floor, both
    resolutions. Under the floor it drops `noUncheckedSideEffectImports`, which exists only from 5.6.
  - It keeps `skipLibCheck: false`, because with `skipLibCheck` an unknown `NoInfer` in a declaration file
    passes silently.
  - If a future `@types/react` breaks under 5.4, the check names it. Raising the floor is then a decision
    with its own "Changed" entry.
  - Every README's Install section names "TypeScript 5.4 or newer (the declarations use `NoInfer`)" beside
    the React line.
- **1.0.** No goal. The first digit stays 0, and the promise above holds under it.

## Testing Decisions

- A good test here fails the way a release would go wrong, and names what to fix. It never asserts on the
  wording of a whole document. It checks one structural rule, such as a range's form, a marker's minor or
  a `Migration:` item.
- The seam is `check:dist`, which every package runs after its build: in CI, in the publish workflow before
  each package, and in `prepublishOnly`. Every check of this spec goes there; no new seam is added. The
  prior art is its existing assertions (the directive on every entry, the packed documentation naming no
  site, the strict consumer compile under two resolutions).
- Each new assertion is proved red once by hand while building it, and the ticket says how:
  - a planted unequal version;
  - a `workspace:^` peer;
  - a marker from an earlier minor;
  - a "Changed" entry without its line;
  - a declaration of charts compiled under 5.3, which reports `NoInfer` as unknown.
- `warnDeprecated` and the stylesheet scan are tested in each package's unit tests, in jsdom:
  - once per name;
  - silent under `NODE_ENV=production`;
  - the fixed wording;
  - for the scan, a `<style>` the test adds, and a umriss-layered rule that it must ignore.

  The prior art is the existing development-mode tests that spy on `console.warn`.

## Out of Scope

- 1.0, or any promise beyond `0.x` (roadmap G2).
- Backports, a support branch, or an LTS line.
- Codemods or an upgrade guide beyond the migration lines.
- Independent version numbers per package, or a compatibility table.
- Any actual rename. The first users of the mechanism are the root contract's `ariaLabel` alias and the
  schedule's handle bridge (`.scratch/root-contract/`).
- A shared warning helper across the packages (`.scratch/dev-warnings/` decided against one).
- Development warnings for silent behaviour changes that are not renames (`.scratch/dev-warnings/`).
- Detecting an old token in an inline `style` attribute or in a cross-origin stylesheet. The scan reads the
  stylesheets it may read, and the migration line covers the rest.
- A CONTEXT.md term for the promise. The coordinating session adds one if it wants it.

## Further Notes

- **Tried 2026-10-25** in a throwaway directory:
  - pnpm 9.14.4 packs a peer `workspace:^0.41.0` as `^0.41.0`, and records no peer in the lockfile.
  - The built declarations of core and charts (0.41.1), under a strict consumer with `skipLibCheck: false`
    and `@types/react` 19.3, compile under TypeScript 5.4.5.
  - Under 5.3.3, charts reports three TS2304 "Cannot find name 'NoInfer'" and core is clean.
  - `@types/react` 19.3 declares `typeScriptVersion` 5.6, but compiles under 5.4.5 today.
- **Shared file.** Tickets 02, 03, 05 and 06 each add an assertion to `check-dist`, and so does
  `.scratch/test-runners/` ticket 02 (the runner step). Each assertion is a separate block; whichever lands
  second rebases.
- **Root contract.** Its spec says that a deprecation-mechanism ticket here blocks its tickets 03 to 06.
  That ticket is `03-a-renamed-prop-export-or-wording-key-keeps-its-old-name-for-one-minor.md`. Its removal
  ticket (10) is what this spec's deprecation check enforces at the next minor.
- **Dev warnings.** `.scratch/dev-warnings/` also edits the development modules: core's, table's, charts' and
  a new one for calculation. `warnDeprecated` is a line added beside `warnOnce`, and whichever lands second
  rebases.
- **The token edge.** For the deprecation minor, a new token name set on an element below `:root` does not
  reach the library's rules. They read the old name, which the alias resolved at `:root`. The token's
  migration line says to set the new name on `:root`, or to keep the old name until the removal release.
