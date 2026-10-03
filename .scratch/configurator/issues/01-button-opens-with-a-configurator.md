# 01: Button opens with a configurator

Status: ready-for-agent
Blocked by: `types-without-holes` 03 (`@deprecated` and `@default` are read), `types-without-holes` 04 (A literal-union alias shows its values under its name)
Spec: `.scratch/configurator/spec.md`

**What to build:** The configurator machinery, proved on the Button page. A configurator is one file beside the page's examples that names the component, the props it controls in panel order, the starting children text and the starting value of any required prop — nothing else. Controls come from the props data that `types-without-holes` resolves: a literal union of up to five members becomes core's RadioGroup inline, more than five core's Select, `boolean` a Switch, `number` a NumberInput with the documented bounds, `string` (only `placeholder` and the children text) an Input; `disabled` and `placeholder` are the only inherited attributes allowed. A prop whose default is "inherit" shows its effective value as "md (default)". Under the stage stands the code — import line and one element, props only where they differ from the default, strings quoted, numbers braced, `true` bare — with the existing copy button, and a Reset. The configurator takes the first example's slot; the former first example becomes the first titled example and keeps its anchor. It is never rendered into the prerendered page, the twin or the llms text. Naming an unknown prop or a prop that cannot become a control fails at load time with the file and the prop.

- [ ] Fixture tests: type → control kind; code omits defaults, quotes strings, braces numbers, writes `true` bare; an unknown prop and a function prop each fail naming file and prop
- [ ] Page suite on Button: choosing "primary" and "sm" yields exactly one element with those two attributes; Reset restores the bare element; the copy button puts that exact string on the clipboard; every control is reached by Tab and works with its keys
- [ ] The former first example stands as the first titled example with its old anchor
- [ ] The prerendered Button page, its llms text and its twin are unchanged
- [ ] Controls under the stage below 900 px, beside it from 900 px; light and dark follow the theme
- [ ] Screenshot baselines of the Button page head at rest, light and dark
