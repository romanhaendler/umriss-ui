# 07: Contract: remove the free parts and `accessor`

**What to build:** The old shape is gone: the package no longer exports `Chart`, the axes or the series kinds on their own, `accessor` is no longer accepted, and `<Chart>` takes no `data`. `Legend`, `Tooltip`, `DataTable`, `LimitLine`, `LimitBand`, `ControlChart` and the pure functions stay ordinary imports.

**Blocked by:** 03, 04, 05, 06 (every migration batch)

**Status:** ready-for-agent

- [ ] Type tests: a free `Line` and an `accessor` no longer compile
- [ ] The capability record's 'Known limits' says the source-text comparison holds for functions only
- [ ] Every suite green; screenshots unchanged
