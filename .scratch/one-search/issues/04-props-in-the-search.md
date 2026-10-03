# 04: Props in the search

Status: ready-for-agent
Blocked by: 03 (One index for the site: all five packages from any demo), `props-to-examples` 01 (Every row names the examples that show it)
Spec: `.scratch/one-search/spec.md`

**What to build:** Every documented prop joins the fragment as a `prop` entry. The label is the prop name; the group is `<package> · <Type>` (the props type that declares it, with inherited props once under their declaring type). It lands on the prop's anchor `#<Type>-<prop>`.

- [ ] From any demo on the built site, `pageSize` lands on its row in the table's props table.
- [ ] `size` shows separate finds for `TableProps`, `ButtonProps` and others, each naming its type and package.
- [ ] Every prop entry's anchor exists on its page (the guard stays green).
- [ ] Shell suite prop probe green in every demo.
