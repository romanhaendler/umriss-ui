/* A body row and its cells: the selection box, the expander, a grouped row's
   span, the value cells, the actions cell and the detail line beneath. */

import { useContext } from "react";
import type { CSSProperties, ReactNode } from "react";
import { AngleGlyph, Checkbox } from "@umriss-ui/core";
import type { FlatteningEntry, Formats, Wording } from "@umriss-ui/core";
import { cx } from "./cx";
import type { HookSnapshot, Registry, ColumnEntry } from "./registry";
import type { TableProps } from "./types";
import { asText, isAbsent, isRightAligned } from "./values";
import type { Line } from "./model/grouping";
import { SpanCell } from "./groupLines";
import { Absent } from "./aggregateValue";
import { pinnedCell } from "./pinned";
import type { PinnedCell } from "./pinned";
import type { PinBlocks } from "./model/pinning";
import { rowLine } from "./model/gridWalk";
import { CellEditor, GridContext, NEW_LINE, useCellEditor } from "./grid";
import { RowActionsCell, RowDraftButtons } from "./rowActions";
import { TreeCellContent, detailOf } from "./tree";
import type { TreeDetail, TreeSetup } from "./tree";
import { TabStopContext } from "./virtualBody";
import styles from "./Table.module.css";

/** The name of a row: the text of its row header. Without a row header its key
    - better than a box that says "not selected". */
export function rowName(
  row: unknown,
  header: ColumnEntry | undefined,
  hook: HookSnapshot,
  formats: Formats,
  wording: Wording,
): string {
  if (!header) return hook.rowKey(row);
  const value = header.read(row);
  if (isAbsent(value)) return wording.cellAbsentValue;
  return asText(value, header.spec.format, formats, wording) ?? hook.rowKey(row);
}

/* ====================================================================== */
/* Row, cell, footer cell                                                   */
/* ====================================================================== */

