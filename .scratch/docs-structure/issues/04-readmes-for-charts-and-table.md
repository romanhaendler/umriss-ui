# 04 — A README for charts and for table

Status: done
Type: task

Spec: `.scratch/docs-structure/spec.md`

## Scope

`@umriss-ui/charts` and `@umriss-ui/table` are MIT-licensed, carry a `files` list and a `prepublishOnly` gate, and have no README. npm packs one automatically when it exists; for these two the package page would be blank.

Both follow the same order — the one `packages/core/README.md` will keep after ticket 09:

1. What it is, two sentences, taken from the `description` in `package.json` and made into prose.
2. Install, including the peer requirements. For the table that is `@umriss-ui/core` as a peer (ADR-0016); for charts, that it depends on nothing but React and will keep doing so (R-1.2).
3. The smallest example that runs. For charts, one `Chart` with one `Line`. For the table, `useTable` with two columns — the file `packages/table/demo/examples/Table/01-first-table.tsx` is exactly this and is already checked by the demo; take it from there rather than writing a second one that can rot.
4. The stylesheet: `@umriss-ui/<package>/styles.css`, with the sentence from core's README about why the barrel does not pull it in.
5. What the package can do, as a short list with a pointer at the demo — not a second component roster. For charts, the performance claim belongs here in one line **with its measurement** (`packages/charts/STATUS.md`, "Performance (R-5, reference run)"), never as an unqualified adjective.
6. Links: the demo command, the changelog, `docs/design-language.md`, the capability record where one exists.
7. Licence.

`packages/core/README.md` is not restructured here — ticket 09 does that. What this ticket may do is align its section order with the two new files once they exist.

## Acceptance

- `packages/charts/README.md` and `packages/table/README.md` exist.
- `pnpm pack --dry-run` in each of the three published packages lists `README.md`, `CHANGELOG.md` and `LICENSE`.
- Every code block in both files compiles as written — the imports are package names, not relative paths.
- Neither file repeats the component roster or the design language; both link them.
