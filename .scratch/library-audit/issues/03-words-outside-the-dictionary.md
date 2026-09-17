# 03 — Words outside the dictionary

Status: done
Blocked by: 06 (only for the charts half — the ui half can start)

Spec: `.scratch/library-audit/spec.md`

## Scope

Every string a user can see or hear comes from `Wortlaut`; charts, which
decided to have no text layer, ships no German default.

`@umriss/ui`:

- `Table/TableFilter.tsx:72,78` — "Zurücksetzen" and "Fertig" as literals.
  New entries `filterZuruecksetzen`, `filterFertig`.
- `AlarmList/meldeModell.ts:328-346` — `MELDE_SPALTEN` carries seven German
  labels that reach the CSV header and the column menu. The model is pure and
  cannot read context; follow `standardPresets(wortlaut)`: export
  `meldeSpalten(wortlaut)` and keep `MELDE_SPALTEN` as the German default.
  `AlarmList` calls the function.
- `MultiSelect/MultiSelect.tsx:415-417` — `{value.length} / {options.length}`
  assembled by hand. One parametrised entry.
- `Toast/Toast.tsx:190` — the region is `role="status"` for every tone;
  `Alert.tsx:39-45` gives warning and danger `role="alert"`. One table in
  `lib/` (`rolleVonTon`), used by both; a danger toast becomes an alert.
- Demo examples `beispiele/DateRangePicker/01-zeitraum.tsx:25` and
  `DateTimeRangePicker/01-schichtfenster.tsx:27` call
  `toLocaleDateString("de-DE")`; they use `useFormate()` like the library
  they document.

`@umriss/charts` (after ticket 06 has settled the prop language, because two
of these add props):

- `ControlChart.tsx:73-74` — `labelOben = "OEG"`, `labelUnten = "UEG"`.
  Default to no label.
- `ControlChart.tsx:145` — `` `${name} – Regelverletzung` ``. A caller-supplied
  name prop for the violation series; without it, no name.
- `pareto.ts:56` — `restName: "Sonstige"`. Required whenever `sammelRang` is
  finite; the default options object drops it.
- `scene.ts:1139` — `` `Serie ${index + 1}` `` stays as the legend's last
  resort, with a DEV `warnOnce` when a series has no name.
- `layout.ts:162-170` — `zeitText` uses `toLocaleString(undefined, …)`, so
  the default tick label of an operating-time axis depends on the machine.
  Format `dd.MM. HH:mm` by hand from the `Date` parts; no `Intl`, no locale.

## Acceptance

- A unit test reads `components/**/*.tsx` as text (the `?raw` pattern of
  `kontrast.test.ts`) and fails on a JSX text node or a string prop
  containing a German-looking word (`[A-ZÄÖÜ][a-zäöüß]{3,}`) outside
  `wortlaut.ts`, with a named exception list that starts empty.
- `sprache.test.tsx` covers the new entries; `alarmList.test.tsx` asserts a
  wording override reaches a column label; `meldeModell.test.ts` asserts
  `MELDE_SPALTEN` equals `meldeSpalten(STANDARD_WORTLAUT)`.
- A behaviour test asserts a danger toast region has `role="alert"` and a
  neutral one `role="status"`.
- `layout.test.ts` asserts the default operating-time label for a fixed
  instant is the same string regardless of `process.env.LANG`.
- Charts screenshot `regelkarte` and `pareto` baselines move only if the demo
  does not pass the labels explicitly — the demo passes them, so none move.

## Comments

**11 Sep 2026 — delivered.** Two things in this ticket did not match the code:

- `AlarmList` never read `MELDE_SPALTEN`; its header already used the
  `Wortlaut`. The labels reach a caller through the model: `meldeModell` takes
  `spalten`, and `sicht.spalten` carries `meldeSpalten(wortlaut)` into column
  menu and CSV header. `alarmList.test.tsx` asserts both.
- The charts demo did **not** pass `labelOben`/`labelUnten` or `restName`.
  Removing the defaults would have moved `regelkarte` and `pareto`; the demo now
  passes them explicitly, and no baseline moved.

The violation name prop is `violationName`, per ADR-0015. The wording guard
reads the components through the TypeScript parser rather than a regex.

Review follow-up: each toast carrying its own live role meant a
polite region inserted already filled, which screen readers often skip. The
toast region now holds two live containers, `status` and `alert`, that exist
before the first toast; CSS `order` keeps the on-screen sequence.
