# 12 — The table demo

Status: done
Type: task

Blocked by: 05, 11

Spec: `.scratch/english-and-umriss-ui/spec.md`

## Scope

58 files. Second wave: needs the shell (05) and the table's own renames (11).

- `Anwendung.tsx` → `App.tsx`, `gliederung.ts` → `outline.ts`, `beispiele.ts` → `examples.ts`, `props.ts`, `ui-stile.css` → `ui-styles.css`.
- `demo/beispiele/` → `demo/examples/`, all 45 example files renamed: `01-wert-aus-feld.tsx` → `01-value-from-field.tsx`, `02-berechneter-wert.tsx` → `02-computed-value.tsx`, `05-fehlende-werte.tsx` → `05-absent-values.tsx`, `99-vorfuehrung.tsx` → `99-demonstration.tsx`, and so on. Numeric prefixes stay.
- `demo/warum/` → `demo/why/` (6 files), translated in full.
- `demo/.generiert/` → `demo/.generated/` and the generator that writes it.
- The outline's German copy: every page `satz` and the rubric names.
- The demo's own sample data is German domain text (plants, alarms, shifts). Translate the visible strings; keep the data shaped as it is — it is what makes the table look like a real table.

## Acceptance

- `pnpm --filter @umriss-ui/table typecheck` and `test:unit` pass; `pnpm lint` clean.
- `pnpm --filter @umriss-ui/table props` regenerates cleanly.
- No German filename, identifier or visible string remains under `packages/table/demo`.
- After this ticket the whole workspace is green again: `pnpm typecheck && pnpm lint && pnpm test:unit`.

## What was done

59 files under `demo/` renamed and rewritten. `git grep -nE '[äöüßÄÖÜ]' -- packages/table/demo`
returns nothing.

Verified: `pnpm --filter @umriss-ui/table typecheck`, `test:unit` (368 in 27
files), `pnpm lint`, `pnpm --filter @umriss-ui/table props` (18 types, all
English). Workspace-wide: `pnpm typecheck` green in all four packages,
`pnpm test:unit` green (charts 365, demo 29, core 940, table 368).

**Every prose-heavy file was written out in full, never patched.** The six
`why/` pages and all 46 example headers came out at zero German characters on
the first attempt, which is the same result this effort recorded in ticket 05.

### The sample data: strings translated, shape untouched

Not one row was added, removed or reordered, and no number changed. The
demonstration keeps its twelve orders, its five-row page size and the two
Northworks rows whose quantities make the footer sum 1,810; `05-absent-values`
keeps `null` and `NaN` in positions two and four of five; `08-virtualisation`
keeps its PRNG seed `20260823` and its twenty thousand generated rows.
Company names were replaced rather than translated (`Keller & Söhne` →
`Keller & Sons`, `Nordwerk` → `Northworks`), because ticket 16's final check
greps for umlauts.

### Values that stayed German on purpose

They are contracts owned outside this ticket, and the typecheck holds them:

- `format="prozent" | "anzahl" | "datum" | "zeit" | "datumZeit"` — `values.ts`.
- The limit-set wire format: `sollwert`, `grenzwerte`, `{ wert, seite, stufe }`,
  `"oben"`/`"unten"`, `"warnung"`/`"alarm"`.
- The four lifecycle literals and the three priorities of the alarm model —
  `AlarmList.module.css` selects on `data-zustand` together with them.
- `FreshnessAges` (`{ alt, abgerissen }`), `VirtualOptions.zeilenHoehe` and the
  `UmrissProvider` prop `dichte`, all `@umriss-ui/core`'s.

Each of the three files carrying one now says in its header why it is German,
so the next reader does not "fix" it.

### `warum/` → `why/` repaired a silent break

`@umriss-ui/demo`'s `readWhy` matches `/\/why\/([^/]+)\.tsx$/` and skips what
does not match. Ticket 05 renamed that pattern to English while the folder was
still `warum/`, so **every "Why so" section of the table demo had been silently
missing since ticket 05** — no error, just absent prose. Renaming the folder
restores all six.

`99-vorfuehrung.tsx` → `99-demonstration.tsx` has the same flavour: the shell
sets `demonstration: id === "demonstration"`, so the flag had been false all
along and the demonstration was rendered as an ordinary example. It is now what
it says it is, and it stands last.

