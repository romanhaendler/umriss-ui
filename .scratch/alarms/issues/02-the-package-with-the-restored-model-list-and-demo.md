# 02 - The package, with the restored model, list and demo green

Status: ready-for-agent
Type: task
Size: L

Blocked by: `01-the-adr-alarm-management-is-a-package-of-its-own.md`
Spec: `.scratch/alarms/spec.md`

## What to build

`@umriss-ui/alarms` exists, builds, has its demo in the shared shell, and holds the alarm model and list
exactly as they behaved at `e027d1f7^`, with their tests green. Every later ticket changes this baseline. The
package is not published yet: it stays off `publish.yml`'s list until ticket 11.

Most of the work is copying. The package's frame comes from `packages/dashboard` (the newest package; its
creation commit `f36c6528` lists every file a new package touches). The content comes from `e027d1f7^`.

- **The package**, with the package files the dashboard has (`LICENSE`, a short `README.md`, a
  `CHANGELOG.md` with its title only):
  - the manifest: name, description, keywords, `files`, `sideEffects`, `exports` of the main entry and
    `styles.css`, the same scripts, and `check:dist` naming its JS and CSS;
  - the version: the workspace's current number;
  - peers: `@umriss-ui/core` and `@umriss-ui/table` as `workspace:^`, and React `>=19`; both packages and
    `@umriss-ui/demo` as `workspace:*` dev dependencies;
  - the build, typecheck and Vitest configuration, as the dashboard has them.
- **The restored code**, from `e027d1f7^:packages/table/src/alarms/`: the model, the list, its CSS module
  and the public index.
- **The restored tests**, from `packages/table/tests-unit/`: `alarmModel`, `availability`, `alarmList`,
  `alarmListSnoozeReason`, and the public-entry guard. The guard now holds that the list imports only React,
  the public entries of core and table, and its neighbours.
- **Four mechanical moves, nothing else:**
  - **Imports** go through `@umriss-ui/core` and `@umriss-ui/table`.
  - **Table exports its pipeline.** `tableModel` and the type `TableProjection` join table's main entry, each
    with JSDoc: "the table's pipeline as a pure function - filter, sort, page over rows and model columns".
    Regenerate table's `API.md`; the props gate wants a comment on every export (ADR-0044).
  - **The 35 wording keys** come back into core's `Wording`, `DEFAULT_WORDING` and `GERMAN_WORDING`, in a
    section `@umriss-ui/alarms` beside the other packages' sections, with their texts of `e027d1f7^`.
    - Each key gets the prefix `alarm`: `acknowledgeAlarm` becomes `alarmAcknowledge`, `columnPriority`
      becomes `alarmColumnPriority`, and so on.
    - The general words stay in the names: snooze, disabled, suppressed.
    - The list and the tests read the new names.
    - Core's language tests get back the cases they had for these keys at `e027d1f7^`.
  - **Private custom properties** in the CSS take the prefix `--_alarms-`.

  If the table's props moved since 0.34 where the list uses them (`ariaLabel`, `rowProps`, `selectable`,
  `empty`, `density`, `stickyHeader`), the list follows with the smallest change. The test that proves the
  behaviour stays as it was.
- **The package's guards**, as the dashboard has them: the style guard, the wording guard, the glyph guard,
  an SSR test, a demo smoke test, and a focus guard where it applies.
- **The demo**, in the shared shell (ADR-0020), after the dashboard's.
  - `App.tsx`, `main.tsx`, `index.html`, `examples.ts`, `outline.ts`, `props.ts`, the demo's Vite and
    TypeScript configuration, and `unshown.json` if the gate asks for it. The port is 4179.
  - The outline's page `AlarmList`, from table's outline at `e027d1f7^`: its sentence, about, keys and limits.
    Leave out the table-only alternatives. Then a rubric of its own; the API index page is generated.
  - The eight example pages from `e027d1f7^:packages/table/demo/examples/AlarmList/`, and the scenario "Work
    through the alerts" from `e027d1f7^:packages/table/demo/scenarios/`. Table keeps its own rewritten
    scenario. Imports change to the package; each example still carries its own data (ADR-0035, amended).
  - The visual suite, as the dashboard's: navigation, pages, own base, own data, silent pages,
    accessibility, forced colours, large text, scenarios and screenshots. The clock is frozen, as table's
    suite froze it for the old list. Baselines are taken anew, light and dark.
- **The workspace joins it:**
  - `scripts/check.mjs`, `scripts/changelog.mjs` and `scripts/visual-quick.mjs`;
  - `package.json`'s `lint` and a `dev:alarms` script;
  - `playwright.config.ts`: its server on 4179 and its light and dark projects;
  - `packages/demo/src/packages.ts` (role: "Alarms with a lifecycle: a list, a banner, a mark") and the
    shell's title map, with the shell's own package test;
  - `.claude/launch.json`;
  - `CONTRIBUTING.md`'s lists of packages and ports;
  - `docs/README.md`'s line on the demos.
- **The lint** (`eslint.config.js`): the package imports only the public entries of core and table, and
  nothing imports `@umriss-ui/alarms`.
- **`CLAUDE.md`'s dependency map:**
  - eight packages;
  - `@umriss-ui/alarms` depends on `@umriss-ui/core` and `@umriss-ui/table` (the ADR of ticket 01);
  - "nothing depends on the table" no longer holds; nothing depends on the alarms;
  - seven demos.
- **Changelogs.** Nothing is written now; the release writes them (`docs/releasing.md`). The commit message
  names table's new exports and core's new keys, so that `pnpm changelog` picks them up.

## Acceptance criteria

- [ ] Every restored test passes in the new package. A test changed only where an import path or a wording
      key's name changed, and the diff against `e027d1f7^` shows nothing else.
- [ ] `pnpm check alarms`, `pnpm check table` and `pnpm check core` pass.
- [ ] `pnpm typecheck` and `pnpm lint` pass. An import of `@umriss-ui/alarms` from any other package fails
      the lint.
- [ ] `pnpm --filter @umriss-ui/alarms build` and `check:dist` pass.
- [ ] `packages/alarms/API.md` and the regenerated `packages/table/API.md` are current, and
      `pnpm check:site` passes.
- [ ] `pnpm --filter @umriss-ui/alarms dev` serves the demo on 4179, with the eight pages and the scenario in
      the shell. `pnpm start` lists the package.
- [ ] `pnpm test:visual:quick alarms` passes, and `DEMOS=alarms pnpm test:visual` passes with the new
      baselines.
- [ ] The package is not on `publish.yml`'s list, and the root README does not list it yet.
