# 01: Button opens with a configurator

Status: done
Blocked by: `types-without-holes` 03 (`@deprecated` and `@default` are read), `types-without-holes` 04 (A literal-union alias shows its values under its name)
Spec: `.scratch/configurator/spec.md`

**What to build:** The configurator machinery, proved on the Button page. A configurator is one file beside the page's examples that names the component, the props it controls in panel order, the starting children text and the starting value of any required prop — nothing else. Controls come from the props data that `types-without-holes` resolves: a literal union of up to five members becomes core's RadioGroup inline, more than five core's Select, `boolean` a Switch, `number` a NumberInput with the documented bounds, `string` (only `placeholder` and the children text) an Input; `disabled` and `placeholder` are the only inherited attributes allowed. A prop whose default is "inherit" shows its effective value as "md (default)". Under the stage stands the code — import line and one element, props only where they differ from the default, strings quoted, numbers braced, `true` bare — with the existing copy button, and a Reset. The configurator takes the first example's slot; the former first example becomes the first titled example and keeps its anchor. It is never rendered into the prerendered page, the twin or the llms text. Naming an unknown prop or a prop that cannot become a control fails at load time with the file and the prop.

- [ ] Fixture tests: type → control kind; code omits defaults, quotes strings, braces numbers, writes `true` bare; an unknown prop and a function prop each fail naming file and prop
- [ ] Page suite on Button: choosing "primary" and "sm" yields exactly one element with those two attributes; Reset restores the bare element; the copy button puts that exact string on the clipboard; every control is reached by Tab and works with its keys
- [ ] The former first example stands as the first titled example with its old anchor
- [ ] The prerendered Button page, its llms text and its twin are unchanged
- [ ] Controls under the stage below 900 px, beside it from 900 px; light and dark follow the theme
- [ ] Screenshot baselines of the Button page head at rest, light and dark

## Comments

Delivered: the machinery has two halves. `packages/demo/src/tooling/configurator.ts` is pure. `controlsOf` maps the props reader's rows to controls: a literal union (from `expansion`, else the inline type; never an array) becomes `choice` at up to five values and `select` above five. `boolean` becomes a switch, off where it has no default. `number` becomes a number field with the bounds the declaration gives. The children text becomes a text control. `disabled` and `placeholder` are allowed only where the element (`inherits`) has them. A phrase default comes to the last code span in it that is one of the union's values, so `size` starts at `md` and is marked `inherited`, which the panel shows as "md (default)". Anything else throws `` `<file>` names `<prop>`, … `` at load time. `codeOf` writes the import line, a blank line and one element. A prop is written only where it differs from its default; a required prop is always written. Strings are quoted, numbers and `false` braced, `true` bare, and text that would not stand as written becomes an expression. `readConfigurators` reads `demo/configurators/<Component>.tsx` against `<Component>Props`, and `buildDemo` takes the glob as `configurators` (core alone passes one). The React half is `packages/demo/src/Configurator.tsx`. It builds the panel from core's own `RadioGroup` (horizontal), `Select`, `Switch`, `NumberInput`, `Input` in `FormField`, and a `Reset` button. Each control is labelled with the prop's name. The stage renders exactly what the code says: a prop at its default is not passed. The existing `CodeBlock` sits under the stage with its copy button. The panel stands beside the stage from 900 px and under it below that (`page.css`). `Page.tsx` puts the configurator in the first slot. All examples, the first included, then stand titled under "Examples" with their anchors. The declaration for Button is `packages/core/demo/configurators/Button.tsx`: `component`, `controls` (`variant`, `size`, `loading`, `disabled`) and `children` ("Acknowledge"). The prerendered page, the twin and the llms text come from the example files and do not change: the generated files are unchanged. CONTEXT.md gains **Configurator**.

Tests:
- `packages/demo/tests-unit/configurator.test.ts`: 15 cases against the new fixture `fixtures/props/configurable.tsx`, read through `readProps`. They cover type to control kind, the phrase default, the code rules, and failures on an unknown prop, a function, a node, a string and a `placeholder` on a `<button>`.
- Core's jsdom smoke test renders every configurator. At rest its element carries only its required attributes.
- Core's `features-page.spec.ts` has six browser cases. "primary" and "sm" give exactly `<Button variant="primary" size="sm">Acknowledge</Button>`, and the button gets shorter and changes colour. Reset brings back the bare element. Copy puts the exact string on the clipboard. Tab runs children, variant, size, loading, disabled and Reset, each operated by its keys. The panel stands beside the stage at 1280 and under it at 390. "One action" is the first titled example at its anchor.
- The axe sample already includes `button`.

Results: lint, typecheck and test:unit are green. The one charts readout case and one table case failed in the full run and passed when re-run alone; that was load. Playwright in ui-light/ui-dark: the screenshots, forced-colours and accessibility suites filtered to button (58 passed) and the page suite (16 passed).

Baselines moved:
- New: `configurator-button` (light and dark).
- Renewed: `example-button--one-action` and `forced-button--one-action`, because "One action" is now titled.
- Renewed: `example-button--{variants,sizes,loading-and-disabled,submit-a-form,with-an-icon,approval-bar}` and `forced-focus-button`. These six examples now lie lower on the page, and each picture changed height by one pixel through sub-pixel rounding. Their content is unchanged; I compared variants old against new.

Deviations:
- facade-defects 02's `checkFirstExample` probed the Button page, whose first slot is now the configurator. It now probes Select ("Select").
- The number field's bounds come from an optional `bounds` in the declaration. The spec says "documented bounds", but the props data carries none.
- `required` takes only plain values, so IconButton's glyph (ticket 02) still needs a way to declare a node with its code text.
- In the shell suite, table-light's "a moved address lands on the page" (`first-table`) failed against the prebuilt preview. Nothing here touches routing.
