# 04: NumberInput reads a typed "." by the language's separators

**What to build:** A Swiss or French user who types 1234.5 into a NumberInput gets 1234.5, not 12345. Reading and filtering share one rule: "." is the decimal separator wherever the formats' group separator is not "."; where it is (German), "." stays a group separator. A character the field cannot read is refused visibly - the field keeps its previous text - instead of being dropped while the rest is read. Spec: `../spec.md` ("NumberInput"); repro: `../personas/p13-third-language.md` 2.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Unit tests on the number parser and input filter (the existing pure seam): fr-CH "1234.5" → 1234.5; fr-CH "1 234,5" → 1234.5; de "1.234" → 1234; en "1,234.5" → 1234.5
- [ ] A component test: typing a letter leaves the field's text and value as they were
- [ ] German and English behaviour otherwise unchanged (existing tests green)
- [ ] Commit body: `Changelog core Fixed:` line
