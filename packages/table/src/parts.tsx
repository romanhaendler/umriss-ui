/* The parts the hook hands out: Table, Column, RowDetail, RowActions, Action.
   They come into being ONCE per hook call and keep their identity - a new
   identity per render would remount every column (Ticket 02). The state of the
   table they read from the registry, which the hook writes on every pass.

   The table renders its rows itself. Because everything that makes up a column
   stands in one element, it applies hiding and reordering to header, body and
   footer at once - the error this package exists for (reordered in the model,
   left standing on screen) can no longer be written that way. */

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";
import {
  AngleGlyph,
  Button,
  Checkbox,
  ControlSizeProvider,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  VisuallyHidden,
  useDensityFor,
  useFormats,
  usePortalTarget,
  useWording,
} from "@umriss-ui/core";
import type { FlatteningEntry, Formats, VirtualRows, Wording } from "@umriss-ui/core";
import { cx } from "./cx";
import { DEV, warnOnce } from "./dev";
import { ColumnFilterButton } from "./filter";
import { NewRowButton, TableToolbar } from "./toolbar";
import { filterOf } from "./columnFilter";
import { TableContext } from "./context";
import type { TableContextValue } from "./context";
import type { HookSnapshot, Registry, ColumnSpec, ColumnEntry } from "./registry";
import { link } from "./registry";
import { resetSearchAndFilters, visibleColumns } from "./export";
import type { TableProps, TableSnapshot } from "./types";
import { asText, isAbsent, isRightAligned } from "./values";
import { withContinuation } from "./model/grouping";
import type { Line } from "./model/grouping";
import { FoldMark, GroupLine, SpanCell } from "./groupLines";
import { Absent, AggregateValue, aggregateIsNumeric } from "./aggregateValue";
import { useLineMotion } from "./motion";
import { NOT_PINNED, pinnedCell } from "./pinned";
import type { PinnedCell } from "./pinned";
import { blocksThatStick } from "./model/pinning";
import type { PinBlocks } from "./model/pinning";
import { gridLines, rowLine } from "./model/gridWalk";
import { CellEditor, GridContext, GridFocus, NEW_LINE, gridHandlers, useCellEditor, useGridState } from "./grid";
import styles from "./Table.module.css";

/* The props as they arrive at runtime. The types at the call site (types.ts) are
   stricter; here only what is there counts. */
interface RuntimeColumnProps {
  id?: string;
  value: string | ((row: never) => unknown);
  label: string;
  children?: unknown;
  format?: ColumnSpec["format"];
  aggregate?: ColumnSpec["aggregate"];
  /** The old name of `aggregate`. */
  footer?: "sum" | "avg";
  share?: boolean;
  rowHeader?: boolean;
  numeric?: boolean;
  width?: number;
  pin?: ColumnSpec["pin"];
  resizable?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  filter?: ColumnSpec["filter"];
  sortValue?: (value: never) => unknown;
  exportValue?: (value: never) => unknown;
  groupValue?: (value: never) => unknown;
  group?: ColumnSpec["group"];
  groupable?: boolean;
  edit?: ColumnSpec["edit"];
  editOptions?: readonly unknown[];
  validate?: ColumnSpec["validate"];
}

interface RuntimeGroupByProps {
  id?: string;
  value: string | ((row: never) => unknown);
  label: string;
  groupValue?: (value: never) => unknown;
  group?: ColumnSpec["group"];
}

interface RuntimeActionProps {
  children: string;
  bulk?: boolean;
  tone?: "default" | "danger";
  onSelect: (target: never) => void;
}

export interface Parts {
  Table: (props: TableProps<unknown>) => ReactNode;
  Column: (props: RuntimeColumnProps) => ReactNode;
  RowDetail: (props: { children: (row: never) => ReactNode }) => ReactNode;
  RowActions: (props: { children: ReactNode }) => ReactNode;
  Action: (props: RuntimeActionProps) => ReactNode;
  GroupBy: (props: RuntimeGroupByProps) => ReactNode;
}

function specFrom(props: RuntimeColumnProps): ColumnSpec {
  const field = typeof props.value === "string" ? props.value : undefined;
  let id = props.id ?? field;
  if (id === undefined) {
    warnOnce(`without-id:${props.label}`, `The column "${props.label}" has a computed value but no id. Its label serves as the id.`);
    id = props.label;
  }
  if (props.footer !== undefined) {
    warnOnce(`footer:${id}`, `The column "${id}" uses \`footer\`, which is called \`aggregate\` now. The old name goes with the next minor version.`);
  }
  if (props.children !== undefined && typeof props.children !== "function") {
    warnOnce(`children:${id}`, `The children of the column "${id}" are not a function and are passed over.`);
  }
  return {
    id,
    label: props.label,
    value: props.value,
    presentation: typeof props.children === "function" ? (props.children as ColumnSpec["presentation"]) : undefined,
    format: props.format,
    aggregate: props.aggregate ?? props.footer,
    share: props.share,
    rowHeader: props.rowHeader === true,
    rightAligned: props.numeric,
    width: props.width,
    pin: props.pin === "start" || props.pin === "end" ? props.pin : undefined,
    resizable: props.resizable === true,
    sortable: props.sortable,
    searchable: props.searchable,
    filter: props.filter,
    ownSortValue: props.sortValue,
    ownExportValue: props.exportValue,
    ownGroupValue: props.groupValue,
    group: props.group,
    groupable: props.groupable,
    edit: props.edit,
    editOptions: props.editOptions,
    validate: props.validate,
  };
}

/** The name of a row: the text of its row header. Without a row header its key
    - better than a box that says "not selected". */
function rowName(
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

export function buildParts(registry: Registry): Parts {
  /* ---------------------------------------------------------------- Column */

  function Column(props: RuntimeColumnProps): ReactNode {
    const key = useId();
    const surrounding = useContext(TableContext);
    const spec = specFrom(props);
    // Writes idempotently (registry.ts, guarantee 1).
    registry.registerColumn(key, spec);

    useLayoutEffect(
      () => () => {
        registry.removeColumn(key);
        registry.commit();
      },
      [key],
    );
    useLayoutEffect(() => {
      registry.ensureColumn(key, spec);
      registry.checkOrder();
      registry.commit();
    });

    if (DEV && surrounding && surrounding.registry !== registry) {
      warnOnce(
        `foreign:${spec.id}`,
        `The column "${spec.id}" comes from a different useTable call than the table it stands in. It reads the rows of its own hook.`,
      );
    }
    return <span hidden data-umriss-column={key} />;
  }

  /* ------------------------------------------------------------- RowDetail */

  function RowDetail({ children }: { children: (row: never) => ReactNode }): ReactNode {
    const key = useId();
    registry.registerDetail(key, children);
    useLayoutEffect(
      () => () => {
        registry.removeDetail(key);
        registry.commit();
      },
      [key],
    );
    useLayoutEffect(() => {
      if (!registry.detail) registry.registerDetail(key, children);
      registry.commit();
    });
    return null;
  }

  /* ------------------------------------------------------ RowActions, Action */

  function RowActions({ children }: { children: ReactNode }): ReactNode {
    const key = useId();
    registry.registerActionGroup(key);
    useLayoutEffect(
      () => () => {
        registry.removeActionGroup(key);
        registry.commit();
      },
      [key],
    );
    useLayoutEffect(() => {
      registry.registerActionGroup(key);
      registry.commit();
    });
    return <>{children}</>;
  }

  function Action(props: RuntimeActionProps): ReactNode {
    const key = useId();
    const spec = {
      label: props.children,
      bulk: props.bulk === true,
      tone: props.tone ?? "default",
      onSelect: props.onSelect,
    } as const;
    registry.registerAction(key, spec);
    useLayoutEffect(
      () => () => {
        registry.removeAction(key);
        registry.commit();
      },
      [key],
    );
    useLayoutEffect(() => {
      registry.ensureAction(key, spec);
      registry.checkOrder();
      registry.commit();
    });
    return <span hidden data-umriss-action={key} />;
  }

  /* --------------------------------------------------------------- GroupBy */

  function GroupBy(props: RuntimeGroupByProps): ReactNode {
    const key = useId();
    const field = typeof props.value === "string" ? props.value : undefined;
    const id = props.id ?? field ?? props.label;
    const spec: ColumnSpec = {
      id,
      label: props.label,
      value: props.value,
      rowHeader: false,
      resizable: false,
      ownGroupValue: props.groupValue,
      group: props.group,
      groupable: true,
    };
    // Writes idempotently (registry.ts, guarantee 1).
    registry.registerGroupKey(key, spec);
    useLayoutEffect(
      () => () => {
        registry.removeGroupKey(key);
        registry.commit();
      },
      [key],
    );
    useLayoutEffect(() => {
      registry.ensureGroupKey(key, spec);
      registry.checkOrder();
      registry.commit();
    });
    return <span hidden data-umriss-groupkey={key} />;
  }

  /* ----------------------------------------------------------------- Table */

  function Table(props: TableProps<unknown>): ReactNode {
    // All idempotent (registry.ts, guarantee 1).
    registry.beginPass();
    registry.setStickyRowHeader(props.stickyRowHeader === true);
    registry.setTableGroupable(props.groupable !== false);
    registry.setRowAdding(props.grid === true && props.onRowAdd !== undefined);
    if (registry.manual && props.groupable === true) {
      warnOnce("manual-groupable", "`groupable` is passed over in manual mode: the groups would be the page's, not the server's.");
    }
    const childrenRef = useRef<HTMLDivElement>(null);
    const [footerTarget, setFooterTarget] = useState<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
      registry.children = childrenRef.current;
      registry.checkOrder();
      registry.commit();
    });

    const contextValue = useMemo<TableContextValue>(() => ({ registry, footerTarget }), [footerTarget]);

    return (
      <TableContext.Provider value={contextValue}>
        <div className={cx(styles.frame, props.className)}>
          <div ref={childrenRef} className={styles.children}>
            {props.children}
          </div>
          {/* After the children: toolbar and frame read the columns that
              registered in this pass - and the toolbar knows whether a table
              toolbar already stood among them. */}
          <OwnToolbar registry={registry} />
          <Frame registry={registry} props={props} />
          <div ref={setFooterTarget} className={styles.footerTarget} />
        </div>
      </TableContext.Provider>
    );
  }

  const parts: Parts = { Table, Column, RowDetail, RowActions, Action, GroupBy };
  link(Table, registry);
  return parts;
}

