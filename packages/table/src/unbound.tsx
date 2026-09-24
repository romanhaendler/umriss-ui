/* The unbound parts: Toolbar, Search, ColumnMenu, Export, Pagination
   (umriss-table 08). They touch no row and therefore need no binding - placed
   inside a table they read that one, outside they take `of={t}`.

   Two decisions stand here:

   - **Export makes the file.** The old rule - the library gives text, the
     application makes the file - remains as `t.asCsv()` and as `onExport`. But
     the part itself exists for exactly the case in which the application wants
     nothing further than a file; without `onExport` it therefore triggers the
     download.
   - **Empty and loading are props of the table** (`empty`, `loading`), not
     parts. They are states of the one body, not pieces one puts somewhere -
     and a part would need a registration that gains nothing. Empty because of
     a search or a filter the table shows of its own accord, with the way
     back. */

import { useLayoutEffect, useRef, useState, useId } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button, Checkbox, Input, Popover, Select, useFormats, useWording } from "@umriss-ui/core";
import { cx } from "./cx";
import { useConnection } from "./context";
import { TableToolbar } from "./toolbar";
import { GroupingChoice } from "./groupingChoice";
import type { PartKind, Registry } from "./registry";
import { orderColumns } from "./model/tableModel";
import type { TableRef } from "./types";
import styles from "./Table.module.css";

/** Registers a part at its table for as long as it stands: first during the
    render - idempotently (registry.ts, guarantee 1) - so that the table knows
    what stands there already in the first frame, and then once more from the
    layout effect, which also deregisters it. */
function useRegistration(registry: Registry | undefined, kind: PartKind) {
  const key = useId();
  registry?.register(kind, key);
  useLayoutEffect(() => {
    if (!registry) return;
    registry.register(kind, key);
    registry.commit();
    return () => {
      registry.remove(kind, key);
      registry.commit();
    };
  }, [registry, kind, key]);
}

/* ---------------------------------------------------------------- Toolbar */

export interface ToolbarProps {
  /** Search, column menu, export – on the left in the table toolbar, before the conditions. */
  children?: ReactNode;
  /** Classes on the table toolbar. */
  className?: string;
  /** The table, when the table toolbar does not stand inside it. If it then
      stands behind the table in the tree, it registers only after the first
      frame – until then a table with a search or a column filter shows its own
      toolbar. Placed before the table, there is no such change. */
  of?: TableRef;
}

/** The table toolbar: on the left whatever one puts into it, and the conditions
    of the column filters; on the right the ratio of the filtered set to all
    rows and "reset" as long as something restricts, and the count of the
    selection with the bulk actions. A table with a search or a column filter
    has one, even where none stands; where one stands, there is no second. */
export function Toolbar({ children, className, of }: ToolbarProps) {
  const connection = useConnection(of);
  // A toolbar that has been put there registers, so that the table puts up none of its own.
  useRegistration(connection?.registry, "toolbar");
  const registry = connection?.registry;

  return (
    <TableToolbar registry={registry ?? null} className={className}>
      {children}
    </TableToolbar>
  );
}

/* ----------------------------------------------------------------- Search */

export interface SearchProps {
  /** The placeholder in the field; without it "Search …" from the wording. */
  placeholder?: string;
  /** Accessible name; without it "Search table" from the wording. */
  "aria-label"?: string;
  /** Classes on the field. */
  className?: string;
  /** The table, when the part does not stand inside it: the return value of `useTable`. */
  of?: TableRef;
}

export function Search({ placeholder, "aria-label": name, className, of }: SearchProps) {
  const connection = useConnection(of);
  const wording = useWording();
  /* With a search the table puts up a table toolbar when none stands - the
     ratio of the filtered set needs a place. */
  useRegistration(connection?.registry, "search");
  if (!connection) return null;
  const { snapshot } = connection;
  return (
    <Input
      size="sm"
      type="search"
      className={className}
      value={snapshot.search}
      onChange={(event) => snapshot.setSearch(event.target.value)}
      clearable
      onClear={() => snapshot.setSearch("")}
      placeholder={placeholder ?? wording.tableSearchPlaceholder}
      aria-label={name ?? wording.tableSearchLabel}
    />
  );
}

/* ------------------------------------------------------------- ColumnMenu */

export interface ColumnMenuProps {
  /** The table, when the part does not stand inside it: the return value of `useTable`. */
  of?: TableRef;
}

/** Show and hide columns and arrange them. Every control is a real control -
    a box or a button -, so it is reachable without a pointer; after a move the
    focus stays on the button that was pressed. */
