# 03 - The documents that follow the two ADRs

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01, 02
Spec: `.scratch/what-umriss-is-not-2/spec.md` - W5 and the table "The documents that follow"

## What to build

Each sentence of the spec's table at the place it names, in the voice of the file it
lands in, with the ADR numbers now known. Ticket 01 has already brought
`capabilities.md` "Out" and "Later", the charts' README paragraph and ADR-0032's
status line into line; this ticket does the rest.

- `docs/README.md`: the row "what umriss deliberately does not build" names the two
  new ADRs beside ADR-0032 (links), and the sentence on the pages of the site that
  names ADR-0032 names them too.
- `packages/demo/src/tooling/documents.ts`: a line in `DOCUMENTS` for each new ADR,
  in the pattern of ADR-0032's (a `path` of its own, a title "... - umriss-ui", a
  `name`). `pnpm build:pages` passes `documentFaults`.
- `packages/core/src/components/FormField/FormField.tsx`: the comment "It validates
  nothing - validation belongs to the caller" gains "(ADR-NNNN)". Comment only.
- `packages/core/demo/outline.ts`: the `limits` of `FormField` say "No validation:
  the caller's form library decides; pass `error` (ADR-NNNN)"; those of `Grid`,
  `Stack` and `Splitter` say that tiles are not arranged by the user (ADR-NNNN); the
  three lines "No time zones other than the browser's." become "umriss shows the
  reader's time (ADR-NNNN)." (DatePicker, DateTimePicker and the range line).
- `packages/charts/demo/outline.ts`: the time axis' `limits` get the time-zone line;
  the line "No horizontal bars: ..." becomes "Horizontal bars are the next kind to
  come (ADR-NNNN of ticket 01); until then a `Matrix` or a `Table` ranks by name."
- `packages/charts/docs/capabilities.md` "Known limits": the time-zone line.
- `packages/core/README.md` beside its link to ADR-0032: one sentence for validation
  and layout, one for time; `packages/schedule/README.md` beside its dates: the
  time-zone sentence.
- `docs/releasing.md` needs nothing: its step 2 reads "cannot" against ADR-0032, and
  the chain of pointers now leads on from there.

## Acceptance

- [ ] `grep -rn "No time zones other than" packages` finds nothing.
- [ ] `grep -rn "shows the reader's time" .` finds the ADR, the outlines, `capabilities.md` and the two READMEs, and no other wording of the same claim.
- [ ] Core's and charts' typecheck and unit tests pass (the outlines are read by `demo-smoke`), and `pnpm build:pages` passes.
- [ ] `FormField.tsx` differs by the comment only.
