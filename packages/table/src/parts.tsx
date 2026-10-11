/* The parts the hook hands out: Table, Column, RowDetail, RowActions, Action, GroupBy.
   They come into being ONCE per hook call and keep their identity - a new
   identity per render would remount every column (Ticket 02). The state of the
   table they read from the registry, which the hook writes on every pass.

   The table renders its rows itself. Because everything that makes up a column
   stands in one element, it applies hiding and reordering to header, body and
   footer at once - the error this package exists for (reordered in the model,
   left standing on screen) can no longer be written that way. */

import { useContext, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
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

/* The props as they arrive at runtime. The types at the call site (types.ts) are
   stricter; here only what is there counts. */
interface RuntimeColumnProps {
  id?: string;
  value: string | ((row: never) => unknown);
  label: string;
  children?: unknown;
  format?: ColumnSpec["format"];
  aggregate?: ColumnSpec["aggregate"];
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
  return {
    id,
    label: props.label,
    value: props.value,
    presentation: typeof props.children === "function" ? (props.children as ColumnSpec["presentation"]) : undefined,
    format: props.format,
    aggregate: props.aggregate,
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

  function RowActions({ children, pin = true }: { children: ReactNode; pin?: boolean }): ReactNode {
    const key = useId();
    registry.registerActionGroup(key, pin);
    useLayoutEffect(
      () => () => {
        registry.removeActionGroup(key);
        registry.commit();
      },
      [key],
    );
    useLayoutEffect(() => {
      registry.registerActionGroup(key, pin);
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
    if (registry.server && props.groupable === true) {
      warnOnce("server-groupable", "`groupable` is passed over in server mode: the groups would be the page's, not the server's.");
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
