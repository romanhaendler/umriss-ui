/* The frame's grid wiring for one render (ADR-0034): the lines the arrows
   walk with a new row spliced in, the head row's column ids, and the
   handlers over them. Not a hook - it runs after the frame's early return. */

import type { HookSnapshot, Registry } from "./registry";
import type { RowKey, TableProps } from "./types";
import { gridLines, rowLine } from "./model/gridWalk";
import type { GridLine } from "./model/gridWalk";
import { NEW_LINE, gridHandlers } from "./grid";
import type { GridHandle } from "./grid";
import type { FrameLayout } from "./frameLayout";
import { openDetails } from "./tree";

/* The lines of the last render, with what they were made of. A keystroke in an
   editor changes none of it, and the lines cover every row - also those a
   virtual window does not render - so they are rebuilt only when it changes. */
interface Kept {
  made: readonly unknown[];
  lines: GridLine[];
  /* The lines of the open new row's draft: a copy, never the kept lines. */
  spliced?: { row: unknown; lines: GridLine[] };
  rowLinesOf?: { rows: readonly unknown[]; set: Set<string> };
  rowLines: (hook: HookSnapshot) => Set<string>;
}
const keptByTable = new WeakMap<Registry, Kept>();

function keptLines(registry: Registry, hook: HookSnapshot, props: TableProps<unknown, RowKey>, layout: FrameLayout): Kept {
  const { loading = false } = props;
  const { projection, virtual, lines, spanEntry, dataColumns, controlColumns, trailing, blocks, rows, footerShown } = layout;
  const source = loading ? undefined : lines ? (virtual ? projection.lines! : lines) : virtual ? (projection.shown ?? projection.filtered) : rows;
  const detailRows = projection.shown ?? projection.filtered;
  const aggregates = dataColumns.map((e) => (e.spec.aggregate !== undefined ? "1" : "0")).join("");
  const made = [loading, lines !== undefined, source, detailRows, hook.rowKey, layout.snapshot, layout.detail, layout.entries, controlColumns, spanEntry !== undefined, aggregates, trailing, blocks.start, blocks.end, blocks.count, footerShown];
  const before = keptByTable.get(registry);
  if (before && before.made.every((m, i) => m === made[i])) return before;
  const body = !source ? { rows: [] } : lines ? { lines: source as never } : { rows: source };
  const kept: Kept = {
    made,
    lines: gridLines({
      layout: { controls: controlColumns, span: spanEntry !== undefined, aggregates: dataColumns.map((e) => e.spec.aggregate !== undefined), actions: trailing, blocks },
      body,
      rowKey: hook.rowKey,
      expanded: layout.detail ? openDetails(registry, layout.snapshot, detailRows, hook.rowKey, layout.tree) : new Set(),
      foot: footerShown,
    }),
    rowLines: (hook) => {
      /* The lines of the hook's rows - a tree's child rows lie in their branches, not in `rows`. */
      if (kept.rowLinesOf?.rows !== hook.rows) {
        const set = new Set<string>();
        const children = hook.tree?.children;
        const seek = (list: readonly unknown[]) => {
          for (const row of list) {
            set.add(rowLine(hook.rowKey(row)));
            if (children) seek(children(row) ?? []);
          }
        };
        seek(hook.rows);
        kept.rowLinesOf = { rows: hook.rows, set };
      }
      return kept.rowLinesOf.set;
    },
  };
  keptByTable.set(registry, kept);
  return kept;
}

/* The kept lines with the new row beneath the head, as a copy of its own. */
function withFresh(kept: Kept, row: unknown, open: boolean): GridLine[] {
  const head = kept.lines[0];
  if (!open || !head) return kept.lines;
  const had = kept.spliced;
  if (had && had.row === row) return had.lines;
  const lines = kept.lines.slice();
  lines.splice(1, 0, { key: NEW_LINE, cells: head.cells, at: -1, row });
  kept.spliced = { row, lines };
  return lines;
}

export function frameGrid({
  registry,
  hook,
  props,
  layout,
  grid,
}: {
  registry: Registry;
  hook: HookSnapshot;
  props: TableProps<unknown, RowKey>;
  layout: FrameLayout;
  grid: GridHandle;
}) {
  const { selectable = false, loading = false, grid: gridMode = false } = props;
  const { virtual, spanEntry, dataColumns, expanderColumn, trailing } = layout;

  /* A new row stands above the body's rows, whatever the sort, the filter or
     the page - the walk finds it right beneath the head. */
  const fresh = grid.state.editing?.line === NEW_LINE ? grid.state.editing : null;
  const kept = gridMode ? keptLines(registry, hook, props, layout) : undefined;
  const gridLinesNow = kept ? withFresh(kept, fresh?.fresh, fresh !== null) : [];

  const gridIds = [
    ...(selectable ? ["#select"] : []),
    ...(expanderColumn ? ["#detail"] : []),
    ...(spanEntry ? ["#span"] : []),
    ...dataColumns.map((e) => e.spec.id),
    ...(trailing ? ["#actions"] : []),
  ];
  const events = gridMode
    ? gridHandlers({
        grid,
        lines: gridLinesNow,
        hasRow: (line) => kept!.rowLines(hook).has(line),
        loading,
        ids: gridIds,
        columnById: (id) => dataColumns.find((e) => e.spec.id === id),
        rowKey: hook.rowKey,
        virtual,
        onCellEdit: props.onCellEdit,
        rowMode: layout.rowMode,
        onRowSave: props.onRowSave,
        onRowAdd: props.onRowAdd,
        newRow: props.newRow,
        onRowDelete: props.onRowDelete,
        select: selectable ? (row, range) => hook.pick(hook.rowKey(row), range) : undefined,
        selectAll: selectable
          ? () => {
              if (!hook.publicSnapshot.selection.allSelected) hook.pickAll();
            }
          : undefined,
        report: props.onCurrentRowChange && ((row) => props.onCurrentRowChange!(hook.rowKey(row), row)),
      })
    : undefined;
  return { lines: gridLinesNow, fresh, ids: gridIds, events };
}
