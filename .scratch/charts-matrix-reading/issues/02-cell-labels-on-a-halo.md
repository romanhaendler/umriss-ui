# 02 - Cell labels on a halo

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/charts-matrix-reading/spec.md`

## What to build

A data scientist writes `<Matrix value="row" level="r" labels />`, and each cell of the correlation matrix
writes its value, legible on every stop in both themes.

- **The prop.** `labels?: boolean` on `Matrix`, default `false`.
- **The text.** The level in the matrix' `format`, else the built-in number format, in the tick size and the
  chart's font.
- **The fit.** Drawn where its measured width plus 4 px and its line height plus 2 px fit in the cell's
  drawn rectangle; elsewhere none, never truncated. Where the cells are lower than one line, nothing is
  measured.
- **The colour.** The resolved theme's text colour over a halo about 3 px wide of its ground colour. Under
  forced colours both are the system colours the theme already resolves to.
- **Where.** On the series layer, after the cells. A hole has none, a hidden matrix draws none, and the
  legend's highlight dims them with their cells.
- **The example.** "A correlation matrix, read" on the Matrix page: nine variables, a diverging set of nine
  stops over `[-1, 1]`, `labels`, and a tooltip. A second, dense matrix with `labels` shows cells left without
  text, or the lead says so.
- **Docs.** The doc comment of `labels`, `API.md`, the capability record's Matrix row, and the changelog under
  "Added".

## Acceptance criteria

- [ ] A draw test with a recording context: a 3 × 3 grid draws nine texts in the format; a hole draws none;
      cells too small draw none; each text is stroked in the ground colour before it is filled in the text
      colour.
- [ ] Without `labels` no text is drawn, and every existing matrix screenshot is unchanged.
- [ ] The example's screenshots, light and dark and under forced colours, are new baselines and reviewed: a
      label on the lightest and on the darkest stop is legible.
- [ ] `pnpm check charts` and `pnpm check:site` pass, and charts' `API.md` is regenerated.
- [ ] `pnpm test:visual:quick charts` passes.