export function Row({
  row,
  index,
  absolute,
  registry,
  hook,
  columns,
  header,
  selectable,
  actions,
  blocks,
  columnCount,
  rowProps,
  baseId,
  formats,
  wording,
  line,
  tree,
  spanEntry,
  grid,
  trailing,
  fresh = false,
}: {
  /** Tree rows: where the row stands in the tree. */
  tree?: TreeSetup;
  row: unknown;
  /** Grid mode: the cells are the stops, not the row. */
  grid: boolean;
  /** The actions column stands - the row actions, a Row draft's buttons, Delete. */
  trailing: boolean;
  /** A new row (ADR-0036): no key yet, nothing to select, expand or delete. */
  fresh?: boolean;
  index: number;
  absolute: number | undefined;
  registry: Registry;
  hook: HookSnapshot;
  columns: readonly ColumnEntry[];
  /** In a grouped table: the row's line, whose span stands first. */
  line?: Extract<Line<unknown>, { kind: "row" }>;
  spanEntry?: ColumnEntry;
  header: ColumnEntry | undefined;
  selectable: boolean;
  actions: ReturnType<Registry["actions"]["ordered"]>;
  blocks: PinBlocks;
  columnCount: number;
  rowProps: TableProps<unknown>["rowProps"];
  baseId: string;
  formats: Formats;
  wording: Wording;
}) {
  const tabStop = useContext(TabStopContext);
  const snapshot = hook.publicSnapshot;
  const key = fresh ? NEW_LINE : hook.rowKey(row);
  const name = fresh ? wording.newRow : rowName(row, header, hook, formats, wording);
  const gridLine = fresh ? NEW_LINE : rowLine(key);
  const editing = useContext(GridContext)?.editing;
  const draft = editing?.row === true && editing.line === gridLine;
  const detail = registry.detail;
  const entry = fresh ? undefined : tree?.entry(row);
  const shownDetail = fresh ? null : detailOf(registry, snapshot, row, key, entry);
  const hasDetail = shownDetail !== null;
  const open = shownDetail?.open ?? false;
  const detailContent = shownDetail?.content;
  const detailId = `${baseId}-detail-${index}`;
  const { className: rowClass, ...data } = rowProps?.(row) ?? {};

  const virtual = absolute !== undefined;
  const group = line ? (line.span ?? line.parents.at(-1))! : undefined;
  const expanderColumn = detail !== null && !tree;
  const controls = (selectable ? 1 : 0) + (expanderColumn ? 1 : 0);
  const leading = controls + (spanEntry ? 1 : 0);
  const pinAt = (at: number) => pinnedCell(blocks, at);
  const opens = entry !== undefined && entry.branch && !entry.empty;

  return (
    <>
      <tr
        {...data}
        className={cx(
          rowClass,
          virtual && styles.virtualRow,
          entry && styles.treeRow,
          opens && styles.branchRow,
          entry?.pathOnly && styles.pathRow,
        )}
        data-before-root={entry && !open && tree?.beforeRoot(key) ? "" : undefined}
        data-row={virtual ? absolute : undefined}
        data-line={line ? "row" : undefined}
        data-motion={key}
        data-selected={selectable && snapshot.selection.isSelected(key) ? "" : undefined}
        data-group-first={line?.first ? "" : undefined}
        data-group={group?.path}
        aria-level={line ? line.parents.length + 1 : entry ? entry.level + 1 : undefined}
        aria-posinset={group ? group.rows.indexOf(row) + 1 : entry?.position}
        aria-setsize={group ? group.rows.length : entry?.siblings}
        aria-expanded={opens ? entry.expanded : undefined}
        data-branch={opens ? (entry.expanded ? "open" : "closed") : undefined}
        tabIndex={virtual && !grid ? (absolute === tabStop ? 0 : -1) : undefined}
        data-grid-line={grid ? gridLine : undefined}
        data-draft={draft ? "" : undefined}
        data-even={virtual && absolute % 2 === 1 ? "" : undefined}
        aria-rowindex={virtual ? absolute + 2 : undefined}
      >
        {fresh && Array.from({ length: controls + (spanEntry ? 1 : 0) }, (_, i) => (
          <td key={i} className={cx(styles.td, i < controls && styles.control, pinAt(i).className)} style={pinAt(i).style} />
        ))}
        {!fresh && selectable && (
          <td className={cx(styles.td, styles.control, pinAt(0).className)} style={pinAt(0).style}>
            <Checkbox
              aria-label={wording.selectRow(name)}
              checked={snapshot.selection.isSelected(key)}
              onChange={() => snapshot.selection.toggle(key)}
            />
          </td>
        )}
        {!fresh && expanderColumn && (
          <td className={cx(styles.td, styles.control, pinAt(controls - 1).className)} style={pinAt(controls - 1).style}>
            {hasDetail && (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={open ? detailId : undefined}
                aria-label={open ? wording.collapseRowNamed(name) : wording.expandRowNamed(name)}
                className={cx(styles.expander, open && styles.expanderOpen)}
                onClick={() => snapshot.toggleRow(key)}
              >
                <AngleGlyph />
              </button>
            )}
          </td>
        )}
        {line && line.span && (
          <SpanCell
            line={{ ...line, span: line.span }}
            entry={spanEntry}
            selectable={selectable}
            pin={pinAt(controls)}
            hook={hook}
            formats={formats}
            wording={wording}
          />
        )}
        {columns.map((e, i) => (
          <Cell
            key={e.key}
            entry={e}
            row={row}
            kind={registry.kindOf(e, hook.rows)}
            pin={pinAt(leading + i)}
            formats={formats}
            wording={wording}
            line={gridLine}
            rowName={name}
            width={snapshot.widths[e.spec.id]}
            tree={
              entry && e === tree?.column
                ? { setup: tree, entry, detail: hasDetail && !opens ? { open, toggle: () => snapshot.toggleRow(key) } : undefined }
                : undefined
            }
          />
        ))}
        {trailing && (
          <ActionsTd
            draft={draft}
            actions={fresh ? [] : actions}
            row={row}
            name={name}
            wording={wording}
            line={gridLine}
            pin={pinAt(columnCount - 1)}
          />
        )}
      </tr>
      {open && (
        <DetailRow
          id={detailId}
          group={group?.path}
          gridLine={grid ? `detail:${key}` : undefined}
          beforeRoot={entry && tree?.beforeRoot(key) ? "" : undefined}
          colSpan={columnCount}
          entry={entry}
        >
          {detailContent}
        </DetailRow>
      )}
    </>
  );
}

/* The row's last cell; a Row draft's buttons stand in it, and what the row
   carries at rest holds its height, unseen, under them. */
