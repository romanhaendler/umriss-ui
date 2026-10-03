# 04: A literal-union alias shows its values under its name

Status: ready-for-agent
Blocked by: 01 (One table model, two writers)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** When a type cell is a single named library alias (or an array of one) that resolves through any number of alias hops to a union of string, number and boolean literals, the row keeps the name and shows the values on the next line joined by ` | `. Inline literal unions get nothing extra; interfaces, functions and mixed unions are not expanded.

- [ ] The Button page shows `ButtonSize` and, beneath it, `"sm" | "md"`.
- [ ] Reader fixtures: two-hop alias to a literal union carries name and values; alias to an interface carries no expansion; inline literal union carries none.
- [ ] All 26 literal-union aliases named in tables today show their values.
- [ ] HTML and Markdown show the expansion identically (parity test).