export function ColumnMenu({ of }: ColumnMenuProps) {
  const connection = useConnection(of);
  const wording = useWording();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const panelId = useId();
  /* Which button gets the focus back after the move. The element wanders to its
     new place in the DOM, and an element that has been moved loses the focus in
     the browser. */
  const [focusAfter, setFocusAfter] = useState<{ id: string; direction: "forward" | "backward" } | null>(null);

  useLayoutEffect(() => {
    if (!focusAfter || !list.current) return;
    /* The search goes over the children, not over a selector: an id may
       contain characters a selector would want escaped first. */
    const entry = Array.from(list.current.children).find(
      (child) => (child as HTMLElement).dataset.column === focusAfter.id,
    );
    const wanted = entry?.querySelector<HTMLButtonElement>(`[data-direction="${focusAfter.direction}"]`);
    const other = entry?.querySelector<HTMLButtonElement>(
      `[data-direction="${focusAfter.direction === "forward" ? "backward" : "forward"}"]`,
    );
    (wanted && !wanted.disabled ? wanted : other)?.focus();
  }, [focusAfter]);

  if (!connection) return null;
  const { registry, snapshot } = connection;
  const hook = registry.hook!;
  const ordered = registry.withStickyHeaderFirst(
    orderColumns(registry.modelColumns(hook.rows, hook.formats), snapshot.order),
  );
  /* A sticky row header stands first and stays there; nothing goes before it. */
  const pinned = registry.stickyRowHeader ? ordered[0]?.hideable === false : false;

  const move = (index: number, step: -1 | 1) => {
    const ids = ordered.map((s) => s.id);
    const target = index + step;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    snapshot.setOrder(ids);
    setFocusAfter({ id: ordered[index]!.id, direction: step < 0 ? "forward" : "backward" });
  };

  return (
    <>
      <Button
        ref={button}
        size="sm"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen(!open)}
      >
        {wording.columns}
      </Button>
      <Popover
        open={open}
        onOpenChange={setOpen}
        anchorRef={button}
        align="end"
        role="dialog"
        ariaLabel={wording.arrangeColumns}
        id={panelId}
        className={styles.columnsPanel}
      >
        <ul ref={list} className={styles.columnsList} aria-label={wording.arrangeColumns}>
          {ordered.map((column, index) => {
            const label = column.label ?? column.id;
            return (
              <li key={column.id} className={styles.columnsEntry} data-column={column.id}>
                <Checkbox
                  label={label}
                  checked={!snapshot.hidden.includes(column.id)}
                  /* The row header names the row and stays. */
                  disabled={column.hideable === false}
                  onChange={() => snapshot.toggleColumn(column.id)}
                />
                <button
                  type="button"
                  className={styles.move}
                  data-direction="forward"
                  aria-label={wording.columnForward(label)}
                  disabled={index === 0 || (pinned && index <= 1)}
                  onClick={() => move(index, -1)}
                >
                  <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
                    <path d="M2 6.5 5 3.5l3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={styles.move}
                  data-direction="backward"
                  aria-label={wording.columnBackward(label)}
                  disabled={index === ordered.length - 1 || (pinned && index === 0)}
                  onClick={() => move(index, 1)}
                >
                  <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
                    <path d="M2 3.5 5 6.5l3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
        <GroupingChoice registry={registry} hook={hook} />
      </Popover>
    </>
  );
}

/* ----------------------------------------------------------------- Export */

export interface ExportProps {
  /** File name of the download. Without it the one from the wording ("table.csv"). */
  filename?: string;
  /** Gets the text instead of triggering a file. */
  onExport?: (text: string) => void;
  /** The table, when the part does not stand inside it: the return value of `useTable`. */
  of?: TableRef;
}

/** Writes the filtered set in the visible columns and their order – with the
    values, not with their presentation. */
export function Export({ filename, onExport, of }: ExportProps) {
  const connection = useConnection(of);
  const wording = useWording();
  if (!connection) return null;
  const { snapshot } = connection;

  const exportCsv = () => {
    const text = snapshot.asCsv();
    if (onExport) {
      onExport(text);
      return;
    }
    const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename ?? wording.exportFileName;
    anchor.click();
    /* Not at once: some browsers (Safari among them) fetch the address only
       after the click has returned, and a revoked one yields no file. */
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  return (
    <Button size="sm" onClick={exportCsv}>
      {wording.exportLabel}
    </Button>
  );
}

/* ------------------------------------------------------------- Pagination */

export interface PaginationProps {
  /** The selectable page sizes; default 10, 25, 50. */
  pageSizes?: readonly number[];
  /** Classes on the pagination bar. */
  className?: string;
  /** The table, when the part does not stand inside it: the return value of `useTable`. */
  of?: TableRef;
}

/** The pagination bar. Inside the table it stands underneath it, wherever it
    stands in the JSX; a virtualised table does not page, and then it is not
    there. Without it the table does not page but shows all filtered rows –
    `pageSize` holds as soon as a pagination bar stands. Whoever places it
    outside the table puts it before the table: after it, it registers only
    after the first frame. */
export function Pagination({ pageSizes = [10, 25, 50], className, of }: PaginationProps) {
  const connection = useConnection(of);
  const wording = useWording();
  const formats = useFormats();
  // Only with a pagination bar does the table page.
  useRegistration(connection?.registry, "pagination");

  if (!connection || connection.snapshot.virtual) return null;
  const { snapshot } = connection;
  const count = snapshot.filtered.length;
  const sizes = pageSizes.includes(snapshot.pageSize)
    ? pageSizes
    : [...pageSizes, snapshot.pageSize].sort((a, b) => a - b);

  const bar = (
    <nav aria-label={wording.pagination} className={cx(styles.pagination, className)}>
      <span>{wording.entries(count, formats.count(count))}</span>
      <div className={styles.paginationControls}>
        <label className={styles.pageSize}>
          {wording.rows}
          <Select
            selectSize="sm"
            value={snapshot.pageSize}
            onChange={(event) => snapshot.setPageSize(Number(event.target.value))}
            aria-label={wording.rowsPerPage}
          >
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </label>
        <span className={styles.paginationStatus}>{wording.pageOfPages(snapshot.page, snapshot.pageCount)}</span>
        <Button size="sm" disabled={snapshot.page <= 1} onClick={() => snapshot.setPage(snapshot.page - 1)}>
          {wording.previousPage}
        </Button>
        <Button size="sm" disabled={snapshot.page >= snapshot.pageCount} onClick={() => snapshot.setPage(snapshot.page + 1)}>
          {wording.nextPage}
        </Button>
      </div>
    </nav>
  );

  if (!connection.inside) return bar;
  return connection.footerTarget ? createPortal(bar, connection.footerTarget) : null;
}
