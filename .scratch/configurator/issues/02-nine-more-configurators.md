# 02: Nine more configurators

Status: ready-for-agent
Blocked by: 01 (Button opens with a configurator)
Spec: `.scratch/configurator/spec.md`

**What to build:** Configurators for IconButton, Badge, Tag, Alert, Input, Checkbox, Switch, Meter and ProgressBar, each a declaration file only, on the machinery of ticket 01. Meter and ProgressBar bound `value` to 0–100; IconButton starts with its required label and glyph. The list of ten is closed.

- [ ] The ten pages open with a configurator whose code at rest is the bare element (required props only)
- [ ] Every control's values equal the members of the prop's resolved type
- [ ] The core demo's jsdom smoke test renders all ten configurators
- [ ] Axe passes on one configurator page
- [ ] Screenshot baselines: the ten page heads at rest, light and dark; the former first examples photographed as titled examples
