# 03 — The statement look, for tree and chain

Status: ready-for-agent
Type: task

Blocked by: 02
Spec: "The look", "Folding", "The tree's long operator", "Line",
"Accessibility", "Wording"; ADR-0028 "How it is shown"; user stories 1–4

## Scope

- Replace the accordion of the first delivery with the statement look, for
  the tree and the chain alike: result beneath its operands under a rule, the
  Result with a double rule; columns label · operator · number · unit; the
  label as disclosure button, no chevron; the formula in names beneath a
  folded label, "N operands" above four; inner levels indent their label and
  recede to the secondary colour; at most two rows per quantity; content width;
  flat hover band; "≈" in the operator column.
- Chain: operand lines with their operator and own number, interims with the
  running value; folding per interim, a chain starting folded to its interims;
  the worst-verdict marker on a folded interim.
- The sentence for operand lines and interims, English and German; new wording
  entries in core (the long operator's count among them).
- Tokens only; no font named; nothing depending on a face's measures.

## Acceptance

- Rendering tests, rewritten for the new look, through OEE and the costing
  sheet: order of lines (operands before their result), initial folding,
  unfolding by the label, the formula beneath a folded label, the operator
  column, the long operator, the sentence in both languages, hover and focus
  coupling.
- The package's axe check without violations; `pnpm lint`, `pnpm typecheck`,
  `pnpm test:unit` green.
