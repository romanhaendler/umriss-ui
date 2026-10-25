# 05 - The field label's size as a token

Status: ready-for-agent
Type: task
Size: S

Blocked by: `01-a-modal-width-the-capitals-and-the-press-as-tokens.md`
Spec: `.scratch/theming-recipe/spec.md`

## What to build

One more styling need gets its token, by ADR-0045 (map ticket 21, "A `FormField` label slot";
`design-system.md`, the label wish). A FormField's label shares `--u-text-sm` with every control, so a brand
that wants its labels smaller or larger than the fields' text has no way but a span inside `label`. The
ticket waits for 01, which adds tokens to the same section of the tokens stylesheet and the Theming page in
the same way.

- **`--u-label-size`**, default `var(--u-text-sm)`, stands in core's tokens beside the type steps. Its
  comment says that it is the size of a FormField's label, and that the controls keep their own.
- **FormField's label** reads it. Its weight, colour and line height stay as they are.
- Nothing else reads it: a Checkbox's or a Switch's label is the control's own text, not a field label.
- The default is today's value, so nothing looks different until an application sets it.

## Acceptance criteria

- [ ] A `@quick` check in core: with an unlayered `:root { --u-label-size: 0.75rem }`, a FormField's label
      computes 12 px and the Input inside keeps its own size. Without it, the label computes the size of
      `--u-text-sm`.
- [ ] The Theming page lists `--u-label-size` with its description, and its token gate passes.
- [ ] Core's screenshot suite passes unchanged.
- [ ] `pnpm check core` and `pnpm check:site` pass.
- [ ] Core's changelog notes the token under "Added".
