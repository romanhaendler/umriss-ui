# 07: Contract: remove the free parts and `accessor`

**What to build:** The old shape is gone: the package no longer exports `Chart`, the axes or the series kinds on their own, `accessor` is no longer accepted, and `<Chart>` takes no `data`. `Legend`, `Tooltip`, `DataTable`, `LimitLine`, `LimitBand`, `ControlChart` and the pure functions stay ordinary imports.

**Blocked by:** 03, 04, 05, 06 (every migration batch)

**Status:** ready-for-agent

- [ ] Type tests: a free `Line` and an `accessor` no longer compile
- [ ] The capability record's 'Known limits' says the source-text comparison holds for functions only
- [ ] Every suite green; screenshots unchanged

## Comments

### Carried in from 02 and 03 (2026-10-04)

- `value` becomes required (during the expand both `value` and `accessor`
  are optional, so a series with neither compiles).
- `ControlChart` still takes `accessor`; it gets `value` (field or function)
  like every series.
- Matrix: `value` is its colour channel today, its row position `accessor`.
  The naming waits for the user (proposal: `value` is the y position on every
  kind, the colour channel becomes `level`).
- Scene-level tests and internal configs keep their internal `accessor`
  field; only the public prop goes.

### Carried in from 04 (2026-10-04)

- The hook's `XAxis`/`YAxis` are typed only at the hook's row, while series
  are `<T = Z>`. An axis whose series all bring their own `data` cannot name
  their fields (Axis/08 falls back to `value={(_, i) => i + 0.5}`), and an
  axis read across series of different row types type-checks against the
  hook's row only (Axis/08's `tiles` y axis reads `fired` from `HourCount`).
  Give the axes `<T = Z>` as well, so `<XAxis<HourCount> value="hour" />`
  names the rows it reads, restore Axis/08 to a field name, and say in the
  axis' doc comment that it reads the rows of every series bound to it.
- `unshown.json` holds `AreaProps.accessor` as "(g) deprecated alias";
  remove it with the prop.
