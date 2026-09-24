/* The lines of a grouped table (table-grouping 04, ADR-0029).

   A header band heads a group of an outer level: its value and count in the
   first cell, stretched over every leading column without an aggregate, then
   the group's aggregates in their columns. The innermost level is a span: its
   grouping column stands first and shows the value on the group's first row -
   a cell in every row, never a `rowspan`, because a spanning cell could not be
   cut by a page or a virtual window. Folded, a span is one line.

   The relations are the prototype's (.scratch/table-grouping/spec.md, "How it
   looks"): a band is exactly one row high, every level has one fold slot of
   20 px, and a line is only as strong as the boundary it draws. */

import type { CSSProperties, ReactNode } from "react";
import type { Formats, Wording } from "@umriss-ui/core";
import { cx } from "./cx";
import { AggregateValue, aggregateIsNumeric } from "./aggregateValue";
import type { ColumnEntry, HookSnapshot } from "./registry";
import { aggregate } from "./model/grouping";
import type { Line, RowGroup } from "./model/grouping";
import { asText } from "./values";
import styles from "./Table.module.css";

/** ISO week number of a Monday-started week. */
function isoWeek(date: Date): { week: number; year: number } {
  const thursday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const week = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / 86_400_000 / 7 - ((firstThursday.getDay() + 6) % 7 - 3) / 7);
  return { week, year: thursday.getFullYear() };
}

/** A group's value as text - for the fold's name and wherever no presentation
    stands. */
export function groupText(entry: ColumnEntry | undefined, value: unknown, formats: Formats, wording: Wording): string {
  if (value === undefined) return wording.groupNoValue;
  const spec = entry?.spec;
  if (spec?.group && value instanceof Date) {
    if (spec.group === "year") return String(value.getFullYear());
    if (spec.group === "month") return formats.month(value);
    if (spec.group === "week") {
      const { week, year } = isoWeek(value);
      return wording.calendarWeek(week, year);
    }
    return formats.date(value);
  }
  const format = spec?.ownGroupValue ? undefined : spec?.format;
  return asText(value, format, formats, wording) ?? String(value);
}

/** A group's value as it appears: through the column's presentation where the
    group is the column's own value, otherwise as text. */
function GroupValue({ entry, group, formats, wording }: { entry: ColumnEntry | undefined; group: RowGroup<unknown>; formats: Formats; wording: Wording }) {
  const spec = entry?.spec;
  if (group.value !== undefined && spec?.presentation && !spec.ownGroupValue && !spec.group) {
    return <>{(spec.presentation as (v: unknown, z: unknown) => ReactNode)(group.value, group.rows[0])}</>;
  }
  return <>{groupText(entry, group.value, formats, wording)}</>;
}

/** The fold of a group - or, for a group of one row, the empty slot that keeps
    every level's text on one vertical. */
