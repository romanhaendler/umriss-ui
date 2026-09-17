# 08 — CONTEXT.md becomes a glossary again

Status: done
Type: task

Spec: `.scratch/docs-structure/spec.md`

## Scope

955 lines, of which roughly 150 are not vocabulary but the record of a migration. A glossary says what a word means now; these tables say what a word used to be called.

**Out, into `docs/archive/rename-2026-09.md`:** the `Old → New` tables under **Public names** (21 public names plus the table's own and charts' `LimitLine`), the whole of **Values, not only names** (the ten value sets, the `data-*` attributes, the tokens), and the four-row table at the end of the tables section. The archive file gets a head saying which effort produced them (`english-and-umriss-ui`, Sep 2026) and that they are kept because the `.scratch/` specs speak in the old names.

**Stays, because it is a live rule and not history** — this is the part to get right, and it is the reason this ticket is not a cut-and-paste:

- **The register rule** (a lower-case German word in `de.ts` is an identifier, never display text; `von`/`bis`/`ab` are the exceptions) — it binds anyone who touches the German wording today.
- **"German that is the subject and not a leftover"** — the five test files whose German fixtures carry the test's meaning, and the rule that came out of it: *before renaming a fixture, ask whether the test measures the value or a property of the value.* This is a testing convention. Move it to `docs/testing.md` under Conventions, do not archive it.
- **"Words already taken, twice over"** — `oben`, `wert`, `seite`, `alt`. The finding is about grepping, and it stays in the glossary.

**Fix the doubled heading.** `## Design language` is immediately followed by `### Design language`, a leftover from the merge in `english-and-umriss-ui` 15. The outer heading's paragraphs (how the five collisions were settled) become the section's opening; the inner heading goes.

**Reorder by reach, not by when the entries arrived.** Language rule → design language (it is the cross-cutting vocabulary, and it currently stands last because it was merged last) → the domains, in today's order → module and directory names → **Words already taken** → **Retired**. No entry text is rewritten while it moves.

## Acceptance

- `CONTEXT.md` contains no `Old → New` table; `docs/archive/rename-2026-09.md` contains all of them, unchanged.
- The register rule, the fixture rule and "Words already taken, twice over" are all still in the workspace, at the places named above.
- No glossary entry's body differs from HEAD except by its position.
- Exactly one heading in the file reads "Design language".
- `grep -c '^\*\*' CONTEXT.md` before and after are equal — the entry count did not change.

## Comments

**Delivered, with one measured deviation.** `grep -c '^\*\*' CONTEXT.md` is
**124** against 125 at HEAD. The difference is exactly one bold paragraph lead,
and it is the one this ticket itself sends away: **German that is the subject and
not a leftover**, which is a testing convention and now stands in
`docs/testing.md` under Conventions. No glossary entry was lost.

Two further judgements worth recording:

- **`## Public names` is kept as a heading**, holding the two paragraphs that are
  still rules — why charts' component is `LimitLine`, and why a shape two parties
  agree on is the strongest reason to translate it. Only the tables and the pure
  rename prose went to the archive. Had the section gone entirely, the pointer
  from the module-names table (`see **Public names**`) would have dangled.
- **The remainder of `## Values, not only names` needed a home**, since its
  tables left. It is `## Words, and the German that stays`, with one new sentence
  saying what the section is. That and the archive's head are the only new prose;
  no entry body was rewritten while it moved.
