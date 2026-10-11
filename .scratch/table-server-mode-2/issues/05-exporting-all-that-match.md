# 05 - Exporting all that match

Status: ready-for-agent
Type: task
Size: M

Blocked by: 01
Spec: `.scratch/table-server-mode-2/spec.md`, "Exporting all that match (T3)"

## What to build

`exportRows?: (request: TableRequest) => Promise<readonly Z[]>` in server mode.
`Export` calls it with the current request unchanged, and writes the returned
rows through the function that writes `asCsv`, taken apart so it can be given
rows (the visible columns, their order, the export's values). The format stays
whatever `Export` is handed - if `format` has landed by then, use it; if not,
leave the seam for it. With `exportRows` the button says `exportLabel`, without
it `exportPageLabel`. While the promise is out the button is disabled and
`aria-busy` and a status says "Preparing the export"; a second click is
ignored; the file belongs to the request of the click. A rejection shows its
message (or `exportFailed`) beside the button in a `role="alert"` until the next
click. New keys: `exporting`, `exportFailed`.

## Acceptance

- [ ] With `exportRows` the file holds the returned rows in the visible columns
      in order; `onExport` gets the same text.
- [ ] The request handed over equals the table's current request at the click,
      also when it changes while the promise is out.
- [ ] A rejection shows its message and writes no file; a second click works.
- [ ] Without `exportRows`: label and behaviour as today.
- [ ] The busy state is announced and a second click does nothing.
- [ ] Wording in both languages; the README says the application caps and refuses.
