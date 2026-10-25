# 03 - A renamed prop, export or wording key keeps its old name for one minor

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-the-adr-the-upgrade-promise.md`
Spec: `.scratch/upgrade-promise/spec.md`

## What to build

This is the deprecation mechanism that every rename uses, and the check that makes its removal unavoidable.
It lands no rename itself. Its first users are the root contract's `ariaLabel` alias and the schedule's
handle bridge (`.scratch/root-contract/`, tickets 03 to 06, which this ticket blocks).

- **The warning.** Beside `warnOnce`, each existing development module gains
  `warnDeprecated(old: string, replacement: string)`. It is one line over that package's own `warnOnce`
  (no shared helper; `.scratch/dev-warnings/` decided so), keyed `deprecated:<old>`, with one wording:
  `@umriss-ui/<pkg>: <old> is deprecated and goes in the next minor release; use <replacement>.`
  - Core's development module holds only `isDev` today. It gains a `warnOnce` by table's rule, unless
    `.scratch/dev-warnings/` has added one already.
  - Charts' and table's modules gain the one line.
  - Schedule and dashboard have no module. Each gets one, a copy of table's, with its first warning; the
    schedule's handle bridge will be that warning. Calculation's comes from `.scratch/dev-warnings/`.
- **The marker.** The old name carries the JSDoc tag `@deprecated since 0.<N> - use <new>.`. TypeScript
  strikes it through. The props tables and `API.md` already list a deprecated row last with its sentence.
  The props gate asks for an example; a deprecated prop answers it with an entry in the package's
  `demo/unshown.json`, under the existing category "(g) deprecated alias".
- **The check.** `check-dist` scans the package's `src/` (`.ts`, `.tsx` and `.css`; it reads the first two
  already) for `@deprecated`. Each marker must name `since 0.<N>`, and N must be the package's own minor
  or the next one. Otherwise it fails with the file, the line, the marker's minor and the package's
  version, and says "remove it". So the release of minor N+1 cannot go out while a name deprecated in N
  stands. Deprecating during development, while the version is still N, writes `since 0.<N+1>`.
- **The recipe**, in `CONTRIBUTING.md` under "The rules that bind a change", one entry, "A rename keeps its
  old name for one minor", linking the ADR:
  - **Prop**: the component reads `new ?? old`, and calls `warnDeprecated` when the old one is given. The
    old prop keeps its type, with the marker.
  - **Export** (component, hook, constant, type): the old name re-exports the new one with the marker. A
    component or hook warns on its first render or call under the old name; a constant or a type is marked
    only.
  - **Wording key**: the package's wording merge copies an old key onto the new one when the new one is
    not given, and warns. The old key stays in the wording type, marked.
  - **Token**: ticket 04.
  - **The changelog**: the rename's entry under "Changed" names the old name, the new one and the release
    that removes the old one, in its migration line. The removal's entry is under "Changed" too.
  - **What cannot keep an old form** is a break, named as one under "Changed".

## Acceptance criteria

- [ ] Each of core's, charts' and table's development modules exports `warnDeprecated`. A unit test per
      package, in jsdom with `console.warn` spied on, shows that:
      - it warns once per old name, and a second old name warns again;
      - the wording is exactly the fixed one, with the package's prefix;
      - it stays silent under `NODE_ENV=production`.
- [ ] `check:dist` passes on every package.
- [ ] A planted `@deprecated since 0.40` in a source file fails `check:dist`, naming the file and the line.
      `since 0.42` passes on 0.41.x, and `since 0.43` fails, as does a marker with no `since`. Each was
      tried by hand and reverted.
- [ ] The recipe stands in `CONTRIBUTING.md`, one entry, with the ADR linked.
- [ ] `pnpm check core`, `pnpm check charts`, `pnpm check table` and `pnpm check:site` pass, and `API.md` is
      regenerated if the gate asks for it.