function ActionsTd({
  draft,
  actions,
  row,
  name,
  wording,
  line,
  pin,
}: {
  draft: boolean;
  actions: ReturnType<Registry["actions"]["ordered"]>;
  row: unknown;
  name: string;
  wording: Wording;
  line: string;
  pin: PinnedCell;
}) {
  return (
    <td className={cx(styles.td, styles.actionsCell, pin.className, draft && styles.editing)} style={pin.style}>
      {draft ? (
        <>
          <RowDraftButtons name={name} wording={wording} />
          {/* What the row carries at rest holds its height, unseen, under the draft's buttons. */}
          <span className={styles.held} aria-hidden="true">
            <RowActionsCell actions={actions} row={row} name={name} wording={wording} line={line} />
          </span>
        </>
      ) : (
        <RowActionsCell actions={actions} row={row} name={name} wording={wording} line={line} />
      )}
    </td>
  );
}

/* The line under an open row that holds its detail; in a tree it hangs on the
   row's level. */
function DetailRow({
  id,
  group,
  gridLine,
  beforeRoot,
  colSpan,
  entry,
  children,
}: {
  id: string;
  group: string | undefined;
  gridLine: string | undefined;
  beforeRoot: string | undefined;
  colSpan: number;
  entry: FlatteningEntry<unknown> | undefined;
  children: ReactNode;
}) {
  return (
    <tr id={id} className={styles.detailRow} data-group={group} data-grid-line={gridLine} data-before-root={beforeRoot}>
      <td
        colSpan={colSpan}
        className={cx(styles.detailCell, entry && styles.treeDetail)}
        style={entry ? ({ "--_table-tree-level": entry.level } as CSSProperties) : undefined}
      >
        {entry ? <div className={styles.treeDetailRail}>{children}</div> : children}
      </td>
    </tr>
  );
}

function Cell({
  entry,
  row,
  kind,
  pin,
  formats,
  wording,
  line,
  rowName,
  tree,
  width,
}: {
  /** Tree rows: this cell carries the indent and the fold. */
  tree?: { setup: TreeSetup; entry: FlatteningEntry<unknown>; detail?: TreeDetail };
  entry: ColumnEntry;
  row: unknown;
  kind: ReturnType<Registry["kindOf"]>;
  pin: PinnedCell;
  formats: Formats;
  wording: Wording;
  /** The line the cell stands in - what an edit names it by. */
  line: string;
  /** The row's name, for its editor's. */
  rowName: string;
  /** The column's width - given, dragged or fitted: its value is that wide,
      never wider and never narrower. */
  width: number | undefined;
}) {
  const { spec } = entry;
  const value = entry.read(row);
  const rightAligned = isRightAligned(kind, spec.rightAligned);
  const editor = useCellEditor(line, spec.id);
  /* A cell that edits says so under the pointer (ADR-0036): a text cursor over
     what is typed, a pointer over what is picked. */
  const gridMode = useContext(GridContext) !== null;
  const editKind = !gridMode || spec.edit === undefined ? undefined : spec.edit === "text" || spec.edit === "number" ? "type" : "pick";

  let content: ReactNode;
  if (isAbsent(value)) {
    /* children is not called for an absent value - that is what its parameter
       is typed without null for. */
    content = <Absent wording={wording} />;
  } else if (spec.presentation) {
    content = (spec.presentation as (w: unknown, z: unknown) => ReactNode)(value, row);
  } else {
    content = asText(value, spec.format, formats, wording);
  }
  /* One line, whatever the value is (ADR-0042): the box neither wraps nor
     grows the row, and what does not fit ends in an ellipsis that the tip
     completes. Beneath an editor it stays, unseen, to hold the cell's size. */
  const text = typeof content === "string";
  content = (
    <div
      className={cx(styles.value, text && styles.valueText, width !== undefined && styles.sized, editor && styles.editingValue)}
      /* Contained, the box answers the layout with the column's width less its
         cell's padding (Table.module.css, `.sized`): the value neither widens
         the column nor lets a narrow page squeeze it. */
      style={width !== undefined ? ({ "--_table-width": `${width}px` } as CSSProperties) : undefined}
      aria-hidden={editor ? true : undefined}
    >
      {content}
    </div>
  );
  if (tree) content = <TreeCellContent {...tree} name={rowName} wording={wording}>{content}</TreeCellContent>;

  const Tag = spec.rowHeader ? "th" : "td";
  return (
    <Tag
      scope={spec.rowHeader ? "row" : undefined}
      className={cx(styles.td, rightAligned && styles.numeric, spec.rowHeader && styles.rowHeader, pin.className, editor && styles.editing)}
      style={pin.style}
      data-edit={editKind}
      data-editing={editor ? spec.id : undefined}
    >
      {editor && <CellEditor entry={entry} row={row} rowName={rowName} grid={editor} />}
      {content}
    </Tag>
  );
}
