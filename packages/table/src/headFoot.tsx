/* The table's <thead> and <tfoot>: the head row with its selection box,
   expander, span, columns and actions column, and the foot row of aggregates. */

import { Button, Checkbox, VisuallyHidden } from "@umriss-ui/core";
import type { Formats, Wording } from "@umriss-ui/core";
import { cx } from "./cx";
import type { ColumnEntry, HookSnapshot, Registry } from "./registry";
import type { TableProps } from "./types";
import { NOT_PINNED, pinnedCell, withEdge } from "./pinned";
import type { PinnedCell } from "./pinned";
import { AggregateValue, aggregateIsNumeric } from "./aggregateValue";
import { HeaderCell } from "./headerCell";
import { groupEdges } from "./columnGroup";
import type { Heading } from "./columnGroup";
import { lineKey } from "./frameLayout";
import type { FrameLayout } from "./frameLayout";
import styles from "./Table.module.css";

export function HeadRow({
  registry,
  hook,
  layout,
  props,
  wording,
}: {
  registry: Registry;
  hook: HookSnapshot;
  layout: FrameLayout;
  props: TableProps<unknown>;
  wording: Wording;
}) {
  const { selectable = false, grid: gridMode = false } = props;
  const { snapshot, spanEntry, dataColumns, expanderColumn, controlColumns, leading, rowMode, rowTools, trailing, columnCount, blocks } = layout;
  const pinAt = (first: number, last = first) => pinnedCell(blocks, first, last);
  /* The cells of a `ColumnGroup`: a run of neighbouring columns of one group
     and one pin side is one cell, so a group split by pinning shows its label
     over each part. The cells before and after the columns stand empty. */
  const runs: { heading?: Heading; side?: string; from: number; to: number }[] = [];
  dataColumns.forEach((e, i) => {
    const side = layout.pins[e.spec.id];
    const last = runs.at(-1);
    if (last && last.heading?.id === e.spec.heading?.id && last.side === side) last.to = i;
    else runs.push({ heading: e.spec.heading, side, from: i, to: i });
  });
  const grouped = dataColumns.some((e) => e.spec.heading);
  const edges = groupEdges(dataColumns);
  return (
    <thead>
      {grouped && (
        <tr data-head-group="" aria-rowindex={layout.numbered ? 1 : undefined}>
          {leading > 0 && <td colSpan={leading} className={cx(styles.th, pinAt(0, leading - 1).className)} style={pinAt(0, leading - 1).style} />}
          {runs.map(({ heading, from, to }) => {
            const pin = withEdge(pinAt(leading + from, leading + to), edges.has(dataColumns[from]!));
            const cell = cx(styles.th, heading && styles.headGroup, pin.className);
            return heading ? (
              <th key={from} scope="colgroup" colSpan={to - from + 1} className={cell} style={pin.style}>
                {heading.label}
              </th>
            ) : (
              <td key={from} colSpan={to - from + 1} className={cell} style={pin.style} />
            );
          })}
          {trailing && <td className={cx(styles.th, pinAt(columnCount - 1).className)} style={pinAt(columnCount - 1).style} />}
        </tr>
      )}
      <tr aria-rowindex={layout.numbered ? (grouped ? 2 : 1) : undefined} data-grid-line={lineKey(gridMode, "head")}>
        {selectable && (
          <th scope="col" className={cx(styles.th, styles.control, pinAt(0).className)} style={pinAt(0).style}>
            <Checkbox
              aria-label={snapshot.server ? wording.selectAllOnPage : wording.selectAllRows}
              checked={snapshot.selection.allSelected}
              indeterminate={snapshot.selection.someSelected}
              onChange={hook.pickAll}
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
          <HeaderCell key={e.key} entry={e} registry={registry} hook={hook} pin={withEdge(pinAt(leading + i), edges.has(e))} />
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
  );
}

export function FootRow({
  layout,
  gridMode,
  formats,
  wording,
}: {
  layout: FrameLayout;
  gridMode: boolean;
  formats: Formats;
  wording: Wording;
}) {
  const { projection, spanEntry, dataColumns, controlColumns, leading, trailing, columnCount, blocks } = layout;
  const pinAt = (first: number, last = first) => pinnedCell(blocks, first, last);
  const edges = groupEdges(dataColumns);
  return (
    <tfoot>
      <tr aria-rowindex={layout.numbered ? layout.rowTotal + 1 + layout.headRows : undefined} data-grid-line={lineKey(gridMode, "foot")}>
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
            pin={withEdge(pinAt(leading + i), edges.has(e))}
            totals={layout.totals}
            busy={layout.busy}
          />
        ))}
        {trailing && (
          <td className={cx(styles.td, pinAt(columnCount - 1).className)} style={pinAt(columnCount - 1).style} />
        )}
      </tr>
    </tfoot>
  );
}

function FooterCell({
  entry,
  rows,
  formats,
  wording,
  pin = NOT_PINNED,
  topLevel = false,
  totals,
  busy = false,
}: {
  entry: ColumnEntry;
  rows: readonly unknown[];
  formats: Formats;
  wording: Wording;
  pin?: PinnedCell;
  /** Tree rows: the aggregate is over the roots, and says so. */
  topLevel?: boolean;
  /** Server mode: the values over every match, by column id. */
  totals?: Readonly<Record<string, unknown>>;
  /** Server mode: the totals are not current. */
  busy?: boolean;
}) {
  if (!entry.spec.aggregate) return <td className={cx(styles.td, pin.className)} style={pin.style} />;
  const kind = typeof entry.spec.aggregate === "function" ? "own" : entry.spec.aggregate;
  if (totals) {
    return (
      <td className={cx(styles.td, aggregateIsNumeric(entry, rows) && styles.numeric, pin.className)} style={pin.style} data-footer={kind}>
        {busy ? (
          <span aria-hidden="true" className={styles.skeleton} style={{ width: "60%" }} />
        ) : (
          <AggregateValue entry={entry} rows={rows} formats={formats} wording={wording} signed given={{ value: totals[entry.spec.id] }} />
        )}
        <VisuallyHidden>{` (${wording.footerOfMatches})`}</VisuallyHidden>
      </td>
    );
  }
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