/* The table toolbar the table puts up itself when it has a search or a column
   filter and no toolbar stands (table-filters 04). It carries only conditions,
   the ratio and the way back. */
function OwnToolbar({ registry }: { registry: Registry }) {
  useSyncExternalStore(registry.subscribe, registry.bodyVersion, registry.bodyVersion);
  if (!registry.hook || !registry.needsOwnToolbar()) return null;
  return <TableToolbar registry={registry} own />;
}

/* ====================================================================== */
/* The frame: scroll area and <table>                                       */
/* ====================================================================== */

function Frame({ registry, props }: { registry: Registry; props: TableProps<unknown> }) {
  const {
    selectable = false,
    stickyHeader = false,
    striped = false,
    density,
    maxHeight,
    empty,
    loading = false,
    rowProps,
    ariaLabel,
    grid: gridMode = false,
  } = props;

  useSyncExternalStore(registry.subscribe, registry.bodyVersion, registry.bodyVersion);
  const wording = useWording();
  const formats = useFormats();
  const resolvedDensity = useDensityFor(density, "regular");
  const baseId = useId();
  const tableRef = useRef<HTMLTableElement>(null);
  /* How many lines a page of the table last held - what an empty result and
     placeholders keep the height of (ADR-0042). */
  const heldLines = useRef(0);
  const grid = useGridState();
  /* Which pinned blocks stick in the width the scroll area has - measured
     (`PinPlacement`, `blocksThatStick`). */
  const [sticking, setSticking] = useState({ start: true, end: true });

  /* A row gone from the rows takes its draft with it (ADR-0036) - nothing is
     left to report it against. */
  const draftLine = grid.state.editing?.line;
  useLayoutEffect(() => {
    const hook = registry.hook;
    if (!hook || draftLine === undefined || draftLine === NEW_LINE) return;
    if (!hook.rows.some((row) => rowLine(hook.rowKey(row)) === draftLine)) grid.setState((s) => ({ ...s, editing: null }));
  });

  /* Sticky group headers stand below the head and below one another; how high those
     are only the layout knows. Measured after every render - a density or a
     font changes them. */
  useLayoutEffect(() => {
    const table = tableRef.current;
    if (table?.parentElement && !stickyHeader) table.parentElement.style.removeProperty("scroll-padding-top");
    if (!table || !stickyHeader) return;
    const head = table.tHead?.getBoundingClientRect().height ?? 0;
    const headerHeight = table.querySelector("tr[data-line='header']")?.getBoundingClientRect().height ?? 0;
    table.style.setProperty("--u-table-head", `${head}px`);
    table.style.setProperty("--u-table-group-header", `${headerHeight}px`);
    /* The browser's own scroll into view - a focused cell, a walked one -
       keeps what it brings in clear of the head (table-grid-mode 05). */
    table.parentElement?.style.setProperty("scroll-padding-top", `${head}px`);
    /* A virtual window draws its group headers anew as it scrolls: marked again after
       every render, not only on the scroll. */
    if (table.parentElement) markStuck(table.parentElement);
  });

  /* A fold that took away the focused element hands the focus to the fold of
     the innermost group around it that still stands: its folded line or its
     header. A focus the fold left standing stays where it is. */
  useLayoutEffect(() => {
    const noted = registry.takeFocusBeforeFold();
    const table = tableRef.current;
    if (!noted || !table || noted.table !== table || noted.element.isConnected) return;
    const folds = Array.from(table.querySelectorAll<HTMLButtonElement>("[data-fold-path]"));
    const keys = JSON.parse(noted.group) as unknown[];
    for (let n = keys.length; n > 0; n--) {
      const path = JSON.stringify(keys.slice(0, n));
      const fold = folds.find((b) => b.dataset.foldPath === path);
      if (fold) return fold.focus();
    }
  });

  /* Manual mode (M2): placeholders that stand where a page of rows stood
     keep its columns' widths - the columns of an automatic layout would
     shift to the placeholders' while the answer is out. Their height is the
     pitch's (ADR-0042). Measured from the rendered rows, since only the
     layout knows them. */
  const previousWidths = useRef<number[] | null>(null);
  useLayoutEffect(() => {
    const body = tableRef.current?.tBodies[0];
    if (!body || !registry.manual) return;
    if (!loading) {
      const first = body.querySelector<HTMLTableRowElement>(":scope > tr[data-motion]");
      if (first) previousWidths.current = Array.from(first.cells, (cell) => cell.getBoundingClientRect().width);
      return;
    }
    const widths = previousWidths.current;
    const first = body.rows[0];
    if (widths && first?.cells.length === widths.length) {
      Array.from(first.cells).forEach((cell, i) => (cell.style.width = `${widths[i]}px`));
    }
  });

  /* Regrouping and folding move the lines that stay; a virtual window does
     not - its rows come and go with the scroll. */
  const moving = registry.hook && !registry.hook.companion.virtual ? registry.hook.publicSnapshot : null;
  useLineMotion(tableRef, moving ? `${moving.grouping.join("|")}#${moving.folded.join("|")}` : "");

  const hook = registry.hook;
  if (!hook) return null;

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
  const virtual = hook.companion.virtual;

  /* Grouped (ADR-0029): the innermost grouped column or group key stands first
     as the span; the outer grouped columns leave the body - their value stands
     in the group header. */
  const grouping = snapshot.grouping;
  const lines = grouping.length > 0 ? projection.visibleLines : undefined;
  const groupingEntries = lines ? registry.groupingEntries(hook.rows) : [];
  const entryOf = (id: string | undefined) => groupingEntries.find((e) => e.spec.id === id);
  const spanEntry = lines && grouping.length > 1 ? entryOf(grouping.at(-1)) : undefined;
  const dataColumns = lines ? columns.filter((e) => !grouping.includes(e.spec.id)) : columns;

  /* Tree rows (table-tree-rows): the first visible column carries the tree,
     wherever the row header stands - the structure reads down the left edge,
     as a grouping's span stands first. The flattening is the whole list, also
     under a virtual window: a row's parent and siblings may stand outside it. */
  const entries = projection.entries;
  let tree: TreeSetup | undefined;
  if (entries) {
    const byKey = new Map<string, FlatteningEntry<unknown>>();
    const parentOf = new Map<string, string | undefined>();
    const beforeRoot = new Set<string>();
    const path: string[] = [];
    entries.forEach((entry, i) => {
      byKey.set(entry.key, entry);
      path.length = entry.level;
      parentOf.set(entry.key, path.at(-1));
      path.push(entry.key);
      if (entries[i + 1]?.level === 0) beforeRoot.add(entry.key);
    });
    tree = {
      column: dataColumns[0],
      entry: (row) => byKey.get(hook.rowKey(row)),
      beforeRoot: (key) => beforeRoot.has(key),
      parent: (key) => parentOf.get(key),
      /* Against the open branches, not against what is shown: a branch open
         only on the way to a match is not open, and folding it must not
         open it once the search is gone. */
      set: (key, open) => {
        if (snapshot.branches.includes(key) !== open) snapshot.toggleBranch(key);
      },
      /* Alt on a fold acts on the branch and its siblings, as on a group header. */
      siblings: (key, open) => {
        const parent = parentOf.get(key);
        for (const entry of entries) {
          if (parentOf.get(entry.key) === parent && entry.branch && !entry.empty && snapshot.branches.includes(entry.key) !== open) {
            snapshot.toggleBranch(entry.key);
          }
        }
      },
    };
  }

  /* A tree opens a row's detail with the row's own fold (table-tree-rows):
     one chevron per row, in the first column at its level - no expander
     column, whose chevron stood left of the tree's own. */
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

  /* The pinned blocks, in cells of the head row. Whatever stands before a
     pinned column sticks with it - the selection, the expander and the span;
     otherwise the pinned column would stick over the gap they leave - and the
     row actions stick behind the end block. */
  const pins = registry.pins();
  const startPinned = dataColumns.filter((e) => pins[e.spec.id] === "start").length;
  const endPinned = dataColumns.filter((e) => pins[e.spec.id] === "end").length;
  const spanPinned = spanEntry !== undefined && pins[spanEntry.spec.id] === "start";
  /* The actions column sticks at the end as a block of its own: a table a
     little too wide for a phone cut its last button to "Forwa". An actions
     column that holds nothing at rest - a Row draft's buttons,
     no Delete, no action - sticks only while a draft is open: pinned blank,
     it took half of a phone's table. Its width is reserved either way, so
     sticking moves nothing. */
  const drafting = grid.state.editing?.row === true;
  const toolsShow = actions.length > 0 || props.onRowDelete !== undefined || drafting;
  const pinned: PinBlocks = {
    start: startPinned > 0 || spanPinned ? leading + startPinned : 0,
    end: endPinned > 0 ? endPinned + (trailing ? 1 : 0) : trailing && toolsShow ? 1 : 0,
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
  const pinAt = (first: number, last = first) => pinnedCell(blocks, first, last);

  const rows = projection.visible;
  /* In manual mode the aggregates would be the page's, standing where the
     filtered set's belong - no footer rather than a wrong one. */
  const footerShown = !loading && !snapshot.manual && dataColumns.some((e) => e.spec.aggregate);
  const restricted = snapshot.search !== "" || Object.keys(snapshot.filter).length > 0;

  /* Grid mode (ADR-0034): every line the arrows walk - all of them, the ones a
     virtual window leaves unrendered as well - and the head row's columns. */
  const gridLinesNow = gridMode
    ? gridLines({
        layout: { controls: controlColumns, span: spanEntry !== undefined, aggregates: dataColumns.map((e) => e.spec.aggregate !== undefined), actions: trailing, blocks },
        body: loading ? { rows: [] } : lines ? { lines: virtual ? projection.lines! : lines } : { rows: virtual ? (projection.shown ?? projection.filtered) : rows },
        rowKey: hook.rowKey,
        expanded: detail ? openDetails(registry, snapshot, projection.shown ?? projection.filtered, hook.rowKey, tree) : new Set(),
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
  const gridEvents = gridMode
    ? gridHandlers({
        grid,
        lines: gridLinesNow,
        ids: gridIds,
        columnById: (id) => dataColumns.find((e) => e.spec.id === id),
        rowKey: hook.rowKey,
        virtual,
        onCellEdit: props.onCellEdit,
        rowMode,
        onRowSave: props.onRowSave,
        onRowAdd: props.onRowAdd,
        newRow: props.newRow,
        onRowDelete: props.onRowDelete,
        select: selectable ? (row) => snapshot.selection.toggle(hook.rowKey(row)) : undefined,
      })
    : undefined;
  /* The toolbar's "New row" reaches the grid through the registry: this
     render's handler, over this render's lines. */
  registry.setAddRow(gridEvents?.addRow ?? null);
  const lineKey = (key: string) => (gridMode ? key : undefined);

  const renderRow = (row: unknown, index: number, absolute: number, line?: Extract<Line<unknown>, { kind: "row" }>) => (
    <Row
      key={hook.rowKey(row)}
      row={row}
      index={index}
      absolute={virtual ? absolute : undefined}
      registry={registry}
      hook={hook}
      columns={dataColumns}
      line={line}
      tree={tree}
      spanEntry={spanEntry}
      header={header}
      selectable={selectable}
      actions={actions}
      trailing={trailing}
      blocks={blocks}
      columnCount={columnCount}
      rowProps={rowProps}
      baseId={baseId}
      formats={formats}
      wording={wording}
      grid={gridMode}
    />
  );
  const newRowBody = fresh && (
    <tbody>
      <Row
        key={NEW_LINE}
        row={fresh.fresh}
        fresh
        index={-1}
        absolute={undefined}
        registry={registry}
        hook={hook}
        columns={dataColumns}
        spanEntry={spanEntry}
        header={header}
        selectable={selectable}
        actions={actions}
        trailing={trailing}
        blocks={blocks}
        columnCount={columnCount}
        rowProps={undefined}
        baseId={baseId}
        formats={formats}
        wording={wording}
        grid
      />
    </tbody>
  );

  /* A page holds its height (ADR-0042). Every line is one pitch, so a page
     of the table is `pageSize` pitches whatever it shows: with a pagination
     bar and more than one page, a short last page ends in a filler of the
     lines it lacks, and an empty result keeps the height of the lines a page
     last held. A grouped page is `pageSize` lines as well, its repeated
     headers counted (grouping.ts, `pageLines`). */
  const pageSize = (registry.paginates() || snapshot.manual) && !virtual ? snapshot.pageSize : 0;
  const shownLines = lines ? lines.length : rows.length;
  if (pageSize && !loading && shownLines > 0) {
    heldLines.current = Math.min(projection.lines?.length ?? projection.filtered.length, pageSize);
  }
  const filler =
    pageSize && snapshot.pageCount > 1 && shownLines > 0 && shownLines < pageSize ? (
      <FillerRow height={`calc(var(--_pitch) * ${pageSize - shownLines})`} colSpan={columnCount} />
    ) : null;
  /* Loading over rows keeps the rows: they dim, after a moment, and take no
     pointer until the answer is in. Placeholders stand only where there is
     nothing to keep. */
  const stale = loading && shownLines > 0;

  let body: ReactNode;
  let emptyBody: ReactNode = null;
  if (loading && !stale) {
    body = (
      <tbody>
        <LoadingRows
          columns={columnCount}
          /* A page's worth, or the lines the page last held: nothing below
             moves while the answer is on its way. */
          rows={pageSize ? heldLines.current || pageSize : undefined}
          rightAligned={[
            ...Array.from({ length: controlColumns + (spanEntry ? 1 : 0) }, () => false),
            ...dataColumns.map((e) => isRightAligned(registry.kindOf(e, hook.rows), e.spec.rightAligned)),
          ]}
        />
      </tbody>
    );
  } else if (projection.filtered.length === 0) {
    body = emptyBody = (
      <tbody>
        <tr data-grid-line={lineKey("empty")}>
          <td
            colSpan={columnCount}
            className={styles.emptyCell}
            /* The height the page last had; the message at its top, where the
               rows began. */
            style={pageSize && heldLines.current ? { height: `calc(var(--_pitch) * ${heldLines.current})`, verticalAlign: "top" } : undefined}
          >
            <div className={styles.empty}>
              {(snapshot.manual || hook.admitted.length > 0) && restricted ? (
                <>
                  <p className={styles.emptyTitle}>{wording.nothingMatchesFilters}</p>
                  <Button size="sm" variant="ghost" onClick={() => resetSearchAndFilters(snapshot)}>
                    {wording.resetAll}
                  </Button>
                </>
              ) : (
                (empty ?? <p className={styles.emptyTitle}>{wording.noEntries}</p>)
              )}
            </div>
          </td>
        </tr>
      </tbody>
    );
  } else if (lines) {
    /* A virtual window that begins inside a group repeats its group headers above it,
       where the upper filler would stand - so that the group header can stick while
       its group scrolls, and nothing below moves. */
    /* Sticking, a group header is simply still there - "continued" is a page's word. */
    const shown = virtual
      ? withContinuation(lines).map((l) => (l.kind === "folded" || !l.continued ? l : { ...l, continued: false }))
      : lines;
    const repeated = shown.length - lines.length;
    const perLine = virtual && virtual.from > 0 ? virtual.fillerBefore / virtual.from : 0;
    const renderLine = (line: Line<unknown>, at: number) => {
      const i = at - repeated;
      const absolute = virtual ? virtual.from + i : i;
      if (i < 0) {
        return line.kind === "row" ? null : (
          <GroupLine
            key={`${line.kind}:${line.group.path}:repeated`}
            line={line}
            index={at}
            absolute={undefined}
            spanEntry={spanEntry}
            levelEntry={entryOf(grouping[line.group.level])}
            columns={dataColumns}
            controlColumns={controlColumns}
            blocks={blocks}
            selectable={selectable}
            hasActions={trailing}
            total={projection.filtered}
            siblings={line.parents.at(-1)?.groups ?? projection.groups ?? []}
            depth={grouping.length}
            grid={gridMode}
            hook={hook}
            formats={formats}
            wording={wording}
          />
        );
      }
      if (line.kind === "row") return renderRow(line.row, i, absolute, line);
      return (
        <GroupLine
          key={`${line.kind}:${line.group.path}${line.kind === "header" && line.continued ? ":continued" : ""}`}
          line={line}
          index={i}
          absolute={virtual ? absolute : undefined}
          spanEntry={spanEntry}
          levelEntry={entryOf(grouping[line.group.level])}
          columns={dataColumns}
          controlColumns={controlColumns}
          blocks={blocks}
          selectable={selectable}
          hasActions={trailing}
          total={projection.filtered}
          siblings={line.parents.at(-1)?.groups ?? projection.groups ?? []}
          depth={grouping.length}
          grid={gridMode}
          hook={hook}
          formats={formats}
          wording={wording}
        />
      );
    };
    body = virtual ? (
      <VirtualBody
        virtual={{ ...virtual, fillerBefore: Math.max(0, virtual.fillerBefore - repeated * perLine) }}
        colSpan={columnCount}
      >
        {shown.map(renderLine)}
      </VirtualBody>
    ) : (
      <tbody>
        {lines.map(renderLine)}
        {filler}
      </tbody>
    );
  } else if (virtual) {
    body = (
      <VirtualBody virtual={virtual} colSpan={columnCount}>
        {rows.map((row, i) => renderRow(row, i, virtual.from + i))}
      </VirtualBody>
    );
  } else {
    body = (
      <tbody>
        {rows.map((row, i) => renderRow(row, i, i))}
        {filler}
      </tbody>
    );
  }

  return (
    <>
      <div
        ref={virtual?.scrollRef}
        onScroll={(event) => {
          virtual?.onScroll();
          if (lines && stickyHeader) markStuck(event.currentTarget);
          if (blocks.start || blocks.end) markUnder(event.currentTarget);
          markBeyond(event.currentTarget, blocks);
        }}
        className={styles.scroll}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {/* Every control in the table is small: a row is one pitch tall, and a
            control of the regular size would not fit it (ADR-0042). */}
        <ControlSizeProvider size="sm">
        <table
          ref={tableRef}
          role={lines || entries ? "treegrid" : gridMode ? "grid" : undefined}
          aria-readonly={gridMode && !dataColumns.some((e) => e.spec.edit !== undefined) ? true : undefined}
          onKeyDown={gridEvents?.onKeyDown}
          onFocus={gridEvents?.onFocus}
          onClick={gridEvents?.onClick}
          onBlur={gridEvents?.onBlur}
          data-depth={lines ? grouping.length : undefined}
          style={lines ? ({ "--u-header-levels": grouping.length - 1 } as CSSProperties) : undefined}
          aria-label={ariaLabel}
          /* With virtualisation not every row stands in the document; plus one
             for the header row and one for the footer row, which count per ARIA. */
          aria-rowcount={virtual ? (projection.lines ?? projection.shown ?? projection.filtered).length + 1 + (footerShown ? 1 : 0) : undefined}
          aria-busy={loading || undefined}
          data-stale={stale || undefined}
          className={cx(
            styles.table,
            resolvedDensity === "compact" && styles.compact,
            stickyHeader && styles.sticky,
            striped && styles.striped,
            gridMode && styles.grid,
          )}
        >
          <thead>
            <tr aria-rowindex={virtual ? 1 : undefined} data-grid-line={lineKey("head")}>
              {selectable && (
                <th scope="col" className={cx(styles.th, styles.control, pinAt(0).className)} style={pinAt(0).style}>
                  <Checkbox
                    aria-label={snapshot.manual ? wording.selectAllOnPage : wording.selectAllRows}
                    checked={snapshot.selection.allSelected}
                    indeterminate={snapshot.selection.someSelected}
                    onChange={snapshot.selection.toggleAll}
                  />
                </th>
              )}
              {expanderColumn && (
                <td
                  className={cx(styles.th, styles.control, pinAt(controlColumns - 1).className)}
                  style={pinAt(controlColumns - 1).style}
                />
              )}
              {spanEntry &&
                (registry.columnById(spanEntry.spec.id) === spanEntry ? (
                  <HeaderCell entry={spanEntry} registry={registry} hook={hook} pin={pinAt(controlColumns)} />
                ) : (
                  <th scope="col" className={cx(styles.th, pinAt(controlColumns).className)} style={pinAt(controlColumns).style}>
                    {spanEntry.spec.label}
                  </th>
                ))}
              {dataColumns.map((e, i) => (
                <HeaderCell key={e.key} entry={e} registry={registry} hook={hook} pin={pinAt(leading + i)} />
              ))}
              {trailing && (
                <th
                  scope="col"
                  className={cx(styles.th, styles.actionsCell, pinAt(columnCount - 1).className)}
                  style={pinAt(columnCount - 1).style}
                >
                  <VisuallyHidden>{wording.rowActions}</VisuallyHidden>
                  {rowTools && (
                    <span className={styles.reserve} aria-hidden="true">
                      {(rowMode || props.onRowAdd) && (
                        <span className={cx(styles.actions, styles.decision)}>
                          <Button tabIndex={-1} size="sm">{wording.saveRow}</Button>
                          <Button tabIndex={-1} size="sm">{wording.discardRow}</Button>
                        </span>
                      )}
                      {props.onRowDelete && (
                        <span className={cx(styles.actions, styles.decision)}>
                          <span className={styles.deleteAsk}>{wording.deleteRowAsk}</span>
                          <Button tabIndex={-1} size="sm">{wording.deleteRow}</Button>
                          <Button tabIndex={-1} size="sm">{wording.keepRow}</Button>
                        </span>
                      )}
                    </span>
                  )}
                </th>
              )}
            </tr>
          </thead>
          <GridContext.Provider value={gridEvents ? { ...gridEvents.context, hook, wording } : null}>
            {newRowBody}
            {body}
          </GridContext.Provider>
          {footerShown && (
            <tfoot>
              <tr aria-rowindex={virtual ? (projection.lines ?? projection.shown ?? projection.filtered).length + 2 : undefined} data-grid-line={lineKey("foot")}>
                {Array.from({ length: controlColumns }, (_, i) => (
                  <td key={i} className={cx(styles.td, styles.control, pinAt(i).className)} style={pinAt(i).style} />
                ))}
                {spanEntry && <td className={cx(styles.td, pinAt(controlColumns).className)} style={pinAt(controlColumns).style} />}
                {dataColumns.map((e, i) => (
                  <FooterCell
                    key={e.key}
                    entry={e}
                    /* A tree sums its top level: a parent already holds its children. */
                    rows={projection.roots ?? projection.filtered}
                    topLevel={projection.roots !== undefined}
                    formats={formats}
                    wording={wording}
                    pin={pinAt(leading + i)}
                  />
                ))}
                {trailing && (
                  <td className={cx(styles.td, pinAt(columnCount - 1).className)} style={pinAt(columnCount - 1).style} />
                )}
              </tr>
            </tfoot>
          )}
        </table>
        </ControlSizeProvider>
        {body === emptyBody && <ViewWidth table={tableRef} />}
        <Beyond table={tableRef} blocks={blocks} />
        <CutValueTip table={tableRef} />
        <PinPlacement
          table={tableRef}
          blocks={pinned}
          onSticking={(next) => setSticking((now) => (now.start === next.start && now.end === next.end ? now : next))}
          pinnedKeys={dataColumns.filter((e) => pins[e.spec.id]).map((e) => e.key).join("|")}
        />
        {gridMode && (
          <GridFocus
            table={tableRef}
            grid={grid}
            lines={gridLinesNow}
            ids={gridIds}
            editable={dataColumns.some((e) => e.spec.edit !== undefined) ? gridEvents?.editable : undefined}
            outside={gridEvents?.outside}
          />
        )}
      </div>
      {registry.rowAdding && !registry.showsToolbar() && (
        <div className={styles.newRowBar}>
          <NewRowButton registry={registry} />
        </div>
      )}
    </>
  );
}

/* Where the pinned cells stick: each at the sum of the widths before it in
   its block, read off the head row - after every render and whenever a cell
   of a block changes its width (a font arriving, a column dragged), which
   happens without one. A component and not a hook of the frame's: the blocks
   are known only after the frame's early return. */
function PinPlacement({
  table: tableRef,
  blocks,
  onSticking,
  pinnedKeys,
}: {
  table: RefObject<HTMLTableElement | null>;
  /** The blocks as pinned - whether they stick is decided here. */
  blocks: PinBlocks;
  onSticking: (sticking: { start: boolean; end: boolean }) => void;
  /** Which columns are pinned: another column in a block is another cell to watch. */
  pinnedKeys: string;
}) {
  const { start, end } = blocks;
  /* A block's width as it stood while it stuck - for the pinned columns, not
     for the pin: a group header's label covers only the start block while
     it sticks and widens it, and a block measured loose would have fitted
     and stuck again, round and round. */
  const known = useRef<{ key: string; sticking: { start: boolean; end: boolean }; start?: number; end?: number }>({
    key: "",
    sticking: { start: true, end: true },
  });
  const place = () => {
    const table = tableRef.current;
    const scroller = table?.parentElement;
    if (!table || !scroller) return;
    /* The browser's own scroll into view keeps a cell it brings in clear of
       the blocks (table-grid-mode 05); a pinned cell, which lies in that
       padding, shifts its target out of it by the same width (pinned.ts). */
    scroller.style.removeProperty("scroll-padding-left");
    scroller.style.removeProperty("scroll-padding-right");
    if (!start && !end) return;
    const cells = Array.from(table.tHead?.rows[0]?.cells ?? []);
    let startWidth = 0;
    for (let i = 0; i < start; i++) {
      table.style.setProperty(`--u-table-pin-start-${i}`, `${startWidth}px`);
      startWidth += cells[i]?.getBoundingClientRect().width ?? 0;
    }
    let endWidth = 0;
    for (let i = 0; i < end; i++) {
      table.style.setProperty(`--u-table-pin-end-${i}`, `${endWidth}px`);
      endWidth += cells[cells.length - 1 - i]?.getBoundingClientRect().width ?? 0;
    }
    /* Other columns in a block are other widths. */
    const key = `${start}|${end}|${blocks.count}|${pinnedKeys}`;
    if (known.current.key !== key) known.current = { key, sticking: known.current.sticking };
    const now = known.current;
    if (now.sticking.start) now.start = startWidth;
    if (now.sticking.end) now.end = endWidth;
    const sticking = blocksThatStick(now.start ?? startWidth, now.end ?? endWidth, scroller.clientWidth);
    now.sticking = sticking;
    onSticking(sticking);
    if (!sticking.start) startWidth = 0;
    if (!sticking.end) endWidth = 0;
    table.style.setProperty("--u-table-pin-start", `${startWidth}px`);
    table.style.setProperty("--u-table-pin-end", `${endWidth}px`);
    if (startWidth) scroller.style.setProperty("scroll-padding-left", `${startWidth}px`);
    if (endWidth) scroller.style.setProperty("scroll-padding-right", `${endWidth}px`);
    markUnder(scroller);
  };
  useLayoutEffect(place);
  useEffect(() => {
    const table = tableRef.current;
    if (!table || (!start && !end) || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(place);
    const cells = Array.from(table.tHead?.rows[0]?.cells ?? []);
    for (const cell of [...cells.slice(0, start), ...cells.slice(cells.length - end)]) observer.observe(cell);
    /* The scroll area too: whether content lies under a block changes with its width. */
    if (table.parentElement) observer.observe(table.parentElement);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `place` reads the table afresh; the cells change with the blocks
  }, [tableRef, start, end, blocks.count, pinnedKeys]);
  return null;
}

/* The width the scroll area shows, for the empty body's message: it spans
   every column, and centred across a table wider than the phone it stood
   half out of view - "No alarms – the connection is dov". */
function ViewWidth({ table: tableRef }: { table: RefObject<HTMLTableElement | null> }) {
  useLayoutEffect(() => {
    const scroller = tableRef.current?.parentElement;
    if (!scroller) return;
    const measure = () => scroller.style.setProperty("--u-table-view", `${scroller.clientWidth}px`);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [tableRef]);
  return null;
}

/* Whether columns lie beyond a side of the scroll area where no block
   sticks: that side fades out. A table a few pixels too wide for a phone cut
   "1,951.24" to "1,951.2" at the edge and read as cut, not as a table that
   scrolls. Marked on the scroll, and whenever the area or the table changes
   its width. */
/* The whole of a cut value (ADR-0042): one tip per table, under the pointer
   after the core tooltip's 300 ms, at once on the Active cell of grid mode,
   and only where a value is actually cut. It goes with Escape, a scroll and
   the pointer leaving; it stands below its cell, above it where the window
   ends. Drawn as core's tooltip is, from the same tokens. */
function CutValueTip({ table: tableRef }: { table: RefObject<HTMLTableElement | null> }) {
  const [tip, setTip] = useState<{ text: string; cell: DOMRect; target: Element } | null>(null);
  const portalTarget = usePortalTarget();
  const tipRef = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<CSSProperties | null>(null);
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const hide = () => {
      clearTimeout(timer);
      setTip(null);
    };
    const show = (target: EventTarget | null, wait: number) => {
      clearTimeout(timer);
      const cell = target instanceof Element ? target.closest("td, th") : null;
      const box = cell?.querySelector<HTMLElement>(`:scope > .${styles.value}, :scope .${styles.treeText} > .${styles.value}`);
      if (!cell || !box || box.scrollWidth <= box.clientWidth + 1) return setTip(null);
      /* Inside a dialog the tip portals there, or it lies behind the dialog -
         the order of core's floating surfaces. */
      const portal = table.closest("dialog") ?? portalTarget() ?? document.body;
      timer = setTimeout(() => setTip({ text: box.textContent ?? "", cell: cell.getBoundingClientRect(), target: portal }), wait);
    };
    const over = (event: PointerEvent) => show(event.target, 300);
    const focus = (event: FocusEvent) => show(event.target, 0);
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    table.addEventListener("pointerover", over);
    table.addEventListener("pointerleave", hide);
    table.addEventListener("focusin", focus);
    table.addEventListener("focusout", hide);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", hide, true);
    return () => {
      clearTimeout(timer);
      table.removeEventListener("pointerover", over);
      table.removeEventListener("pointerleave", hide);
      table.removeEventListener("focusin", focus);
      table.removeEventListener("focusout", hide);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", hide, true);
    };
  }, [tableRef, portalTarget]);
  useLayoutEffect(() => {
    if (!tip) return setPlace(null);
    const height = tipRef.current?.offsetHeight ?? 0;
    const gap = 4;
    const below = tip.cell.bottom + gap + height <= window.innerHeight;
    const left = Math.max(8, Math.min(tip.cell.left, window.innerWidth - 8 - (tipRef.current?.offsetWidth ?? 0)));
    setPlace({ top: below ? tip.cell.bottom + gap : tip.cell.top - gap - height, left });
  }, [tip]);
  if (!tip) return null;
  return createPortal(
    <div ref={tipRef} role="tooltip" className={styles.cutTip} style={place ?? { visibility: "hidden", top: 0, left: 0 }}>
      {tip.text}
    </div>,
    tip.target,
  );
}

function Beyond({ table: tableRef, blocks }: { table: RefObject<HTMLTableElement | null>; blocks: PinBlocks }) {
  const latest = useRef(blocks);
  useLayoutEffect(() => {
    latest.current = blocks;
    const scroller = tableRef.current?.parentElement;
    if (scroller) markBeyond(scroller, blocks);
  });
  useEffect(() => {
    const table = tableRef.current;
    const scroller = table?.parentElement;
    if (!table || !scroller || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => markBeyond(scroller, latest.current));
    observer.observe(scroller);
    observer.observe(table);
    return () => observer.disconnect();
  }, [tableRef]);
  return null;
}

function markBeyond(scroller: HTMLElement, blocks: PinBlocks) {
  const room = scroller.scrollWidth - scroller.clientWidth;
  scroller.toggleAttribute("data-beyond-start", !blocks.start && scroller.scrollLeft > 0.5);
  scroller.toggleAttribute("data-beyond-end", !blocks.end && scroller.scrollLeft < room - 0.5);
}

/* Whether content lies under a pinned block - the block's shadow shows only
   then: under the start block once scrolled away from the start, under the end
   block until scrolled to the end. */
function markUnder(scroller: HTMLElement) {
  const room = scroller.scrollWidth - scroller.clientWidth;
  scroller.toggleAttribute("data-under-start", scroller.scrollLeft > 0.5);
  scroller.toggleAttribute("data-under-end", scroller.scrollLeft < room - 0.5);
}

/* A group header that sticks gets its shadow step: it sticks when it stands higher than
   its place in the flow would put it - measured against the row after it. */
function markStuck(scroller: HTMLElement) {
  for (const header of Array.from(scroller.querySelectorAll<HTMLTableRowElement>("tbody > tr[data-line='header']"))) {
    const cell = header.cells[header.cells.length - 1];
    const stuck = !!cell && cell.getBoundingClientRect().top > header.getBoundingClientRect().top + 0.5;
    header.toggleAttribute("data-stuck", stuck);
  }
}

/* ====================================================================== */
/* Header cell: sorting, filtering, dragging the width                      */
/* ====================================================================== */

function HeaderCell({
  entry,
  registry,
  hook,
  pin,
}: {
  entry: ColumnEntry;
  registry: Registry;
  hook: HookSnapshot;
  pin: PinnedCell;
}) {
  const { spec } = entry;
  const snapshot = hook.publicSnapshot;
  const kind = registry.kindOf(entry, hook.rows);
  const rightAligned = isRightAligned(kind, spec.rightAligned);
  const sortable = registry.isSortable(entry, hook.rows);
  const id = spec.id;
  const levelIndex = snapshot.sort.findIndex((s) => s.column === id);
  const direction = levelIndex === -1 ? undefined : snapshot.sort[levelIndex]!.direction;
  const rank = snapshot.sort.length > 1 && levelIndex !== -1 ? levelIndex + 1 : undefined;
  const width = snapshot.widths[id];
  const MIN = 48;

  /* The pointer gesture runs at the grip, not over React state - taken over
     from Th in @umriss-ui/core, with the same two guarantees: a drag does not
     sort, and a second pointer neither moves nor ends it. */
  const dragFrom = (event: ReactPointerEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    event.preventDefault();
    const grip = event.currentTarget;
    const cell = grip.closest("th");
    if (!cell) return;
    const startX = event.clientX;
    const startWidth = cell.getBoundingClientRect().width;
    const pointer = event.pointerId;
    grip.setPointerCapture(pointer);
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      snapshot.setWidth(id, Math.max(MIN, startWidth + (e.clientX - startX)));
    };
    const onEnd = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      grip.removeEventListener("pointermove", onMove);
      grip.removeEventListener("pointerup", onEnd);
      grip.removeEventListener("pointercancel", onEnd);
      if (grip.hasPointerCapture(pointer)) grip.releasePointerCapture(pointer);
    };
    grip.addEventListener("pointermove", onMove);
    grip.addEventListener("pointerup", onEnd);
    grip.addEventListener("pointercancel", onEnd);
  };

  /* "Fit to content" measures the widest cell of the column; rows with a
     different number of cells (detail rows) stay out of it. */
  const measureAndSet = (cell: HTMLTableCellElement | null) => {
    const headerRow = cell?.parentElement;
    const table = cell?.closest("table");
    if (!cell || !headerRow || !table) return;
    const index = Array.from(headerRow.children).indexOf(cell);
    const count = headerRow.children.length;
    /* Measured without the width it has now, and without the surplus a full
       width table hands its columns: a cell is never narrower than its width,
       so a widened column would only ever grow. */
    const before = { cell: cell.style.width, table: table.style.width };
    cell.style.width = "";
    table.style.width = "auto";
    let widest = 0;
    for (const tableRow of Array.from(table.rows)) {
      if (tableRow.cells.length !== count) continue;
      const c = tableRow.cells[index];
      if (!c) continue;
      /* A value cut at the cap is wider than its box: its whole width, and
         the cell's padding beside it. */
      const box = c.querySelector<HTMLElement>(`.${styles.value}`);
      const style = getComputedStyle(c);
      const padding = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      widest = Math.max(widest, c.scrollWidth, box ? box.scrollWidth + padding : 0);
    }
    cell.style.width = before.cell;
    table.style.width = before.table;
    if (widest > 0) snapshot.setWidth(id, Math.max(MIN, widest + 1));
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTableCellElement>) => {
    if (!spec.resizable || !event.altKey) return;
    const wider = event.key === "ArrowRight";
    const narrower = event.key === "ArrowLeft";
    const toContent = event.key === "Home";
    if (!wider && !narrower && !toContent) return;
    event.preventDefault();
    const cell = event.currentTarget;
    if (toContent) {
      measureAndSet(cell);
      return;
    }
    const now = cell.getBoundingClientRect().width;
    const step = event.shiftKey ? 32 : 8;
    snapshot.setWidth(id, Math.max(MIN, now + (wider ? step : -step)));
  };

  const label = sortable ? (
    <button
      type="button"
      className={styles.sortButton}
      onClick={(event: ReactMouseEvent) => snapshot.toggleSort(id, event.shiftKey || event.metaKey)}
    >
      <span>{spec.label}</span>
      {rank !== undefined && (
        <span className={styles.sortRank} aria-hidden="true">
          {rank}
        </span>
      )}
      <span className={cx(styles.sortIndicator, direction && styles.sortActive)} aria-hidden="true">
        {direction ? (
          <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" className={cx(styles.sortArrow, direction === "desc" && styles.sortArrowDesc)}>
            <path d="M2.2 6.2 5 3.4l2.8 2.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          /* Drawn in the nominal box and set in the 12 pixels the indicator
             has always taken, so that the head does not move. */
          <svg viewBox="0 0 10 10" width="10" height="12" aria-hidden="true">
            <path d="M2.8 3.7 5 1.5l2.2 2.2M2.8 6.3 5 8.5l2.2-2.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  ) : (
    spec.label
  );

  const ariaSort = direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none";
  /* A list filter needs values with a text form; a filter of one's own knows
     itself what it offers. */
  const withFilter = filterOf(spec.filter) !== undefined && !(spec.filter === "list" && kind === "other");

  return (
    <th
      scope="col"
      data-column={id}
      aria-sort={sortable ? ariaSort : undefined}
      tabIndex={spec.resizable && !sortable ? 0 : undefined}
      onKeyDown={handleKeyDown}
      className={cx(styles.th, rightAligned && styles.numeric, pin.className)}
      style={{
        ...(width !== undefined ? { width } : {}),
        ...pin.style,
      }}
    >
      {withFilter ? (
        <span className={styles.thFlex}>
          {label}
          <ColumnFilterButton entry={entry} registry={registry} hook={hook} />
        </span>
      ) : (
        label
      )}
      {spec.resizable && (
        <span
          role="presentation"
          className={styles.grip}
          onPointerDown={dragFrom}
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => {
            event.stopPropagation();
            measureAndSet(event.currentTarget.closest("th"));
          }}
        />
      )}
    </th>
  );
}

/* ====================================================================== */
/* Row, cell, footer cell                                                   */
/* ====================================================================== */

function Row({
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
          <td className={cx(styles.td, styles.actionsCell, pinAt(columnCount - 1).className, draft && styles.editing)} style={pinAt(columnCount - 1).style}>
            {draft ? (
              <>
                <RowDraftButtons name={name} wording={wording} />
                {/* What the row carries at rest holds its height, unseen, under the draft's buttons. */}
                <span className={styles.held} aria-hidden="true">
                  <RowActionsCell actions={fresh ? [] : actions} row={row} name={name} wording={wording} line={gridLine} />
                </span>
              </>
            ) : (
              <RowActionsCell actions={fresh ? [] : actions} row={row} name={name} wording={wording} line={gridLine} />
            )}
          </td>
        )}
      </tr>
      {open && (
        <tr
          id={detailId}
          className={styles.detailRow}
          data-group={group?.path}
          data-grid-line={grid ? `detail:${key}` : undefined}
          data-before-root={entry && tree?.beforeRoot(key) ? "" : undefined}
        >
          <td
            colSpan={columnCount}
            className={cx(styles.detailCell, entry && styles.treeDetail)}
            style={entry ? ({ "--tree-level": entry.level } as CSSProperties) : undefined}
          >
            {entry ? <div className={styles.treeDetailRail}>{detailContent}</div> : detailContent}
          </td>
        </tr>
      )}
    </>
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
  content = (
    <div
      className={cx(styles.value, width !== undefined && styles.sized, editor && styles.editingValue)}
      /* Contained, the box answers the layout with the column's width less its
         cell's padding (Table.module.css, `.sized`): the value neither widens
         the column nor lets a narrow page squeeze it. */
      style={width !== undefined ? ({ "--_width": `${width}px` } as CSSProperties) : undefined}
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
    >
      {editor && <CellEditor entry={entry} row={row} rowName={rowName} grid={editor} />}
      {content}
    </Tag>
  );
}

/** A row's detail as it stands, or null where it comes to nothing - a
    branch whose records hang only from its leaves gets no expander and no
    empty line. In a tree a branch's detail follows the branch: one fold, one
    state - opened by default, by a view or by unfolding all along with its
    children. Elsewhere the row's own expansion. Asked on every render: it is
    an element the caller returns, not yet rendered. */
function detailOf(
  registry: Registry,
  snapshot: TableSnapshot<unknown>,
  row: unknown,
  key: string,
  entry: FlatteningEntry<unknown> | undefined,
): { content: ReactNode; open: boolean } | null {
  const content = registry.detail?.presentation(row as never);
  if (content === null || content === undefined || content === false) return null;
  const branch = entry !== undefined && entry.branch && !entry.empty;
  return { content, open: branch ? snapshot.branches.includes(key) : snapshot.expanded.includes(key) };
}

/** The keys whose detail stands open - for the grid's walk, which needs the
    lines the body draws. */
function openDetails(
  registry: Registry,
  snapshot: TableSnapshot<unknown>,
  rows: readonly unknown[],
  rowKey: (row: unknown) => string,
  tree: TreeSetup | undefined,
): Set<string> {
  const wanted = new Set([...snapshot.expanded, ...snapshot.branches]);
  const out = new Set<string>();
  for (const row of rows) {
    const key = rowKey(row);
    if (wanted.has(key) && detailOf(registry, snapshot, row, key, tree?.entry(row))?.open) out.add(key);
  }
  return out;
}

/** What the body needs to draw tree rows - built once per render in the frame. */
interface TreeSetup {
  /** The column that carries the tree. */
  column: ColumnEntry | undefined;
  /** Whether a root follows the row - its last line draws the root's line. */
  beforeRoot: (key: string) => boolean;
  entry: (row: unknown) => FlatteningEntry<unknown> | undefined;
  parent: (key: string) => string | undefined;
  /** Opens or closes a branch - the open branches, never the search's path. */
  set: (key: string, open: boolean) => void;
  siblings: (key: string, open: boolean) => void;
}

/* The indent per level, then the fold - a leaf keeps its slot so that the
   labels of one level align - then the cell. The fold is the group header's,
   with its keys: Right opens, Left closes or goes to the parent's fold, Alt
   acts on the siblings as well. */
/** A row's detail in a tree: its fold opens it. */
interface TreeDetail {
  open: boolean;
  toggle: () => void;
}

function TreeCellContent({
  setup,
  entry,
  detail,
  name,
  wording,
  children,
}: {
  setup: TreeSetup;
  entry: FlatteningEntry<unknown>;
  detail?: TreeDetail;
  name: string;
  wording: Wording;
  children: ReactNode;
}) {
  const branch = entry.branch && !entry.empty;
  const opens = branch || detail !== undefined;
  /* The fold opens what stands under the row: its detail, then its children. */
  const open = (branch && entry.expanded) || (detail?.open ?? false);
  const set = (wanted: boolean) => {
    if (branch) setup.set(entry.key, wanted);
    if (detail && detail.open !== wanted) detail.toggle();
  };
  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    if (event.altKey) return setup.siblings(entry.key, event.key === "ArrowRight");
    if (event.key === "ArrowRight") {
      if (!open) set(true);
    } else if (open) set(false);
    else {
      const parent = setup.parent(entry.key);
      const table = event.currentTarget.closest("table");
      const target = Array.from(table?.querySelectorAll<HTMLButtonElement>("[data-branch-key]") ?? []).find((b) => b.dataset.branchKey === parent);
      target?.focus();
    }
  };
  return (
    <span className={styles.treeCell} style={{ "--tree-level": entry.level } as CSSProperties}>
      {opens ? (
        <button
          type="button"
          className={cx(styles.fold, !open && styles.foldClosed)}
          data-branch-key={entry.key}
          aria-expanded={open}
          aria-label={open ? wording.foldBranch(name) : wording.unfoldBranch(name)}
          onKeyDown={onKeyDown}
          onClick={(event) => (event.altKey ? setup.siblings(entry.key, !open) : set(!open))}
        >
          <FoldMark />
        </button>
      ) : (
        <span className={styles.foldSlot} />
      )}
      <span className={styles.treeText}>
        {children}
        {entry.pathOnly && <VisuallyHidden>{`, ${wording.pathRow}`}</VisuallyHidden>}
      </span>
    </span>
  );
}

