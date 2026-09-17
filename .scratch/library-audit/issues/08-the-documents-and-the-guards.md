# 08 — The documents and the guards

Status: done

Spec: `.scratch/library-audit/spec.md`

## Scope

Make the repository documents true again, add the two guards that were
missing, and bring the lost spec home. All verified by running the commands
named.

- **`TESTS.md`** says 920 ui tests (line 22); `pnpm test:unit` reports 1065.
  The charts count (347) is right today and will be wrong tomorrow. Remove
  the counts from the table; keep the file lists and the levels. Update the
  tooltip entry under "Bekannt offen" after ticket 01.
- **`packages/charts/STATUS.md`** — "Stand: Pakete C.1–C.7 abgeschlossen;
  `mixed-series-kinds` 01–05 geliefert" (line 12) and no section for
  `StateBand`, `Matrix`, `Span`, `Limit`/`LimitBand`, `ControlChart`, the
  operating-time axis or the Pareto helpers. One section each, in the
  existing table shape, with the level each row is proven at — the
  instruments' tests exist (`zustand`, `zellen`, `spanne`, `regelkarte`,
  `pareto`, `betriebszeit`, `szeneGrenzenUndBaender`), the table just never
  learned about them.
- **`packages/ui/README.md`** — the component table (line 126) omits
  `TreeView`/`TreeSearch`/`useBaum`, `AlarmList`/`meldeModell`, `Stat`,
  `CommandPalette`/`useCommandPaletteShortcut`, `Popover`. Add the rows. A
  script in `demo/werkzeug/` diffs the table's first column against
  `src/index.ts` exports and runs in `pretypecheck` like `props`, so the
  table cannot drift again.
- **Lint fails on warnings.** Root `package.json` `lint` gets
  `--max-warnings 0`. The two warnings are handled in ticket 02. The ten
  existing `eslint-disable` comments — five in ui (`Kalender.tsx:80`,
  `ZeitFeld.tsx:30`, `NumberInput.tsx:93`, `CommandPalette.tsx:243`,
  `dialogChoreographie.ts:51`) and five in `charts/src/context.ts` — each
  carry a one-line reason or are removed.
- **Manifests.** Both `package.json` files get `license` (the maintainer
  names it; `UNLICENSED` if the package is private). `@umriss/charts` gets
  `CHANGELOG.md` with the same header rule as ui's ("Geändert" always its own
  heading) covering 0.1.0 → 0.2.0 at whatever granularity is honest, and
  `prepublishOnly: typecheck && build` like ui. `files` includes it.
- **The lost spec.** `git log main..worktree-wertigkeit-spec` shows one
  commit adding `.scratch/visuelle-wertigkeit/` (spec + five
  tickets) and 107 lines to `CONTEXT.md`. Cherry-pick it onto `main`; resolve
  the `CONTEXT.md` merge by keeping both; status stays `ready-for-agent`.
  Remove the five stale worktrees under `.claude/worktrees/` — four are
  identical to `main` (`git diff --stat main...<branch>` is empty) and the
  fifth is merged by this step.
- **`tone-contrast`** is `ready-for-agent` since Aug. 2026 and its two
  `OFFEN` entries still stand. Not implemented here (ticket 07 does the
  surface half); its `Sequencing` line gets a pointer to 07.
- **CI** — there is no `.github/` and no hook. Marked for a human: the
  screenshot baselines are darwin-only, so a Linux runner needs its own set
  generated once with `pnpm test:visual:update` and checked in, which
  `TESTS.md` already anticipates. Recommend a workflow running typecheck,
  lint, `test:unit` and `test:visual` on push, but the baseline generation is
  a one-time human step.

## Acceptance

- `pnpm lint` exits non-zero on any warning; today's run exits zero.
- `TESTS.md` contains no test counts; `STATUS.md` has a row for every
  exported charts component; the README table has a row for every exported
  ui component, and `pnpm --filter @umriss/ui typecheck` fails if not.
- `git worktree list` shows only `main`; `.scratch/visuelle-wertigkeit/`
  exists on `main` with its five tickets.
- Both manifests carry `license`; `packages/charts/CHANGELOG.md` exists and
  is in `files`; `pnpm -r build` still produces the same three files per
  package.

## Comments

**11 Sep 2026 — delivered.**

- The README table had lost fourteen rows, not five; `readmeTabelle.ts` found
  them and runs in `pretypecheck`.
- Five of the ten `eslint-disable` comments lacked a reason; all ten carry one.
  The gate was proven with a throwaway file carrying a single warning: `pnpm
  lint` exited 1.
- `CONTEXT.md` merge: the spec's glossary is appended as its own section, with
  a note on the five words that collide with the glossary above — resolving them
  is `visuelle-wertigkeit`'s work.
- All five worktrees removed after checking each was clean and carried nothing
  `main` lacked; their branches are kept.
- CI remains for a human, as the ticket says.
