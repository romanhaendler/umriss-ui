# 03: No internal ids or source paths in user text; ADR numbers are links

Status: ready-for-agent
Blocked by: `types-without-holes` 01 (One table model, two writers)
Spec: `.scratch/props-table-hygiene/spec.md`

**What to build:** The 32 charts descriptions citing `R-x.y` move those numbers into `@remarks`, which the reader drops. Every `ADR-` with four digits in a description or page text (lede, about, alternatives, keys, limits) becomes a link to that ADR's file on GitHub, resolved by number at generation time; an unresolvable number stops the generator. "See `lib/language`" becomes a link to the Language page. The gate gains the class *internal reference*: a requirement number or a source path in user-facing text stops the build, no exception list.

- [ ] Gate tests: a fixture with a requirement number and one with a source path fail with file and line; an unresolvable ADR number fails; corrected fixtures pass.
- [ ] Built-site guard: no page text contains `R-` followed by digits; every `ADR-` mention is inside a link.
- [ ] Both writers render the ADR and Language links identically.
- [ ] The workspace passes the gate.
