# 07 — The default counts

Status: needs-info
Type: decision

Left open at the acceptance of control-sizes (05, 2 Oct 2026). Released as
core 0.21.0 with these natural widths, where a place asks a field how wide it
is (a row, a toolbar, a start-aligned column):

| Field | Characters | At `sm`, Geist loaded |
|---|---|---|
| Input, Select, Combobox | 16 | about 160–185 px |
| MultiSelect | 20 | about 194 px (two short chips and the counter) |
| NumberInput | 10, plus a text prefix/suffix | about 158 px with "kg" |
| Textarea | 40 | |
| Date pickers | their longest formatted value | |

The question for the user: do these read right in the application's own bars,
or should a count change? A change is one custom property per component
(`--_chars`), the prop docs, `docs/design-language.md` ("Sizes"), CONTEXT.md
("Natural width"), ADR-0041's paragraph on defaults - and every baseline whose
picture holds such a field in a row.
