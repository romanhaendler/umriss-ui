# 04 — Lines, references and folding

Status: ready-for-agent
Type: task

Blocked by: 03
Spec: "Line", "Folding", "Wording"; user stories 1–7, 14

## Scope

- One line per quantity: label, formula in names, formula in numbers with
  units, the result right-aligned in tabular figures (with "≈" where 03 sets
  it), then its assessment the way `Stat` shows one. Explanation and the
  caller's slot beside it; source and freshness on a given.
- A reference shows the referred quantity's label and number, not its
  derivation.
- Folding: disclosure per derived quantity; initially the level under the
  result open and everything below folded; the state is the component's own
  and never changes when data changes. A folded quantity whose derivation holds
  a worse verdict shows it as a quiet marker, not as the line's colour.
- New wording entries in core, English and German: operator words and symbols,
  the reasons for absence, the approximation note, disclosure labels.
- Styles from the vocabulary only (tokens), own elements only (ADR-0021).

## Acceptance

- Rendering tests through the OEE case: formula lines, reference lines,
  initial folding, folding and unfolding, the worst-verdict marker, an absent
  given showing through to the result.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green; core's wording test
  covers the new entries in both wordings.
