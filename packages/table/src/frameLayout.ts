/* What the frame works out of the registry each render before it draws: the
   columns that stand in the body, the grouping's span, the tree, the count of
   cells in a line and the pinned blocks. Reads, writes nothing. */

import type { FlatteningEntry } from "@umriss-ui/core";
import { visibleColumns } from "./export";
import type { HookSnapshot, Registry } from "./registry";
import type { TableProps } from "./types";
import type { PinBlocks } from "./model/pinning";
import { lineCount } from "./model/tableModel";
import { buildTree } from "./tree";
import type { TreeSetup } from "./tree";

/** The attribute a line carries in grid mode, which the arrows walk by. */
export const lineKey = (gridMode: boolean, key: string) => (gridMode ? key : undefined);

export type FrameLayout = ReturnType<typeof frameLayout>;

export function frameLayout({
  registry,
  hook,
  props,
  drafting,
  sticking,
}: {
  registry: Registry;
  hook: HookSnapshot;
  props: TableProps<unknown>;
  /** A Row draft is open. */
  drafting: boolean;
  /** Which pinned blocks stick in the width the scroll area has. */
  sticking: { start: boolean; end: boolean };
}) {
  const { selectable = false, loading = false, grid: gridMode = false } = props;
  const snapshot = hook.publicSnapshot;
  const projection = registry.projection();
  const header = registry.rowHeader();
  /* Pinned columns stand in blocks at either end - a sticky column in the
     middle would stick at a place from which it wanders over its neighbours
     while scrolling. That is decided in the registry, so that column menu and
     export show the same order. */
  const columns = visibleColumns(registry);

  const detail = registry.detail;
  const actions = registry.hasRowActions() ? registry.actions.ordered() : [];
  const virtual = hook.tableState.virtual;

  /* Grouped (ADR-0029): the innermost grouped column or group key stands first
     as the span; the outer grouped columns leave the body - their value stands
     in the group header. */
  const grouping = snapshot.grouping;
  const lines = grouping.length > 0 ? projection.visibleLines : undefined;
  const groupingEntries = lines ? registry.groupingEntries(hook.rows) : [];
  const entryOf = (id: string | undefined) => groupingEntries.find((e) => e.spec.id === id);
  const spanEntry = lines && grouping.length > 1 ? entryOf(grouping.at(-1)) : undefined;
  const dataColumns = lines ? columns.filter((e) => !grouping.includes(e.spec.id)) : columns;

  /* Tree rows: the first visible column carries the tree,
     wherever the row header stands - the structure reads down the left edge,
     as a grouping's span stands first. The flattening is the whole list, also
     under a virtual window: a row's parent and siblings may stand outside it. */
  const entries: readonly FlatteningEntry<unknown>[] | undefined = projection.entries;
  const tree: TreeSetup | undefined = entries ? buildTree(entries, hook, snapshot, dataColumns[0]) : undefined;

  /* A tree opens a row's detail with the row's own fold:
     one chevron per row, in the first column at its level - no expander
     column. */
  const expanderColumn = detail !== null && !entries;
  const controlColumns = (selectable ? 1 : 0) + (expanderColumn ? 1 : 0);
  const leading = controlColumns + (spanEntry ? 1 : 0);
  /* A grid that saves rows, adds or deletes them carries their buttons in the
     actions column, pinned at the end: a Save far off to the right, scrolled
     out of view, would be a draft nobody can finish (ADR-0036). */
  const rowMode = gridMode && props.editMode === "row";
  const rowTools = gridMode && (rowMode || props.onRowAdd !== undefined || props.onRowDelete !== undefined);
  const trailing = actions.length > 0 || rowTools;
  const columnCount = leading + dataColumns.length + (trailing ? 1 : 0);
  /* A `ColumnGroup` adds a head row: ARIA row numbers and the footer count it. */
  const headRows = dataColumns.some((e) => e.spec.heading) ? 2 : 1;

  /* The pinned blocks, in cells of the head row. Whatever stands before a
     pinned column sticks with it - the selection, the expander and the span;
     otherwise the pinned column would stick over the gap they leave - and the
     row actions stick behind the end block. */
  const pins = registry.pins();
  const startPinned = dataColumns.filter((e) => pins[e.spec.id] === "start").length;
  const endPinned = dataColumns.filter((e) => pins[e.spec.id] === "end").length;
  const spanPinned = spanEntry !== undefined && pins[spanEntry.spec.id] === "start";
  /* The actions column sticks at the end as a block of its own, so a narrow table does not cut
     its last button. An actions column that holds nothing at rest - a Row
     draft's buttons, no Delete, no action - sticks only while a draft is
     open: pinned blank, it would take much of a narrow table. Its width is reserved either way, so
     sticking moves nothing. `RowActions pin={false}` leaves it in the flow,
     where the application finds its place too narrow - except for an open
     Row draft's Save (ADR-0036). */
  const toolsShow = actions.length > 0 || props.onRowDelete !== undefined || drafting;
  const toolsStick = registry.actionsPinned() ? toolsShow : drafting && rowTools;
  const pinned: PinBlocks = {
    start: startPinned > 0 || spanPinned ? leading + startPinned : 0,
    end: endPinned > 0 ? endPinned + (trailing ? 1 : 0) : trailing && toolsStick ? 1 : 0,
    count: columnCount,
  };
  /* A block the narrow table has no room for scrolls with the rest; the pin
     itself stays, and sticks again once the table is wide enough. An open
     Row draft keeps its Save in view regardless (ADR-0036). */
  const blocks: PinBlocks = {
    start: sticking.start ? pinned.start : 0,
    end: sticking.end || (drafting && rowTools) ? pinned.end : 0,
    count: columnCount,
  };

  const rows = projection.visible;
  /* ARIA numbers the rows of the whole set, not of the slice standing in the
     document: a virtual window or a page. Without either the document holds
     them all and the browser counts. */
  const paged = registry.paginates() && !virtual && !entries;
  const numbered = virtual !== undefined || paged;
  const rowTotal = snapshot.server ? snapshot.rowCount : lineCount(projection);
  const first = projection.visibleLines?.find((l) => l.kind !== "header" || !l.continued);
  const pageStart = !paged
    ? 0
    : projection.lines && first
      ? Math.max(0, projection.lines.findIndex((l) => l === first || (l.kind === "row" && first.kind === "row" && l.row === first.row)))
      : (projection.page - 1) * snapshot.pageSize;
  /* In server mode the aggregates would be the page's, standing where the
     filtered set's belong - the footer shows the server's totals, or none; under
     an error the totals are the old request's, so none. */
  const footerShown = (snapshot.server ? hook.totals !== undefined && hook.error === undefined : !loading) && dataColumns.some((e) => e.spec.aggregate);
  const restricted = snapshot.search !== "" || Object.keys(snapshot.filter).length > 0;

  return {
    snapshot,
    projection,
    header,
    detail,
    actions,
    virtual,
    grouping,
    lines,
    entryOf,
    spanEntry,
    dataColumns,
    entries,
    tree,
    expanderColumn,
    controlColumns,
    leading,
    rowMode,
    rowTools,
    trailing,
    columnCount,
    headRows,
    numbered,
    rowTotal,
    pageStart,
    pins,
    pinned,
    blocks,
    rows,
    footerShown,
    totals: snapshot.server ? hook.totals : undefined,
    busy: loading,
    restricted,
  };
}
