# 10 — A field that fills a row

Status: needs-info
Type: decision

Left open at the acceptance of control-sizes (05, 2 Oct 2026).

In a row a field is its natural width, as a block is; a search field that
should take the rest of a bar needs the row's own layout - `flex: 1` on the
field or its `FormField`, or a grid. There is no prop for it, on purpose
(ADR-0041: the place decides, and `Stack` stays pure layout). It is the one
place where a caller still writes `style` or a class for a width.

Options if wanted: a prop on the fields (`grow`), a prop on `Stack` for the
child that takes the rest, or a documented class. Each would be checked against
the README's principles and the existing names before it is built.

The question for the user: is it wanted?
