# 02: Nine more configurators

Status: done
Blocked by: 01 (Button opens with a configurator)
Spec: `.scratch/configurator/spec.md`

**What to build:** Configurators for IconButton, Badge, Tag, Alert, Input, Checkbox, Switch, Meter and ProgressBar, each a declaration file only, on the machinery of ticket 01. Meter and ProgressBar bound `value` to 0–100; IconButton starts with its required label and glyph. The list of ten is closed.

- [ ] The ten pages open with a configurator whose code at rest is the bare element (required props only)
- [ ] Every control's values equal the members of the prop's resolved type
- [ ] The core demo's jsdom smoke test renders all ten configurators
- [ ] Axe passes on one configurator page
- [ ] Screenshot baselines: the ten page heads at rest, light and dark; the former first examples photographed as titled examples

## Comments

Delivered: nine declaration files in `packages/core/demo/configurators/` (IconButton, Badge, Tag, Alert, Input, Checkbox, Switch, Meter, ProgressBar), each named after its page. The machinery in `packages/demo/src/tooling/configurator.ts` changed in three small ways:
- A required prop may be a node with its code text: `{ node, code }` (`NodeValue`). The stage renders the node. The code writes it between the tags, or as `prop={code}`, and the PascalCase names in that code join the import line. IconButton declares `required = { "aria-label": "Add a stop", children: { node: <PlusGlyph />, code: "<PlusGlyph />" } }`, so its code at rest is `import { IconButton, PlusGlyph } …` with `<IconButton aria-label="Add a stop"><PlusGlyph /></IconButton>`.
- A number field with bounds steps by a hundredth of them and gets the decimals that step needs. For `[0, 1]` that is a step of 0.01 and two decimals, so arrows never write `0.30000000000000004`.
- A prop that the table lists wins over the element attribute of the same name. Tag has its own `disabled` on a `<span>`, and the old order refused it.

Tests:
- `configurator.test.ts`: 3 new cases (the step, the node in code and import, the table's own `disabled`).
- Core's smoke test: a new case for the closed list of ten. The at-rest case now leaves required `children` out of the attributes and ignores words inside quoted values.
- `features-page.spec.ts`, "The other configurators": IconButton's code and staged button. Meter's value steps 0.80 → 0.81 by ArrowUp, the bar follows, and Shift+ArrowUp twice clamps to `value={1}`.
- Axe: the sample already holds alert, input, switch and progressbar, so four configurator pages pass in light and dark.

Results: lint, typecheck and test:unit are green. Playwright ui-light/ui-dark ran the screenshots, forced-colours, accessibility and page suites, filtered to the nine pages plus every configurator test.

Baselines moved (light and dark each):
- New: `configurator-{iconbutton,badge,tag,alert,input,checkbox,switch,meter,progressbar}`.
- Renewed for the title: the nine former first examples, which are now titled. That is `example-` and `forced-` for `iconbutton--name-the-icon`, `badge--a-badge`, `tag--a-tag`, `alert--a-message`, `input--text-field`, `checkbox--checkbox`, `switch--on-and-off`, `meter--a-share` and `progressbar--how-far`. Each grew by about 16 px for its heading.
- Renewed for the shift: every other example on these pages whose picture moved by one pixel or sub-pixel, because it now lies lower on the page. Their content is unchanged; I compared old against new (`tag--a-filter-bar`, `switch--states-and-sizes`). `alert--with-actions`, `badge--counters` and `badge--tones` did not move. The page heads did not move.

Deviations:
- Meter and ProgressBar are bounded 0 to 1, not 0 to 100. Both document `value` "from 0 to 1" (Meter's `aria-valuenow` is the percentage). A 0 to 100 field would write wrong code (`value={50}` fills the bar), and the spec's intent is "the bounds the component documents".
- Checkbox and Switch start with a `label`, and Input with an `aria-label`. None of them is required by type, but each is the control's accessible name. Without one, axe fails the stage and the code would teach an unlabelled control. Their bare element is therefore `<Checkbox label="…" />` and the like.
- ProgressBar's `value` has no default. It starts empty, which is the indeterminate bar, as `<ProgressBar />`.
- Alert's `title` and Tag's `removeLabel` are a node and a string, so neither gets a control. Input's `clearable` is left out, because it needs a controlled value and `onClear`.
