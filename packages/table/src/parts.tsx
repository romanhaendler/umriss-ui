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
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import {
  Button,
  Checkbox,
  Menu,
  MenuItem,
  VisuallyHidden,
  useDensityFor,
  useFormats,
  useWording,
} from "@umriss-ui/core";
import type { Formats, VirtualRows, Wording } from "@umriss-ui/core";
import { cx } from "./cx";
import { DEV, warnOnce } from "./dev";
import { ColumnFilterButton } from "./filter";
import { TableToolbar } from "./toolbar";
import { filterOf } from "./columnFilter";
import { TableContext } from "./context";
import type { TableContextValue } from "./context";
import type { HookSnapshot, Registry, ColumnSpec, ColumnEntry } from "./registry";
import { link } from "./registry";
import { resetSearchAndFilters, visibleColumns } from "./export";
import type { TableProps } from "./types";
import { asText, isAbsent, isRightAligned } from "./values";
import { withContinuation } from "./model/grouping";
import type { Line } from "./model/grouping";
import { GroupLine, SpanCell } from "./groupLines";
import { Absent, AggregateValue, aggregateIsNumeric } from "./aggregateValue";
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
  resizable?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  filter?: ColumnSpec["filter"];
  sortValue?: (value: never) => unknown;
  exportValue?: (value: never) => unknown;
  groupValue?: (value: never) => unknown;
  group?: ColumnSpec["group"];
  groupable?: boolean;
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
    resizable: props.resizable === true,
    sortable: props.sortable,
    searchable: props.searchable,
    filter: props.filter,
    ownSortValue: props.sortValue,
    ownExportValue: props.exportValue,
    ownGroupValue: props.groupValue,
    group: props.group,
    groupable: props.groupable,
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

