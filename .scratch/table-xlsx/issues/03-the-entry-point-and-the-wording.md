# 03 - The entry point, the wording and the demonstration

Status: ready-for-agent
Type: task
Size: M

Blocked by: 02
Spec: `.scratch/table-xlsx/spec.md`

## What to build

- `packages/table/vite.config.ts`: `lib.entry` becomes `{ index: "src/index.ts", xlsx: "src/xlsx/index.ts" }`, `fileName` as core's (`index` -> `table.js`, else `${name}.js`), so `dist/xlsx.js` is written. Check that `importOwnCss("table.js", "table.css")` still puts the stylesheet import into `table.js` only, and that `xlsx.js` has no import at all.
- `packages/table/package.json`: `exports["./xlsx"] = { "types": "./dist/xlsx.d.ts", "import": "./dist/xlsx.js" }` beside `"."` and `"./styles.css"`. `rollupTypes` flattens the types to `dist/xlsx.d.ts`, as core's `de.d.ts` (see the comment in core's `vite.config.ts`). Decide how `xlsx.d.ts` names `ExportFormat`: a type import of `@umriss-ui/table` kept external, or, if that does not resolve in the build or the tests, a structural copy guarded by a type test that both are mutually assignable.
- `scripts/check-dist.ts` and the table's `check:dist`: the entry check accepts `xlsx.js` as a file with no stylesheet; it fails if `xlsx.js` has an `import`, if `table.js` contains the writer (search a marker such as `"[Content_Types].xml"`), or if `xlsx.js` is above 4 kB minified and gzipped.
- Core `wording.ts` and `de.ts`: `exportSheetName` ("Table" / "Tabelle").
- Demo: an example on the Export page, `<Export format={xlsx} label="Export Excel" />` beside the CSV button, and the one with `onExport` receiving bytes. The demo's alias reaches `src/xlsx`. A smoke test downloads the file in the demo and checks it begins `PK`.

## Acceptance

- [ ] `pnpm --filter @umriss-ui/table build` writes `table.js`, `table.css`, `xlsx.js`, `index.d.ts`, `xlsx.d.ts`; `check:dist` passes with the new rules.
- [ ] `import { xlsx } from "@umriss-ui/table/xlsx"` type-checks in a consumer fixture (or the demo) under `moduleResolution: bundler` and `node16`.
- [ ] An application importing only `@umriss-ui/table` has no writer in its bundle (the marker test).
- [ ] The mounted test of `<Export format={xlsx}>`: file name `table.xlsx` (`tabelle.xlsx` in German), the right MIME, the sheet name from the wording.
- [ ] Wording keys in English and German; the completeness test passes.
- [ ] The demo example works; no existing screenshot moves.
