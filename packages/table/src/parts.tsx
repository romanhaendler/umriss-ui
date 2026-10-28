/* The parts the hook hands out: Table, Column, RowDetail, RowActions, Action, GroupBy.
   They come into being ONCE per hook call and keep their identity - a new
   identity per render would remount every column (Ticket 02). The state of the
   table they read from the registry, which the hook writes on every pass.

   The table renders its rows itself. Because everything that makes up a column
   stands in one element, it applies hiding and reordering to header, body and
   footer at once - the error this package exists for (reordered in the model,
   left standing on screen) can no longer be written that way. */

import { useContext, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";
import { DEV, warnOnce } from "./dev";
import { TableToolbar } from "./toolbar";
import { TableContext } from "./context";
import type { TableContextValue } from "./context";
import type { Registry, ColumnSpec } from "./registry";
import { link } from "./registry";
import type { TableProps } from "./types";
import { Frame } from "./frame";
import styles from "./Table.module.css";

/* The props the table reads itself: what is left of its props is the frame's
   rest (ADR-0068). */
const OWN = [
  "selectable", "stickyHeader", "stickyRowHeader", "striped", "density", "maxHeight", "empty", "loading",
  "rowProps", "groupable", "grid", "onCellEdit", "editMode", "onRowSave", "onRowAdd", "newRow", "onRowDelete", "currentRow", "onCurrentRowChange",
] as const satisfies readonly (keyof TableProps<unknown>)[];

/* A prop that is neither listed above nor a div attribute, the ref, the
   children or a name taken out in `Table` would reach the frame's <div>; the
   compiler refuses it here. */
type Unlisted = Exclude<keyof TableProps<unknown>, keyof HTMLAttributes<HTMLDivElement> | "ref" | "children" | (typeof OWN)[number]>;
true satisfies [Unlisted] extends [never] ? true : Unlisted;

/* The props as they arrive at runtime. The types at the call site (types.ts) are
   stricter; here only what is there counts. */
interface RuntimeColumnProps {
  id?: string;
  value: string | ((row: never) => unknown);
  label: string;
  children?: unknown;
  format?: ColumnSpec["format"];
  aggregate?: ColumnSpec["aggregate"];
  aggregateLabel?: string;
  share?: boolean;
  rowHeader?: boolean;
  numeric?: boolean;
  width?: number;
  flex?: number;
  minWidth?: number;
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
  RowActions: (props: { children: ReactNode; pin?: boolean }) => ReactNode;
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
  if (props.children !== undefined && typeof props.children !== "function") {
    warnOnce(`children:${id}`, `The children of the column "${id}" are not a function and are passed over.`);
  }
  if (props.aggregateLabel !== undefined && props.aggregate !== undefined && typeof props.aggregate !== "function") {
    warnOnce(`aggregate-label:${id}`, `\`aggregateLabel\` of the column "${id}" is ignored: a built-in kind's word is the wording's.`);
  }
  return {
    id,
    label: props.label,
    value: props.value,
    presentation: typeof props.children === "function" ? (props.children as ColumnSpec["presentation"]) : undefined,
    format: props.format,
    aggregate: props.aggregate,
    aggregateLabel: typeof props.aggregate === "function" ? props.aggregateLabel : undefined,
    share: props.share,
    rowHeader: props.rowHeader === true,
    rightAligned: props.numeric,
    width: props.width,
    flex: props.flex,
    minWidth: props.minWidth,
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

/* What every registering part does after its render: take its entry out when it
   unmounts, and on every commit make sure it stands (the Strict Mode's second
   mount removed it in between), check the order against the DOM where the part
   has a place in an order, and report. */
function useRegistered(registry: Registry, key: string, remove: () => void, ensure: () => void, ordered: boolean) {
  useLayoutEffect(
    () => () => {
      remove();
      registry.commit();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the cleanup runs on unmount only (or a new key), never on a new closure
    [key],
  );
  useLayoutEffect(() => {
    ensure();
    if (ordered) registry.checkOrder();
    registry.commit();
  });
}

export function buildParts(registry: Registry): Parts {
  /* ---------------------------------------------------------------- Column */

  function Column(props: RuntimeColumnProps): ReactNode {
    const key = useId();
    const surrounding = useContext(TableContext);
    const spec = specFrom(props);
    // Writes idempotently (registry.ts, guarantee 1).
    registry.registerColumn(key, spec);

    useRegistered(registry, key, () => registry.removeColumn(key), () => {
      registry.ensureColumn(key, spec);
    }, true);

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
    useRegistered(registry, key, () => registry.removeDetail(key), () => {
      if (!registry.detail) registry.registerDetail(key, children);
    }, false);
    return null;
  }

  /* ------------------------------------------------------ RowActions, Action */

  function RowActions({ children, pin = true }: { children: ReactNode; pin?: boolean }): ReactNode {
    const key = useId();
    registry.registerActionGroup(key, pin);
    useRegistered(registry, key, () => registry.removeActionGroup(key), () => {
      registry.registerActionGroup(key, pin);
    }, false);
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
    useRegistered(registry, key, () => registry.removeAction(key), () => {
      registry.ensureAction(key, spec);
    }, true);
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
    useRegistered(registry, key, () => registry.removeGroupKey(key), () => {
      registry.ensureGroupKey(key, spec);
    }, true);
    return <span hidden data-umriss-groupkey={key} />;
  }

  /* ----------------------------------------------------------------- Table */

  function Table(props: TableProps<unknown>): ReactNode {
    // All idempotent (registry.ts, guarantee 1).
    registry.beginPass();
    registry.setStickyRowHeader(props.stickyRowHeader === true);
    registry.setTableGroupable(props.groupable !== false);
    registry.setRowAdding(props.grid === true && props.onRowAdd !== undefined);
    if (registry.server && props.groupable === true) {
      warnOnce("server-groupable", "`groupable` is passed over in server mode: the groups would be the page's, not the server's.");
    }
    /* The frame takes ref, class, style and the rest; the three names go to
       the <table> (ADR-0068). What the table itself reads is taken out first. */
    const {
      ref, className, style, children,
      "aria-label": label, "aria-labelledby": labelledBy, "aria-describedby": describedBy,
      ...others
    } = props;
    const rest: Record<string, unknown> = { ...others };
    for (const key of OWN) delete rest[key];
    const name = { "aria-label": label, "aria-labelledby": labelledBy, "aria-describedby": describedBy };
    const childrenRef = useRef<HTMLDivElement>(null);
    const [footerTarget, setFooterTarget] = useState<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
      registry.children = childrenRef.current;
      registry.checkOrder();
      registry.commit();
    });

    const contextValue = useMemo<TableContextValue>(() => ({ registry, footerTarget }), [footerTarget]);

    return (
      <TableContext value={contextValue}>
        <div {...rest} ref={ref} className={cx(styles.frame, className)} style={style}>
          <div ref={childrenRef} className={styles.children}>
            {children}
          </div>
          {/* After the children: toolbar and frame read the columns that
              registered in this pass - and the toolbar knows whether a table
              toolbar already stood among them. */}
          <OwnToolbar registry={registry} />
          <Frame registry={registry} props={props} name={name} />
          <div ref={setFooterTarget} className={styles.footerTarget} />
        </div>
      </TableContext>
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