const CONTROL_CELL_WIDTH = 34;

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
    stickyRowHeader = false,
    striped = false,
    density,
    maxHeight,
    empty,
    loading = false,
    rowProps,
    ariaLabel,
  } = props;

  useSyncExternalStore(registry.subscribe, registry.bodyVersion, registry.bodyVersion);
  const wording = useWording();
  const formats = useFormats();
  const resolvedDensity = useDensityFor(density, "regular");
  const baseId = useId();
  const tableRef = useRef<HTMLTableElement>(null);

  /* Sticky bands stand below the head and below one another; how high those
     are only the layout knows. Measured after every render - a density or a
     font changes them. */
  useLayoutEffect(() => {
    const table = tableRef.current;
    if (!table || !stickyHeader) return;
    const head = table.tHead?.getBoundingClientRect().height ?? 0;
    const band = table.querySelector("tr[data-line='header']")?.getBoundingClientRect().height ?? 0;
    table.style.setProperty("--u-table-head", `${head}px`);
    table.style.setProperty("--u-table-band", `${band}px`);
  });

  const hook = registry.hook;
  if (!hook) return null;

  const snapshot = hook.publicSnapshot;
  const projection = registry.projection();
  const header = registry.rowHeader();
  /* If the row header sticks it stands first - a sticky column in the middle
     would stick at a place from which it wanders over its neighbours while
     scrolling. That is decided in the registry, so that column menu and export
     show the same order. */
  const columns = visibleColumns(registry);

  const detail = registry.detail;
  const actions = registry.hasRowActions() ? registry.actions.ordered() : [];
  const virtual = hook.companion.virtual;

  /* Grouped (ADR-0029): the innermost grouped column or group key stands first
     as the span; the outer grouped columns leave the body - their value stands
     in the band. */
  const grouping = snapshot.grouping;
  const lines = grouping.length > 0 ? projection.visibleLines : undefined;
  const groupingEntries = lines ? registry.groupingEntries(hook.rows) : [];
  const entryOf = (id: string | undefined) => groupingEntries.find((e) => e.spec.id === id);
  const spanEntry = lines ? entryOf(grouping.at(-1)) : undefined;
  const dataColumns = lines ? columns.filter((e) => !grouping.includes(e.spec.id)) : columns;

  const controlColumns = (selectable ? 1 : 0) + (detail ? 1 : 0);
  const columnCount = controlColumns + (lines ? 1 : 0) + dataColumns.length + (actions.length > 0 ? 1 : 0);
  const rowHeaderLeft = controlColumns * CONTROL_CELL_WIDTH;
  const sticks = (e: ColumnEntry) => stickyRowHeader && e === header;

  const rows = projection.visible;
  const footerShown = !loading && dataColumns.some((e) => e.spec.aggregate);
  const restricted = snapshot.search !== "" || Object.keys(snapshot.filter).length > 0;

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
      spanEntry={spanEntry}
      header={header}
      selectable={selectable}
      actions={actions}
      stickyRowHeader={stickyRowHeader}
      rowHeaderLeft={rowHeaderLeft}
      columnCount={columnCount}
      rowProps={rowProps}
      baseId={baseId}
      formats={formats}
      wording={wording}
    />
  );

  let body: ReactNode;
  if (loading) {
    body = (
      <tbody>
        <LoadingRows columns={columnCount} />
      </tbody>
    );
  } else if (projection.filtered.length === 0) {
    body = (
      <tbody>
        <tr>
          <td colSpan={columnCount} className={styles.emptyCell}>
            <div className={styles.empty}>
              {hook.admitted.length > 0 && restricted ? (
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
    /* A virtual window that begins inside a group repeats its bands above it,
       where the upper filler would stand - so that the band can stick while
       its group scrolls, and nothing below moves. */
    /* Sticking, a band is simply still there - "continued" is a page's word. */
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
            hasActions={actions.length > 0}
            total={projection.filtered}
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
          hasActions={actions.length > 0}
          total={projection.filtered}
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
      <tbody>{lines.map(renderLine)}</tbody>
    );
  } else if (virtual) {
    body = (
      <VirtualBody virtual={virtual} colSpan={columnCount}>
        {rows.map((row, i) => renderRow(row, i, virtual.from + i))}
      </VirtualBody>
    );
  } else {
    body = <tbody>{rows.map((row, i) => renderRow(row, i, i))}</tbody>;
  }

  return (
    <div
      ref={virtual?.scrollRef}
      onScroll={virtual?.onScroll}
      className={styles.scroll}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table
        ref={tableRef}
        style={lines ? ({ "--u-band-levels": grouping.length - 1 } as CSSProperties) : undefined}
        aria-label={ariaLabel}
        /* With virtualisation not every row stands in the document; plus one
           for the header row and one for the footer row, which count per ARIA. */
        aria-rowcount={virtual ? (projection.lines ?? projection.filtered).length + 1 + (footerShown ? 1 : 0) : undefined}
        aria-busy={loading || undefined}
        className={cx(
          styles.table,
          resolvedDensity === "compact" && styles.compact,
          stickyHeader && styles.sticky,
          striped && styles.striped,
        )}
      >
        <thead>
          <tr aria-rowindex={virtual ? 1 : undefined}>
            {selectable && (
              <th
                scope="col"
                className={cx(styles.th, styles.control, stickyRowHeader && styles.stickyCell)}
                style={stickyRowHeader ? { left: 0 } : undefined}
              >
                <Checkbox
                  aria-label={wording.selectAllRows}
                  checked={snapshot.selection.allSelected}
                  indeterminate={snapshot.selection.someSelected}
                  onChange={snapshot.selection.toggleAll}
                />
              </th>
            )}
            {detail && (
              <td
                className={cx(styles.th, styles.control, stickyRowHeader && styles.stickyCell)}
                style={stickyRowHeader ? { left: (selectable ? 1 : 0) * CONTROL_CELL_WIDTH } : undefined}
              />
            )}
            {spanEntry &&
              (registry.columnById(spanEntry.spec.id) === spanEntry ? (
                <HeaderCell entry={spanEntry} registry={registry} hook={hook} sticky={false} left={rowHeaderLeft} />
              ) : (
                <th scope="col" className={styles.th}>
                  {spanEntry.spec.label}
                </th>
              ))}
            {dataColumns.map((e) => (
              <HeaderCell
                key={e.key}
                entry={e}
                registry={registry}
                hook={hook}
                sticky={sticks(e)}
                left={rowHeaderLeft}
              />
            ))}
            {actions.length > 0 && (
              <th scope="col" className={cx(styles.th, styles.actionsCell)}>
                <VisuallyHidden>{wording.rowActions}</VisuallyHidden>
              </th>
            )}
          </tr>
        </thead>
        {body}
        {footerShown && (
          <tfoot>
            <tr aria-rowindex={virtual ? (projection.lines ?? projection.filtered).length + 2 : undefined}>
              {Array.from({ length: controlColumns }, (_, i) => (
                <td
                  key={i}
                  className={cx(styles.td, styles.control, stickyRowHeader && styles.stickyCell)}
                  style={stickyRowHeader ? { left: i * CONTROL_CELL_WIDTH } : undefined}
                />
              ))}
              {spanEntry && <td className={styles.td} />}
              {dataColumns.map((e) => (
                <FooterCell
                  key={e.key}
                  entry={e}
                  rows={projection.filtered}
                  formats={formats}
                  wording={wording}
                  sticky={sticks(e)}
                  left={rowHeaderLeft}
                />
              ))}
              {actions.length > 0 && <td className={styles.td} />}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

/* ====================================================================== */
/* Header cell: sorting, filtering, dragging the width                      */
/* ====================================================================== */

function HeaderCell({
  entry,
  registry,
  hook,
  sticky,
  left,
}: {
  entry: ColumnEntry;
  registry: Registry;
  hook: HookSnapshot;
  sticky: boolean;
  left: number;
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
      if (c) widest = Math.max(widest, c.scrollWidth);
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
          <svg viewBox="0 0 10 10" width="10" height="10" className={cx(styles.sortArrow, direction === "desc" && styles.sortArrowDesc)}>
            <path d="M2.2 6.2 5 3.4l2.8 2.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 10 12" width="10" height="12">
            <path d="M2.4 4.4 5 1.8l2.6 2.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.4 7.6 5 10.2l2.6-2.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
      className={cx(styles.th, rightAligned && styles.numeric, sticky && styles.stickyCell)}
      style={{
        ...(width !== undefined ? { width } : {}),
        ...(sticky ? { left } : {}),
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
  stickyRowHeader,
  rowHeaderLeft,
  columnCount,
  rowProps,
  baseId,
  formats,
  wording,
  line,
  spanEntry,
}: {
  row: unknown;
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
  stickyRowHeader: boolean;
  rowHeaderLeft: number;
  columnCount: number;
  rowProps: TableProps<unknown>["rowProps"];
  baseId: string;
  formats: Formats;
  wording: Wording;
}) {
  const tabStop = useContext(TabStopContext);
  const snapshot = hook.publicSnapshot;
  const key = hook.rowKey(row);
  const name = rowName(row, header, hook, formats, wording);
  const detail = registry.detail;
  const open = detail !== null && snapshot.expanded.includes(key);
  const detailId = `${baseId}-detail-${index}`;
  const { className: rowClass, ...data } = rowProps?.(row) ?? {};

  const virtual = absolute !== undefined;

  return (
    <>
      <tr
        {...data}
        className={cx(rowClass, virtual && styles.virtualRow)}
        data-row={virtual ? absolute : undefined}
        data-line={line ? "row" : undefined}
        data-group-first={line?.first ? "" : undefined}
        tabIndex={virtual ? (absolute === tabStop ? 0 : -1) : undefined}
        data-even={virtual && absolute % 2 === 1 ? "" : undefined}
        aria-rowindex={virtual ? absolute + 2 : undefined}
      >
        {selectable && (
          <td
            className={cx(styles.td, styles.control, stickyRowHeader && styles.stickyCell)}
            style={stickyRowHeader ? { left: 0 } : undefined}
          >
            <Checkbox
              aria-label={wording.selectRow(name)}
              checked={snapshot.selection.isSelected(key)}
              onChange={() => snapshot.selection.toggle(key)}
            />
          </td>
        )}
        {detail && (
          <td
            className={cx(styles.td, styles.control, stickyRowHeader && styles.stickyCell)}
            style={stickyRowHeader ? { left: (selectable ? 1 : 0) * CONTROL_CELL_WIDTH } : undefined}
          >
            <button
              type="button"
              aria-expanded={open}
              aria-controls={open ? detailId : undefined}
              aria-label={open ? wording.collapseRowNamed(name) : wording.expandRowNamed(name)}
              className={cx(styles.expander, open && styles.expanderOpen)}
              onClick={() => snapshot.toggleRow(key)}
            >
              <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
                <path d="M3.5 1.5 7 5l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </td>
        )}
        {line && <SpanCell line={line} entry={spanEntry} hook={hook} formats={formats} wording={wording} />}
        {columns.map((e) => (
          <Cell
            key={e.key}
            entry={e}
            row={row}
            kind={registry.kindOf(e, hook.rows)}
            sticky={stickyRowHeader && e === header}
            left={rowHeaderLeft}
            formats={formats}
            wording={wording}
          />
        ))}
        {actions.length > 0 && (
          <td className={cx(styles.td, styles.actionsCell)}>
            <RowActionsCell actions={actions} row={row} name={name} wording={wording} />
          </td>
        )}
      </tr>
      {open && detail && (
        <tr id={detailId} className={styles.detailRow}>
          <td colSpan={columnCount} className={styles.detailCell}>
            {detail.presentation(row as never)}
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
  sticky,
  left,
  formats,
  wording,
}: {
  entry: ColumnEntry;
  row: unknown;
  kind: ReturnType<Registry["kindOf"]>;
  sticky: boolean;
  left: number;
  formats: Formats;
  wording: Wording;
}) {
  const { spec } = entry;
  const value = entry.read(row);
  const rightAligned = isRightAligned(kind, spec.rightAligned);

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

  const Tag = spec.rowHeader ? "th" : "td";
  return (
    <Tag
      scope={spec.rowHeader ? "row" : undefined}
      className={cx(styles.td, rightAligned && styles.numeric, spec.rowHeader && styles.rowHeader, sticky && styles.stickyCell)}
      style={sticky ? { left } : undefined}
    >
      {content}
    </Tag>
  );
}

function FooterCell({
  entry,
  rows,
  formats,
  wording,
  sticky,
  left,
}: {
  entry: ColumnEntry;
  rows: readonly unknown[];
  formats: Formats;
  wording: Wording;
  sticky: boolean;
  left: number;
}) {
  const style = sticky ? { left } : undefined;
  if (!entry.spec.aggregate) return <td className={cx(styles.td, sticky && styles.stickyCell)} style={style} />;
  const kind = typeof entry.spec.aggregate === "function" ? "own" : entry.spec.aggregate;
  return (
    <td className={cx(styles.td, aggregateIsNumeric(entry, rows) && styles.numeric, sticky && styles.stickyCell)} style={style} data-footer={kind}>
      <AggregateValue entry={entry} rows={rows} formats={formats} wording={wording} signed />
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
}: {
  actions: ReturnType<Registry["actions"]["ordered"]>;
  row: unknown;
  name: string;
  wording: Wording;
}) {
  /* A bulk action always gets a list - at the row one made from it. That way
     "delete three" is one confirmation and not three. */
  const trigger = (spec: (typeof actions)[number]["spec"]) => {
    const onSelect = spec.onSelect as (target: unknown) => void;
    onSelect(spec.bulk ? [row] : row);
  };

  if (actions.length <= AT_MOST_IN_THE_ROW) {
    return (
      <div className={styles.actions}>
        {actions.map(({ key, spec }) => (
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
      </div>
    );
  }
  return (
    <div className={styles.actions}>
      <Menu
        align="end"
        trigger={
          <Button size="sm" variant="ghost" aria-label={wording.rowActionsMenu(name)}>
            ⋯
          </Button>
        }
      >
        {actions.map(({ key, spec }) => (
          <MenuItem key={key} tone={spec.tone} onSelect={() => trigger(spec)}>
            {spec.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

/* ====================================================================== */
/* Loading                                                                  */
/* ====================================================================== */

function LoadingRows({ columns, rows = 4 }: { columns: number; rows?: number }) {
  const widths = [72, 48, 60, 40, 56, 64];
  return (
    <>
      {Array.from({ length: rows }, (_, z) => (
        <tr key={z} aria-hidden="true">
          {Array.from({ length: columns }, (_, s) => (
            <td key={s} className={styles.td}>
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

function FillerRow({ height, colSpan }: { height: number; colSpan: number }) {
  if (height <= 0) return null;
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