function Fold({
  group,
  entry,
  open,
  hook,
  formats,
  wording,
}: {
  group: RowGroup<unknown>;
  entry: ColumnEntry | undefined;
  open: boolean;
  hook: HookSnapshot;
  formats: Formats;
  wording: Wording;
}) {
  if (group.rows.length < 2) return <span className={styles.foldSlot} aria-hidden="true" />;
  const name = groupText(entry, group.value, formats, wording);
  const count = formats.count(group.rows.length);
  return (
    <button
      type="button"
      className={cx(styles.fold, !open && styles.foldClosed)}
      aria-expanded={open}
      aria-label={open ? wording.foldGroup(name, count) : wording.unfoldGroup(name, count)}
      onClick={(event) => (event.altKey ? foldSiblings(group, open, hook) : hook.publicSnapshot.toggleFold(group.path))}
    >
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
        <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/* Alt on a fold folds - or unfolds - every group of its level. */
function foldSiblings(group: RowGroup<unknown>, open: boolean, hook: HookSnapshot) {
  const snapshot = hook.publicSnapshot;
  const siblings: RowGroup<unknown>[] = [];
  const walk = (groups: readonly RowGroup<unknown>[]) => {
    for (const g of groups) {
      if (g.level === group.level && g.rows.length > 1) siblings.push(g);
      else walk(g.groups);
    }
  };
  walk(hook.companion.groups ?? []);
  for (const g of siblings) {
    if (snapshot.folded.includes(g.path) === open) continue;
    snapshot.toggleFold(g.path);
  }
}

/** The span cell of a row - its value on the group's first row only. */
export function SpanCell({
  line,
  entry,
  hook,
  formats,
  wording,
}: {
  line: Extract<Line<unknown>, { kind: "row" }>;
  entry: ColumnEntry | undefined;
  hook: HookSnapshot;
  formats: Formats;
  wording: Wording;
}) {
  const group = line.span;
  return (
    <td className={cx(styles.td, styles.spanCell)}>
      {line.first && (
        <span className={styles.spanValue}>
          <Fold group={group} entry={entry} open hook={hook} formats={formats} wording={wording} />
          <span className={styles.spanText}>
            <GroupValue entry={entry} group={group} formats={formats} wording={wording} />
            {line.continued && <span className={styles.continued}>{wording.groupContinued}</span>}
          </span>
          {group.rows.length > 1 && <span className={styles.groupCount}>{formats.count(group.rows.length)}</span>}
        </span>
      )}
    </td>
  );
}

/** A header band or a folded span: one line for a whole group. */
export function GroupLine({
  line,
  index,
  absolute,
  spanEntry,
  levelEntry,
  columns,
  controlColumns,
  hasActions,
  total,
  hook,
  formats,
  wording,
}: {
  line: Extract<Line<unknown>, { kind: "header" | "folded" }>;
  index: number;
  absolute: number | undefined;
  spanEntry: ColumnEntry | undefined;
  /** The column or group key of the group's level. */
  levelEntry: ColumnEntry | undefined;
  columns: readonly ColumnEntry[];
  controlColumns: number;
  hasActions: boolean;
  /** The filtered set - what a share is a share of. */
  total: readonly unknown[];
  hook: HookSnapshot;
  formats: Formats;
  wording: Wording;
}) {
  const { group } = line;
  const header = line.kind === "header";
  const open = header && !hook.publicSnapshot.folded.includes(group.path);
  const single = group.rows.length < 2;
  /* The leading columns without an aggregate: a band's label stretches over
     them, a folded span's "3 entries" stands in them. */
  const leading = columns.findIndex((e) => e.spec.aggregate !== undefined);
  const lead = leading === -1 ? columns.length : leading;
  const rest = columns.slice(lead);
  const virtual = absolute !== undefined;

  const label = (
    <span className={styles.groupLabel}>
      <Fold group={group} entry={levelEntry} open={open} hook={hook} formats={formats} wording={wording} />
      <span className={styles.groupValue}>
        <GroupValue entry={levelEntry} group={group} formats={formats} wording={wording} />
      </span>
      {!single && <span className={styles.groupCount}>{formats.count(group.rows.length)}</span>}
      {header && line.continued && <span className={styles.continued}>{wording.groupContinued}</span>}
    </span>
  );

  return (
    <tr
      className={cx(header ? styles.groupHeader : styles.groupFolded, virtual && styles.virtualRow)}
      data-line={line.kind}
      data-level={group.level}
      data-continued={header && line.continued ? "" : undefined}
      data-group-first={header ? undefined : ""}
      data-row={virtual ? absolute : undefined}
      aria-rowindex={virtual ? absolute + 2 : undefined}
      data-index={index}
      style={header ? ({ "--u-band-level": group.level } as CSSProperties) : undefined}
    >
      {Array.from({ length: controlColumns }, (_, i) => (
        <td key={`c${i}`} className={cx(styles.td, styles.control)} />
      ))}
      {header ? (
        <td className={styles.td} colSpan={1 + lead} style={{ paddingLeft: `calc(var(--u-space-3) + ${group.level * 20}px)` }}>
          {label}
        </td>
      ) : (
        <>
          <td className={cx(styles.td, styles.spanCell)}>
            <span className={styles.spanValue}>
              <Fold group={group} entry={spanEntry} open={false} hook={hook} formats={formats} wording={wording} />
              <span className={styles.spanText}>
                <GroupValue entry={spanEntry} group={group} formats={formats} wording={wording} />
              </span>
              <span className={styles.groupCount}>{formats.count(group.rows.length)}</span>
            </span>
          </td>
          {lead > 0 && (
            <td className={cx(styles.td, styles.foldedCount)} colSpan={lead}>
              {wording.entries(group.rows.length, formats.count(group.rows.length))}
            </td>
          )}
        </>
      )}
      {rest.map((entry) => (
        <AggregateCell
          key={entry.key}
          entry={entry}
          group={group}
          share={header && !single}
          total={total}
          formats={formats}
          wording={wording}
          shown={!single}
        />
      ))}
      {hasActions && <td className={styles.td} />}
    </tr>
  );
}

function AggregateCell({
  entry,
  group,
  share,
  total,
  formats,
  wording,
  shown,
}: {
  entry: ColumnEntry;
  group: RowGroup<unknown>;
  share: boolean;
  total: readonly unknown[];
  formats: Formats;
  wording: Wording;
  shown: boolean;
}) {
  const { spec } = entry;
  if (!spec.aggregate || !shown) return <td className={styles.td} />;
  let bar: ReactNode = null;
  if (share && spec.aggregate === "sum" && spec.share !== false) {
    const whole = aggregate({ id: spec.id, read: entry.read, aggregate: "sum" }, total);
    const part = group.aggregates[spec.id];
    if (typeof whole === "number" && whole > 0 && typeof part === "number" && part > 0) {
      const share = Math.min(1, part / whole);
      bar = (
        <span className={styles.shareBar} style={{ width: `${Math.max(2, Math.round(share * 64))}px` }} aria-hidden="true" />
      );
    }
  }
  return (
    <td className={cx(styles.td, aggregateIsNumeric(entry, group.rows) && styles.numeric, styles.aggregateCell)} data-aggregate={typeof spec.aggregate === "function" ? "own" : spec.aggregate}>
      <AggregateValue entry={entry} rows={group.rows} formats={formats} wording={wording} />
      {bar}
    </td>
  );
}
