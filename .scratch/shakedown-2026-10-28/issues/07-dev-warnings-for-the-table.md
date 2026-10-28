# 07: The table warns in DEV about rowKey and an unknown field, and only once about pageSize

**What to build:** `useTable` without `rowKey`, or with a string such as `"id"`, warns "rowKey must be a function (row) => string" and renders nothing instead of crashing with "undefined is not a function". A column whose field no row of the first page has warns once with the field's name, so a typo does not fill a column with "No value". The existing "pageSize without Pagination" warning fires once per table, not once per render. Spec: `../spec.md` ("DEV warnings for props", "pageSize warning"); repros: `../personas/p1-lena.md` 2 and 4 (`t-norowkey`, `t-rowkey-str`, `t-badfield`), `../personas/p22-tobias.md` 5.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Component tests: missing and string `rowKey` warn and do not throw; a misspelt field warns once with its name; `pageSize` without Pagination warns once across re-renders
- [ ] No warning for a correct table (existing tests green)
- [ ] Commit body: `Changelog table Added:` / `Fixed:` lines
