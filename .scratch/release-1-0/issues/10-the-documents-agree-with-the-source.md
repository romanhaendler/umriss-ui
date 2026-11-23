# The documents agree with the source

Type:   research
Status: open

## Question

Where does a document say something the source does not do, or leave out what a caller needs?

- Doc comments on the public types against the behaviour. Known instance: `TableView.conditions`
  (`packages/table/src/model/view.ts`) says "the conditions of the column filters, per column", yet row
  filters' conditions live there too, and it names no shape per filter kind.
- The packages' `README.md` against `API.md`.
- `CONTEXT.md` against the names in the source.
- ADRs overtaken by later ones without saying so (ADR-0066 speaks of six packages; there are seven published).
- `docs/README.md`, `CONTRIBUTING.md`, `docs/releasing.md`, `docs/testing.md` against what the scripts do.

Sample widely rather than read everything; say what was sampled. Candidates only.

Findings: `.scratch/release-1-0/research/10-the-documents-agree-with-the-source.md`
