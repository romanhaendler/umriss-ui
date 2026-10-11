/* The frame's grid wiring for one render (ADR-0034): the lines the arrows
   walk with a new row spliced in, the head row's column ids, and the
   handlers over them. Not a hook - it runs after the frame's early return. */

import type { HookSnapshot, Registry } from "./registry";
import type { TableProps } from "./types";
import { gridLines } from "./model/gridWalk";
import { NEW_LINE, gridHandlers } from "./grid";
import type { GridHandle } from "./grid";
import type { FrameLayout } from "./frameLayout";
import { openDetails } from "./tree";

export function frameGrid({
  registry,
  hook,
  props,
  layout,
  grid,
}: {
  registry: Registry;
  hook: HookSnapshot;
  props: TableProps<unknown>;
  layout: FrameLayout;
  grid: GridHandle;
}) {
  const { selectable = false, loading = false, grid: gridMode = false } = props;
  const { snapshot, projection, virtual, lines, spanEntry, dataColumns, expanderColumn, controlColumns, trailing, blocks, rows, footerShown } = layout;

  /* Grid mode (ADR-0034): every line the arrows walk - all of them, the ones a
     virtual window leaves unrendered as well - and the head row's columns. */
  const gridLinesNow = gridMode
    ? gridLines({
        layout: { controls: controlColumns, span: spanEntry !== undefined, aggregates: dataColumns.map((e) => e.spec.aggregate !== undefined), actions: trailing, blocks },
        body: loading ? { rows: [] } : lines ? { lines: virtual ? projection.lines! : lines } : { rows: virtual ? (projection.shown ?? projection.filtered) : rows },
        rowKey: hook.rowKey,
        expanded: layout.detail ? openDetails(registry, snapshot, projection.shown ?? projection.filtered, hook.rowKey, layout.tree) : new Set(),
        foot: footerShown,
      })
    : [];
  /* A new row stands above the body's rows, whatever the sort, the filter or
     the page - the walk finds it right beneath the head. */
  const fresh = grid.state.editing?.line === NEW_LINE ? grid.state.editing : null;
  if (fresh && gridLinesNow[0]) gridLinesNow.splice(1, 0, { key: NEW_LINE, cells: gridLinesNow[0].cells, at: -1, row: fresh.fresh });

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
        select: selectable ? (row) => snapshot.selection.toggle(hook.rowKey(row)) : undefined,
      })
    : undefined;
  return { lines: gridLinesNow, fresh, ids: gridIds, events };
}
