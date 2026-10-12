# 17 - The table's rows, decided on the benchmark page

Status: done
Type: task
Size: L (four candidates, each tried and measured)

Blocked by: 14, 16
Spec: `.scratch/react-19-and-performance/spec.md`, "The table", "decided on the benchmark page"; user stories 24, 32

## What to build

Four changes to what the table does per render, none of which was measured.
Each is tried on its own against the benchmark page and kept only if the page
shows it; a candidate that does not pay is taken out again and the record
says so.

1. **Memoised rows and cells.** A row whose data, columns and state did not
   change is not rendered again when the window moves or the caller renders.
   This first needs the snapshot the hook deposits to keep its identity across
   renders that change nothing in it.
2. **A row's position in its group and a group checkbox's state** without a
   scan of the group per rendered row.
3. **The per-render maps of tree rows and of the grid** built once per
   projection.
4. **The frame's layout effects** reading rows' boxes only when rows can have
   moved.

What a user sees and hears is unchanged - the announced position in a group
above all.

## Acceptance

- [ ] For each of the four: the figure before, the figure after, and "kept" or
      "dropped" in the capability record.
- [ ] A dropped candidate leaves no code behind.
- [ ] The existing tests pass unchanged, the accessibility attributes of rows
      among them.
- [ ] No screenshot moves; the table's interaction tests in the browser suite
      pass.
- [ ] `pnpm check table` passes.
