# The acceptance on the candidate

The fourteen conditions of [the acceptance criteria](../issues/03-the-acceptance-criteria.md), on the candidate
`0.58.0` (published 2026-11-23) and its fixes `0.58.x`. **Mine** is what only the maintainer can do. `1.0.0`
appears when every line says "met", and not before the maintainer says so.

| # | Condition | State | Evidence, or what is left |
|---|---|---|---|
| 1 | The gates green in a fresh worktree | met for `0.58.0` | `ci.yml`'s steps in a fresh worktree, the full visual suite light and dark (5207 passed), Semgrep (0 findings), `check:dist`; repeated for each `0.58.x` |
| 2 | The maintainer's applications run without a deprecation warning | **mine** | move them to `0.58.x` with [the guide](../../../docs/migrating-to-1-0.md); click through once on the development server with the console open - several warnings appear only on use |
| 3 | Chrome, Firefox and Safari each run the `@quick` checks of all seven demos | met | 1098 checks in Chromium, Firefox and WebKit in the Playwright Linux image; the job `browsers` in CI, green on `0.58.0` |
| 4 | Those checks run in CI in the three engines | met | `ci.yml`, job `browsers` |
| 5 | The floors are derived from the source | met | Chrome 125, Firefox 121, Safari 17.5; `browserFloors.repo.test.ts` |
| 6 | The documents state the aim and the check; axe on every page | met | README "Accessibility"; 167 pages, light and dark, no finding |
| 7 | The muted text at 4.5:1, the tolerated list empty | met | no colour had to change; the list is empty |
| 8 | One pass with VoiceOver in Safari, its result recorded | **mine** | [`voiceover.md`](voiceover.md), 44 steps; write the result into its last column |
| 9 | Every open keyboard item fixed or expressly declined | met but for one device check | see "The keyboard items" below; **mine**: the popover above an on-screen keyboard, and Alt+I / Alt+O once on Windows |
| 10 | The README says right-to-left is not supported | met | root README, with the browsers |
| 11 | `API.md` lists every member; no "not shown yet"; the guide and `SECURITY.md` exist | met with `0.58.1` | functions with signatures and records with their members' types come with `0.58.1`; `docs/migrating-to-1-0.md`; `SECURITY.md`, private reporting switched on |
| 12 | The maintainer has looked through each demo, light and dark | **mine** | every page as a picture, light beside dark: `~/Downloads/umriss-0.58.0-pages/index.html` (167 pages); each finding is fixed or declined |
| 13 | A small shakedown of two tasks | met | see "The small shakedown" below |
| 14 | `.scratch/` holds this map only; the two tickets only a person can close are closed | **mine** | `.scratch/local-docs` (the removal from the Search Console) and `.scratch/security-hardening` (the settings at GitHub and npm, the Trusted Publisher of each package); this folder goes with `1.0.0` |

## The keyboard items

Of the four that needed a run on the candidate:

- **Focus in a virtual grid under a re-sort**: a defect, smaller than recorded (the focus never fell to the body, it
  landed on an unrelated row). Fixed in `0.58.1`: the focus follows its row by key and the cell is scrolled into
  view.
- **The two forms of the focus ring**: holds. One colour and 2 px everywhere; the inset form stands only where an
  outset ring would be clipped. Picture: `~/Downloads/umriss-0.58.0-acceptance/keyboard/item2-focus-rings-chromium.png`.
- **The skip link's ring**: there was no skip link. The demo shell has one now; core expressly has none (its
  README says why).
- **A popover above an on-screen keyboard**: a device only. **Mine.**

Added on the candidate and to be tried once by hand: **Alt+I and Alt+O in the schedule on Windows** (lead-in and
lead-out; the chord reads the physical key and ignores Ctrl+Alt, which is AltGr). It runs in the three engines
on macOS and Linux.

## The small shakedown

Two tasks, each a subagent against the packed `0.58.0`.

1. **An application from `README.md` and `API.md` alone** (all seven packages, five screens): built, typed, no
   console message. Found: `API.md` gave functions no signature and records no types (closed in `0.58.1`); the
   sentence on `CommandPalette`'s `onClose` was wrong (set right); a control chart's reference window is named by
   indices and no sentence said so (set right); the dashboard's editing outline covered the edge of "Done"
   (fixed). Pictures: `~/Downloads/umriss-0.58.0-acceptance/shakedown-a/`.
2. **A `0.56.0` application moved with the guide alone**: done, to no warning; 25 of 26 features were named by
   the guide well enough. Found and written into the guide: `useDensity()` under a provider that still says
   `"comfortable"` returns `"regular"` with no warning; warnings appear in development only, several only on
   use; where `csv` comes from. Pictures before and after: `~/Downloads/umriss-0.58.0-acceptance/shakedown-b/`.

Not covered by either: a root font size other than 16 px in a caller's own layout, the dark theme in task 2,
Firefox and WebKit in the hosts, touch.

## What `1.0.0` does

Removes every name marked `@deprecated since 0.58`, makes `onSelect` of `CommandPalette` and `row` / `state` of
`Matrix` / `StateBand` required again, moves the library's rules to the two renamed tokens, teaches the texts
that say `0.x` the new promise (ADR-0083), and raises the peers to `^1.0.0`. Nothing else.