function FooterCell({
  entry,
  rows,
  formats,
  wording,
  pin = NOT_PINNED,
  topLevel = false,
}: {
  entry: ColumnEntry;
  rows: readonly unknown[];
  formats: Formats;
  wording: Wording;
  pin?: PinnedCell;
  /** Tree rows: the aggregate is over the roots, and says so. */
  topLevel?: boolean;
}) {
  if (!entry.spec.aggregate) return <td className={cx(styles.td, pin.className)} style={pin.style} />;
  const kind = typeof entry.spec.aggregate === "function" ? "own" : entry.spec.aggregate;
  return (
    <td
      className={cx(styles.td, aggregateIsNumeric(entry, rows) && styles.numeric, pin.className)}
      style={pin.style}
      data-footer={kind}
      title={topLevel ? wording.footerTopLevel : undefined}
    >
      <AggregateValue entry={entry} rows={rows} formats={formats} wording={wording} signed />
      {topLevel && <VisuallyHidden>{` (${wording.footerTopLevel})`}</VisuallyHidden>}
    </td>
  );
}

/* ====================================================================== */
/* Row actions                                                              */
/* ====================================================================== */

/* Up to two actions stand as buttons in the row; from three on ALL of them
   stand in a menu (umriss-table 09). A mixture - one button and one menu -
   would give the column a different width depending on the number, and an
   action would wander between row and menu when a third one is added. */
