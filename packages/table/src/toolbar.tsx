/* The table toolbar (umriss-table 08, table-filters 04).

   On the left, whatever one puts into it, and the conditions of the column
   filters in the order in which they were set; on the right the ratio of the
   filtered set to the rows the pre-filter admits, the way back and, as long as
   a selection exists, its count and the bulk actions.

   The toolbar is the one place where a condition appears, and it stands there
   before anything restricts: a row of its own that came into being with the
   first keystroke would push the table down and, on clearing, up again (D1).
   The search has no condition - its field shows it already (D2) - but it
   counts, and "reset" clears it. The ratio stands in a status that remains in
   the document even when empty: a screen reader announces changes only to a
   region it already knows. */

import type { ReactNode } from "react";
import { Button, useFormats, useWording } from "@umriss-ui/core";
import { resetSearchAndFilters } from "./export";
import { cx } from "./cx";
import { Conditions } from "./filter";
import { GroupingTag } from "./groupingChoice";
import { ToolbarSizeContext, useToolbarSize } from "./toolbarSize";
import type { ToolbarSize } from "./toolbarSize";
import type { Registry } from "./registry";
import styles from "./Table.module.css";

/** "New row" (ADR-0036): opens an empty Row draft above the rows of a grid
    with `onRowAdd` - in the toolbar, or beneath the table without one. */
export function NewRowButton({ registry }: { registry: Registry }) {
  const wording = useWording();
  const size = useToolbarSize();
  return (
    <Button size={size} variant="secondary" onClick={() => registry.addRow?.()}>
      {wording.newRow}
    </Button>
  );
}

export function TableToolbar({
  registry,
  className,
  children,
  own = false,
  size = "sm",
}: {
  registry: Registry | null;
  className?: string;
  children?: ReactNode;
  /** The toolbar the table puts up itself: it carries only conditions, the
      ratio and the way back. The selection and its bulk actions belong to a
      toolbar somebody put there - otherwise a control nobody provided for
      would appear with the first tick. */
  own?: boolean;
  /** The size of the controls in it (toolbarSize.ts). */
  size?: ToolbarSize;
}) {
  const wording = useWording();
  const formats = useFormats();
  const hook = registry?.hook ?? null;

  let conditions: ReactNode = null;
  let right: ReactNode = null;
  if (registry && hook) {
    const snapshot = hook.publicSnapshot;
    const restricted = snapshot.search !== "" || Object.keys(snapshot.filter).length > 0;
    /* The selection WITHIN the filtered set - the same set the user sees and
       the one "select all" acts on. What lies outside stays selected but is
       not treated along with it: a button that does more than it announces is
       the worst kind of button. */
    const selected = own
      ? []
      : (hook.selectedRows ?? snapshot.filtered.filter((row) => snapshot.selection.isSelected(hook.rowKey(row))));
    const bulkActions = registry.hasRowActions() ? registry.actions.ordered().filter((a) => a.spec.bulk) : [];

    conditions = (
      <>
        <GroupingTag registry={registry} hook={hook} />
        <Conditions registry={registry} hook={hook} />
      </>
    );
    /* Holding nothing but the empty ratio, the group leaves the flow. Said
       here, not by `:has(:empty)` in the style: a browser that does not ask
       that again when the ratio's text comes kept the group out of the flow,
       and the ratio stood over the search. */
    const idle = !restricted && selected.length === 0 && !registry.rowAdding;
    right = (
      <div className={cx(styles.toolbarGroup, idle && styles.toolbarGroupIdle)}>
        <span role="status" className={styles.filteredCount}>
          {!restricted
            ? ""
            : snapshot.manual
              ? /* The server counts the matches only; a total beside them would be a second request. */
                wording.entries(snapshot.rowCount, formats.count(snapshot.rowCount))
              : wording.filteredOfTotal(formats.count(snapshot.filtered.length), formats.count(hook.companion.total ?? hook.admitted.length))}
        </span>
        {restricted && (
          <Button size={size} variant="ghost" onClick={() => resetSearchAndFilters(snapshot)}>
            {wording.resetAll}
          </Button>
        )}
        {selected.length > 0 && (
          <>
            <span className={styles.toolbarInfo}>{wording.selectedCount(selected.length, formats.count(selected.length))}</span>
            {bulkActions.map(({ key, spec }) => (
              <Button
                key={key}
                size={size}
                variant={spec.tone === "danger" ? "danger" : "secondary"}
                onClick={() => (spec.onSelect as (rows: readonly unknown[]) => void)(selected)}
              >
                {spec.label}
              </Button>
            ))}
          </>
        )}
        {registry.rowAdding && <NewRowButton registry={registry} />}
      </div>
    );
  }

  return (
    <ToolbarSizeContext.Provider value={size}>
      <div className={cx(styles.toolbar, size === "md" && styles.toolbarMd, className)}>
        <div className={styles.toolbarGroup}>
          {children}
          {conditions}
        </div>
        {right}
      </div>
    </ToolbarSizeContext.Provider>
  );
}
