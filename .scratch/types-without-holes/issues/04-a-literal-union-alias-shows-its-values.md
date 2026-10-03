# 04: A literal-union alias shows its values under its name

Status: done
Blocked by: 01 (One table model, two writers)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** When a type cell is a single named library alias (or an array of one) that resolves through any number of alias hops to a union of string, number and boolean literals, the row keeps the name and shows the values on the next line joined by ` | `. Inline literal unions get nothing extra; interfaces, functions and mixed unions are not expanded.

- [x] The Button page shows `ButtonSize` and, beneath it, `"sm" | "md"`.
- [x] Reader fixtures: two-hop alias to a literal union carries name and values; alias to an interface carries no expansion; inline literal union carries none.
- [x] All 26 literal-union aliases named in tables today show their values.
- [x] HTML and Markdown show the expansion identically (parity test).

## Comments

Delivered: `PropEntry` gains `expansion?` (`packages/demo/src/tooling/propsReader.ts`). Where a member's type node is one type reference (or an array of one) to a type alias declared in the source that was read, the reader follows the alias through the checker's symbol (imports included) over any number of hops. If every part comes to a string, number or boolean literal (`null` does not count), the values are joined by ` | ` in the order they are written. A union merged from arms with two shapes carries no expansion. `ApiRow.expansion` carries the values into the model (`apiTable.ts`). The HTML writes `<code class="apiType">ButtonSize</code><br><code>"sm" | "md"</code>` (the second `code` is styled like the description's code, and the line breaks without CSS too). The Markdown writes `` `ButtonSize`<br>`"sm" \| "md"` ``, which is how a GFM cell breaks. The reader's header comment now says that the type stands as written and what it resolves to stands beside it.

Result: 26 aliases in 46 rows across core, charts, table and schedule carry their values. Every other line of every props.json is unchanged (diffed against the generation before the change). Three more mentions (`(place: DockPlace) => void`, `Readonly<Record<string, Pin>>`, `Pin | null` in a callback) are no single name, so the links of ticket 05 cover them.

Tests: `propsReader.test.ts` has three new cases against `fixtures/props/aliases.tsx` and `aliasBase.ts`: two hops across files, an array of one, and no expansion for an alias of an interface, a mixed union or an inline union. `apiTable.test.ts` has a `size` row with an expansion in the parity fixture (both writers, both event layouts) and a case for the exact markup of each. lint and typecheck are green. test:unit: demo, charts, schedule and calculation are green. The `demo-smoke` files of core and table timed out at 5 s under a load average of 130. Core's passes on its own. Table's fails the same way with main's writer swapped back in, so the timeouts come from the load and not from this change. Playwright (narrowed by the coordinator): `features-shell` and `features-page` in ui-light and table-light, 60 passed, 2 skipped.

Baselines moved: none. No baseline shows an API table with an aliased row (the Drawer table behind `drawer-beside-a-service-list` has none).

Deviations: "of the library" means declared in the package's own source. Another workspace package resolves to its `dist/*.d.ts`, which is present only after a build, so taking those in would make props.json depend on build order. None of the 26 comes from another package; ticket 05 has to resolve workspace packages to their source if its links are to reach them.