## Forced changes outside `packages/table/demo`

Ticket 05's rule — "the consumers could not be left broken" — applied again.
Each of these is mechanical and named string by string; none is a pattern sweep.

- **`@umriss-ui/demo` `tooling/fileName.ts`**: `EXAMPLE_PATTERN` now accepts
  `examples` *or* `beispiele`. Without it the folder rename this ticket is
  asked to perform throws at load for every example. The German alternative is
  there only because `core/demo` still carries the German folder; **ticket 10
  removes it**, together with the synthetic `/beispiele/` path that
  `checks/pages.ts` builds.
- **`.generiert` → `.generated`**: the generator (`tooling/props.ts`), the
  comment in `src/demo.ts`, the `.gitignore` glob (which is
  `packages/*/demo/.generiert/`, i.e. shared), and therefore also the one import
  line in `packages/core/demo/beispiele.ts` — otherwise `core` stops compiling.
- **`packages/table/tests-unit/demo-smoke.test.tsx`**, **`tests-visual/navigation.ts`**,
  **`tests-visual/pages.ts`**, **`vite.demo.config.ts`**: import paths and the
  examples directory.
- **The five `tests-visual` spec files**: the example *anchors* come from the
  file names, so all 45 renames reach them, as do the column labels, action
  labels, status values, the export file name and its CSV header row. The
  library's own `Wording` strings in those files — "Zurücksetzen",
  "Alle auswählen", "N ausgewählt", "aufklappen", "nach vorn", "entfernen",
  "Aktionen: …", "Exportieren", "Seitennavigation" — were **not** touched: they
  are ticket 13's. Neither were the German test titles, which are ticket 11's.
- `data-rolle="ansicht"` → `data-role="view"` in `07-initial-view.tsx`, with its
  selector in `features-table.spec.ts` **in the same commit**.

Rubric ids and names moved with the outline (`betrieb`/"Betrieb" →
`operations`/"Operations", and the other three), so `features-shell.spec.ts`'s
`rubricId` and `rubricName` probes moved with them.

## For ticket 16

- **`features-shell.spec.ts`'s `pointer.narrow` was `"zeile"`, now `"row"`.**
  Its test needs a query that returns *fewer* finds than `"ta"` and moves the
  selection off the row under the pointer. The assertion is a relative one
  (`toBeLessThan(earlier)`), so `"row"` is very probably right — but **the
  visual suite was not run** (this ticket may not run it, and it cannot share
  the machine), so it is unverified. Check it first when the shell rubric runs.
- The table's 118 baselines all move: nearly every visible string on every page
  changed, and the page heads print the outline's `sentence` and `exports`.
  Nothing was added, updated or deleted here.

## Deviations, recorded rather than hidden

- **`export const titel` keeps its German identifier.** The shell reads
  `mod.titel` (`tooling/examples.ts`) and strips it by
  `/^export const titel\b/` (`tooling/source.ts`), and `core/demo`'s 70 example
  files depend on the same contract. Renaming it is a change to
  `@umriss-ui/demo` that has to land with both demos at once, so it belongs to
  whoever closes the shell — not here. The *strings* are translated, which is
  what this ticket was asked for. `examples.ts` says so at its head.
- **`PropsJob.gliederung`** stays for the same reason: `core/demo/props.ts`
  passes it too. Noted at the head of `demo/props.ts`.
- **`fileName.ts`'s German error message** ("Erwartet: beispiele/…") was left
  untouched. It is prose in a package this ticket does not own, and ticket 05's
  post-mortem is explicit about identifier passes splicing English into German
  sentences.

## Added to `CONTEXT.md`

One row, appended to the end of the **Module and directory names** table:
`demo/examples/Column/13-wrapper.tsx` — a column that brings its own
presentation and is taken as `of`; **not** `shell`, because that word is the
demos' own shell (`@umriss-ui/demo`) and one grep would have two answers. The
German original was `13-huelle.tsx`, and `Huelle` → `Shell` is exactly the
rename ticket 05 performed on the shell.

No other term was needed: the demo's vocabulary is already in the glossary
(**Page**, **Example**, **Demonstration**, **Rubric**, **Pre-filter**,
**Absent value**, **Bulk action**, **Row header**, **Presentation**).
