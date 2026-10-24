# Shakedown: upgrading an existing app to 0.40.4

Status: needs-triage

Three apps of about 130 lines each (fields, Modal, Menu, Tooltip, Toast, Table, Chart, Schedule,
Calculation), written idiomatically from each starting version's own docs, upgraded in one step to the
0.40.4 tarballs. Vite 5, React 18 → 19, TS 5.6, Chromium, de-DE, 2026-10-24. Starting points: A = 0.34.0
(the last React 18 line, ADR-0062), B = core 0.30.0 with table 0.13.6, charts 0.14.0, schedule 0.5.7,
calculation 0.7.0, C = 0.39.0. Not covered: Next, the dashboard (from 0.40 only), WebKit.

## Findings, silent ones first

1. **[Trap] A table column function that reads outer state goes stale** (A and B; table 0.35 "Changed",
   functions compared by source text): `value={(o) => o.net * rate}` keeps the old figure after the rate
   doubles; no console output. Fix: 4 lines. Same as `composed-app.md` 1 and `audit-family.md` 3 - the third
   independent hit.
2. **[Trap] Two charts kept in step with `useState` + `onViewChange` + `initialView` stop following** (B;
   0.34 "Changed"); tsc and console clean. Fix: 5 lines with `setView`.
3. **[Trap] A German app's chart axis switches from `15.000` to `15,000`** (B; charts 0.34 "Changed"); the
   numbers now match the Stat - the hint is good, the change is silent.
4. **[Trap] React 18 with `--legacy-peer-deps` (or pnpm, which only warns) gives a white screen** ("render2
   is not a function") with no word about React 19; plain `npm i` fails clearly with ERESOLVE.
5. **[Look] `var(--u-color-accent-active)` in the app's own CSS silently resolves to nothing** after 0.34;
   the CHANGELOG says no stylesheet read the token, which misses an app reading it.
6. **[Misfit] Toast changes:** `duration: 0` toasts no longer count against `limit` (0.39); the region moves
   into an open `<dialog>` (0.36), breaking a `body > [aria-live]` test selector; the toast grew 14 px wider
   with a 14 px smaller inset, not listed under "Changed" (0.38 lists `--u-toast-width` as Added).

Loud breaks, all listed under "Changed": the React peer (ERESOLVE); `Dock`, `AlarmList` and `alarmModel`
removed in 0.34 (TS2305, Vite "does not provide an export"); `footer` and `filter` removed (TS2769, TS2353);
a `ref` of the wrong element is a type error (0.35).

Edit sizes: C 0 lines; A 7 lines plus React 19; B 33 lines plus 5 for the view sync (about 15 for the
AlarmList → Table rewrite, which the CHANGELOG only points at).

## Changes not hit that would bite silently

0.31 field widths of 20 characters (fixed-width toolbars shift); 0.30 Card as a flex column (children with
margins change); 0.33 every export a client component (a Server Component calling a helper such as
`verdictWeight` breaks at runtime); 0.35 ES2022 syntax (an app that does not transpile `node_modules` breaks
at load); 0.35 `useVirtual` renders only when the row window changes.

## The upgrade path

- `^0.x` peers are patch-only: `npm update` stays on 0.39.0 while `npm outdated` shows 0.40.4.
- `npm i @umriss-ui/core@0.40.4` alone exits 0 with only a peer warning and the app runs; only `npm ls` says
  "invalid". Moving all packages and React in one command works.
- No codemods, no upgrade guide; ADR-0035 promises "a migration table in each changelog", the CHANGELOG has
  inline hints per entry. Deprecated aliases lived one minor, then went.
- Table, charts and schedule jumped from 0.16 / 0.7 to 0.34 in numbering.
- 0.39 → 0.40.4: 0 pixels changed, tsc and console clean.

| Start | Hours for a real team | Where they go |
|---|---|---|
| 0.39 | 0.5 | install, tsc, one look |
| 0.34 | 6–10 | mostly React 19; about 2 to find the stale column |
| 0.30 | 12–20 | AlarmList and Dock replacement, view sync and locale hunting, React 19 |

**The one release-process change that would cut the most:** a dev-only warning for each silent behaviour
change, shipped with the change and kept for a few minors (an `initialView` changed after mount and ignored;
an accessor whose source matches but whose closure changed; an unresolved removed token).

Note for `operator-screens.md`: an `AlarmList` and an `alarmModel` existed and were removed in 0.34; the
operator persona's alarm-management wish asks for more than they held - read the reason for the removal
before deciding.

## Held up

The React peer error is clear · type errors name every removal · every item hit has a "Changed" entry with a
hint · Dock and AlarmList removals come with a replacement hint · the packages upgraded together without an
interface mismatch · Toast, Modal, Menu, Schedule and Calculation props did not change.
