# 03 - A label beside its field

Status: ready-for-agent
Type: task
Size: M

Blocked by: `.scratch/theming-recipe/issues/05-the-field-labels-size-as-a-token.md`
Spec: `.scratch/core-small-additions/spec.md`

## What to build

A dense settings form or a property panel reads as a label column beside the fields. The ticket waits for
the theming recipe's ticket 05, which puts the label's size on a token in the same rule.

- **The prop.** `labelPlacement?: "top" | "start"` on `FormField`, default `"top"`, today's layout.
- **`"start"`** lays the root out as a row that wraps:
  - the label first, as wide as the new token `--u-label-width` (default 10rem);
  - then the field part: the control and, under it, the hint or error. It takes the rest of the row and
    needs at least 12rem;
  - where the row cannot hold both, the field part wraps under the label, and the field reads as with
    `"top"`.
- **Alignment.** Label and field align on their first baseline, so the label's text is level with the field's
  text at `sm` and `md`, and beside a Checkbox, a Switch or a RadioGroup.
- **Unchanged.** Ids, `htmlFor`, `aria-describedby`, the required mark and the invalid state are those of
  `"top"`.
- **The token** gets its comment in the tokens stylesheet; the Theming page lists it.
- **Docs.** The prop's doc comment says that `"start"` is for a column of fields and fills its place, and
  that a `Grid` of fields keeps `"top"`.
- **The example.** A new example on the FormField page: a property panel of five or six fields with their
  labels in a column, one with a hint and one with an error.
- Regenerate `API.md`.

## Acceptance criteria

- [ ] A jsdom test: with `"start"`, the label names the control, `aria-describedby` reaches the hint and
      then the error, and the required mark stands, as with `"top"`.
- [ ] A `@quick` check in core, in a wide place:
  - [ ] the label stands left of the field and is 10rem wide; an unlayered
        `:root { --u-label-width: 14rem }` moves the field's left edge to match;
  - [ ] the label's baseline is level with the input's text within a pixel, at `sm` and `md`;
  - [ ] the hint and the error start at the field's left edge, under it.
- [ ] The same check in a 280 px place: the field stands under its label.
- [ ] The existing FormField screenshots are unchanged; the new example's are new baselines, reviewed in
      both themes.
- [ ] `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick core` pass.
- [ ] Core's changelog lists `labelPlacement` and `--u-label-width` under "Added".