export const AT_MOST_IN_THE_ROW = 2;

function RowActionsCell({
  actions,
  row,
  name,
  wording,
  line,
}: {
  actions: ReturnType<Registry["actions"]["ordered"]>;
  row: unknown;
  name: string;
  wording: Wording;
  /** The row's line in grid mode - to know whether a Row draft elsewhere holds the grid. */
  line: string;
}) {
  const grid = useContext(GridContext);
  /* A Row draft elsewhere holds the grid: a click here is refused as a
     focus is, and triggers nothing (ADR-0036). */
  const held = grid?.editing?.row === true && grid.editing.line !== line;
  const remove = grid?.remove;
  const [asking, setAsking] = useState(false);
  const askedRef = useRef(false);
  const deleteRef = useRef<HTMLButtonElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  /* The question takes the focus to its safe answer, and Keep brings it
     back to Delete: the button pressed is gone from under it either way. */
  useEffect(() => {
    if (asking) keepRef.current?.focus();
    else if (askedRef.current) deleteRef.current?.focus();
    askedRef.current = asking;
  }, [asking]);

  /* A bulk action always gets a list - at the row one made from it. That way
     "delete three" is one confirmation and not three. */
  const trigger = (spec: (typeof actions)[number]["spec"]) => {
    if (held) return;
    const onSelect = spec.onSelect as (target: unknown) => void;
    onSelect(spec.bulk ? [row] : row);
  };

  /* Delete asks inside its row before it is reported: a row lost to one
     stray click is data lost. */
  const deletion = remove && (asking ? (
    <>
      <span className={styles.deleteAsk}>{wording.deleteRowAsk}</span>
      <Button className={styles.toned} size="sm" variant="danger" aria-label={wording.rowAction(wording.deleteRow, name)} onClick={() => { setAsking(false); remove(row); }}>
        {wording.deleteRow}
      </Button>
      <Button ref={keepRef} size="sm" variant="ghost" aria-label={wording.rowAction(wording.keepRow, name)} onClick={() => setAsking(false)}>
        {wording.keepRow}
      </Button>
    </>
  ) : (
    <Button ref={deleteRef} size="sm" variant="ghost" aria-label={wording.rowAction(wording.deleteRow, name)} onClick={() => !held && setAsking(true)}>
      {wording.deleteRow}
    </Button>
  ));

  if (actions.length <= AT_MOST_IN_THE_ROW) {
    return (
      <div className={cx(styles.actions, asking && styles.decision)}>
        {!asking && actions.map(({ key, spec }) => (
          <Button
            key={key}
            size="sm"
            variant="ghost"
            aria-label={wording.rowAction(spec.label, name)}
            onClick={() => trigger(spec)}
          >
            {spec.label}
          </Button>
        ))}
        {deletion}
      </div>
    );
  }
  return (
    <div className={cx(styles.actions, asking && styles.decision)}>
      {!asking && (
        <Menu
          align="end"
          trigger={
            <IconButton size="sm" variant="ghost" aria-label={wording.rowActionsMenu(name)}>
              ⋯
            </IconButton>
          }
        >
          {actions.map(({ key, spec }) => (
            <MenuItem key={key} tone={spec.tone} onSelect={() => trigger(spec)}>
              {spec.label}
            </MenuItem>
          ))}
        </Menu>
      )}
      {deletion}
    </div>
  );
}

/** A Row draft's buttons, where the row's actions stood (ADR-0036): Save and
    Discard, and - once someone tried to leave the draft - the word that it
    must be saved or discarded first. */
function RowDraftButtons({ name, wording }: { name: string; wording: Wording }) {
  const grid = useContext(GridContext)!;
  const anchor = useRef<HTMLDivElement>(null);
  return (
    <div ref={anchor} className={cx(styles.actions, styles.decision, styles.draftButtons)}>
      <Button className={styles.toned} size="sm" variant="primary" aria-label={wording.rowAction(wording.saveRow, name)} onClick={grid.save}>
        {wording.saveRow}
      </Button>
      <Button size="sm" variant="ghost" aria-label={wording.rowAction(wording.discardRow, name)} onClick={grid.discard}>
        {wording.discardRow}
      </Button>
      <Popover
        open={grid.editing?.refused === true}
        onOpenChange={() => undefined}
        anchorRef={anchor}
        restoreFocus={false}
        offset={4}
        className={styles.draftMessage}
      >
        <span role="status">{wording.saveOrDiscardFirst}</span>
      </Popover>
    </div>
  );
}

/* ====================================================================== */
/* Loading                                                                  */
/* ====================================================================== */

function LoadingRows({ columns, rightAligned = [], rows = 4 }: { columns: number; rightAligned?: readonly boolean[]; rows?: number }) {
  const widths = [72, 48, 60, 40, 56, 64];
  return (
    <>
      {Array.from({ length: rows }, (_, z) => (
        <tr key={z} aria-hidden="true">
          {Array.from({ length: columns }, (_, s) => (
            <td key={s} className={cx(styles.td, rightAligned[s] && styles.numeric)}>
              <span className={styles.skeleton} style={{ width: `${widths[(z + s) % widths.length]}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ====================================================================== */
/* The virtualised body                                                     */
/* ====================================================================== */

/* Taken over from TableVirtualBody in @umriss-ui/core (umriss-table 05/10): two
   filler rows keep the scrollbar at its full length, the arrow keys wander over
   rows that are not rendered yet - scroll first, then focus - and exactly one
   row carries the tab stop. */

const TabStopContext = createContext<number>(0);

function FillerRow({ height, colSpan }: { height: number | string; colSpan: number }) {
  if (typeof height === "number" && height <= 0) return null;
  return (
    <tr aria-hidden="true" data-filler="" className={styles.fillerRow}>
      <td colSpan={colSpan} style={{ height }} />
    </tr>
  );
}

function VirtualBody({
  virtual,
  colSpan,
  children,
}: {
  virtual: VirtualRows;
  colSpan: number;
  children: ReactNode;
}) {
  const { count, fillerBefore, fillerAfter, showRow } = virtual;
  const wanted = useRef<number | null>(null);
  const [tabStop, setTabStop] = useState(0);

  const focusRow = (body: HTMLTableSectionElement, index: number) => {
    wanted.current = index;
    setTabStop(index);
    showRow(index);
    requestAnimationFrame(() => {
      body.querySelector<HTMLElement>(`[data-row="${index}"]`)?.focus();
    });
  };

  const tabStopInWindow = tabStop >= virtual.from && tabStop < virtual.to ? tabStop : virtual.from;

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTableSectionElement>) => {
    if (event.defaultPrevented || count === 0) return;
    const target = event.target as HTMLElement;
    const row = target.closest<HTMLElement>("[data-row]");
    /* Only on the row itself: inside an input element the arrows belong to the
       element. */
    if (row && target !== row) return;
    const current = row ? Number(row.dataset.row) : (wanted.current ?? -1);
    let next: number | null = null;
    if (event.key === "ArrowDown") next = Math.min(count - 1, current + 1);
    else if (event.key === "ArrowUp") next = Math.max(0, current - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    if (next === null || next === current) return;
    event.preventDefault();
    focusRow(event.currentTarget, next);
  };

  return (
    <tbody
      className={styles.virtualBody}
      onKeyDown={handleKeyDown}
      onFocus={(event) => {
        const row = (event.target as HTMLElement).closest<HTMLElement>("[data-row]");
        if (row) setTabStop(Number(row.dataset.row));
      }}
    >
      <TabStopContext.Provider value={tabStopInWindow}>
        <FillerRow height={fillerBefore} colSpan={colSpan} />
        {children}
        <FillerRow height={fillerAfter} colSpan={colSpan} />
      </TabStopContext.Provider>
    </tbody>
  );
}
