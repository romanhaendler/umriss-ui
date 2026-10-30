/* The table's <tbody>: placeholders while loading, the empty message, grouped
   lines, a virtual window of rows or plain rows - one branch per state - and
   the body of the new row above them. */

import type { ReactNode } from "react";
import { Button } from "@umriss-ui/core";
import type { Formats, Wording } from "@umriss-ui/core";
import styles from "./Table.module.css";
import { resetSearchAndFilters } from "./export";
import type { HookSnapshot, Registry } from "./registry";
import type { TableProps } from "./types";
import { isRightAligned } from "./values";
import { withContinuation } from "./model/grouping";
import type { Line } from "./model/grouping";
import { GroupLine } from "./groupLines";
import { NEW_LINE } from "./grid";
import { lineKey } from "./frameLayout";
import type { FrameLayout } from "./frameLayout";
import { Row } from "./row";
import { FillerRow, LoadingRows, VirtualBody } from "./virtualBody";

/** What the body's branches draw from. */
export interface BodyContext {
  registry: Registry;
  hook: HookSnapshot;
  layout: FrameLayout;
  selectable: boolean;
  gridMode: boolean;
  empty: TableProps<unknown>["empty"];
  rowProps: TableProps<unknown>["rowProps"];
  baseId: string;
  formats: Formats;
  wording: Wording;
  /** The lines a page holds, or 0 where a page has no size. */
  pageSize: number;
  /** The most lines the page has shown, up to `pageSize`. */
  heldLines: number;
  /** The rows that hold a short page's height, or null. */
  filler: ReactNode;
}

function renderRow(
  ctx: BodyContext,
  row: unknown,
  index: number,
  absolute: number,
  line?: Extract<Line<unknown>, { kind: "row" }>,
) {
  const { registry, hook, layout } = ctx;
  return (
    <Row
      key={hook.rowKey(row)}
      row={row}
      index={index}
      absolute={layout.virtual ? absolute : undefined}
      headRows={layout.headRows}
      registry={registry}
      hook={hook}
      columns={layout.dataColumns}
      line={line}
      tree={layout.tree}
      spanEntry={layout.spanEntry}
      header={layout.header}
      selectable={ctx.selectable}
      actions={layout.actions}
      trailing={layout.trailing}
      blocks={layout.blocks}
      columnCount={layout.columnCount}
      rowProps={ctx.rowProps}
      baseId={ctx.baseId}
      formats={ctx.formats}
      wording={ctx.wording}
      grid={ctx.gridMode}
    />
  );
}

/** The body of the new row, which stands above the body's rows. */
export function newRowBody(ctx: BodyContext, fresh: { fresh?: unknown }) {
  const { registry, hook, layout } = ctx;
  return (
    <tbody>
      <Row
        key={NEW_LINE}
        row={fresh.fresh}
        fresh
        index={-1}
        absolute={undefined}
        registry={registry}
        hook={hook}
        columns={layout.dataColumns}
        tree={layout.tree}
        spanEntry={layout.spanEntry}
        header={layout.header}
        selectable={ctx.selectable}
        actions={layout.actions}
        trailing={layout.trailing}
        blocks={layout.blocks}
        columnCount={layout.columnCount}
        rowProps={undefined}
        baseId={ctx.baseId}
        formats={ctx.formats}
        wording={ctx.wording}
        grid
      />
    </tbody>
  );
}

function loadingBody(ctx: BodyContext) {
  const { registry, hook, layout } = ctx;
  return (
    <tbody>
      <LoadingRows
        columns={layout.columnCount}
        /* A page's worth, or the lines the page last held: nothing below
           moves while the answer is on its way. */
        rows={ctx.pageSize ? ctx.heldLines || ctx.pageSize : undefined}
        rightAligned={[
          ...Array.from({ length: layout.controlColumns + (layout.spanEntry ? 1 : 0) }, () => false),
          ...layout.dataColumns.map((e) => isRightAligned(registry.kindOf(e, hook.rows), e.spec.rightAligned)),
        ]}
      />
    </tbody>
  );
}

/** In place of the rows: the application's message and the way to ask again,
    in the height of a page. The alert is announced where it appears; the button
    is in the tab order and takes no focus from the table. */
export function errorBody(ctx: BodyContext, message: string, retry: (() => void) | undefined) {
  return (
    <tbody>
      <tr data-grid-line={lineKey(ctx.gridMode, "error")}>
        <td
          colSpan={ctx.layout.columnCount}
          className={styles.emptyCell}
          style={ctx.pageSize && ctx.heldLines ? { height: `calc(var(--_table-pitch) * ${ctx.heldLines})`, verticalAlign: "top" } : undefined}
        >
          <div className={styles.empty}>
            <p role="alert" className={styles.emptyTitle}>
              {message}
            </p>
            <Button size="sm" variant="ghost" onClick={retry}>
              {ctx.wording.tryAgain}
            </Button>
          </div>
        </td>
      </tr>
    </tbody>
  );
}

function emptyBody(ctx: BodyContext) {
  const { hook, layout, wording } = ctx;
  const { snapshot } = layout;
  return (
    <tbody>
      <tr data-grid-line={lineKey(ctx.gridMode, "empty")}>
        <td
          colSpan={layout.columnCount}
          className={styles.emptyCell}
          /* The height the page last had; the message at its top, where the
             rows began. */
          style={ctx.pageSize && ctx.heldLines ? { height: `calc(var(--_table-pitch) * ${ctx.heldLines})`, verticalAlign: "top" } : undefined}
        >
          <div className={styles.empty}>
            {(snapshot.server || hook.admitted.length > 0) && layout.restricted ? (
              <>
                <p className={styles.emptyTitle}>{wording.nothingMatchesFilters}</p>
                <Button size="sm" variant="ghost" onClick={() => resetSearchAndFilters(snapshot)}>
                  {wording.resetAll}
                </Button>
              </>
            ) : (
              (ctx.empty ?? <p className={styles.emptyTitle}>{wording.noEntries}</p>)
            )}
          </div>
        </td>
      </tr>
    </tbody>
  );
}

/* Grouped lines. */
function groupedBody(ctx: BodyContext, lines: readonly Line<unknown>[]) {
  const { hook, layout, wording, formats } = ctx;
  const { virtual, grouping, projection } = layout;
  /* A virtual window that begins inside a group repeats its group headers above it,
     where the upper filler would stand - so that the group header can stick while
     its group scrolls, and nothing below moves. */
  /* Sticking, a group header is simply still there - "continued" is a page's word. */
  const shown = virtual
    ? withContinuation(lines).map((l) => (l.kind === "folded" || !l.continued ? l : { ...l, continued: false }))
    : lines;
  const repeated = shown.length - lines.length;
  const perLine = virtual && virtual.from > 0 ? virtual.fillerBefore / virtual.from : 0;
  const groupLine = (line: Exclude<Line<unknown>, { kind: "row" }>, key: string, index: number, absolute: number | undefined) => (
    <GroupLine
      key={key}
      line={line}
      index={index}
      absolute={absolute}
      headRows={layout.headRows}
      spanEntry={layout.spanEntry}
      levelEntry={layout.entryOf(grouping[line.group.level])}
      columns={layout.dataColumns}
      controlColumns={layout.controlColumns}
      blocks={layout.blocks}
      selectable={ctx.selectable}
      hasActions={layout.trailing}
      total={projection.filtered}
      siblings={line.parents.at(-1)?.groups ?? projection.groups ?? []}
      depth={grouping.length}
      grid={ctx.gridMode}
      hook={hook}
      formats={formats}
      wording={wording}
    />
  );
  const renderLine = (line: Line<unknown>, at: number) => {
    const i = at - repeated;
    const absolute = virtual ? virtual.from + i : i;
    if (i < 0) {
      return line.kind === "row" ? null : groupLine(line, `${line.kind}:${line.group.path}:repeated`, at, undefined);
    }
    if (line.kind === "row") return renderRow(ctx, line.row, i, absolute, line);
    return groupLine(
      line,
      `${line.kind}:${line.group.path}${line.kind === "header" && line.continued ? ":continued" : ""}`,
      i,
      virtual ? absolute : undefined,
    );
  };
  return virtual ? (
    <VirtualBody
      virtual={{ ...virtual, fillerBefore: Math.max(0, virtual.fillerBefore - repeated * perLine) }}
      colSpan={layout.columnCount}
    >
      {shown.map(renderLine)}
    </VirtualBody>
  ) : (
    <tbody>
      {lines.map(renderLine)}
      {ctx.filler}
    </tbody>
  );
}

/** The page's pitch filler, for a page shorter than the height it holds. */
export function pageFiller(heldLines: number, shownLines: number, pageSize: number, columnCount: number) {
  return pageSize && shownLines > 0 && shownLines < heldLines ? (
    <FillerRow height={`calc(var(--_table-pitch) * ${heldLines - shownLines})`} colSpan={columnCount} />
  ) : null;
}

/** The row that takes what the rows leave of a table the scroll area's height
    (Table.module.css, `reaching`), so that the footer stands at the bottom. */
export function ReachRow({ colSpan }: { colSpan: number }) {
  return (
    <tr aria-hidden="true" data-filler="" className={styles.fillerRow} style={{ height: "100%" }}>
      <td colSpan={colSpan} />
    </tr>
  );
}

/** The body for what the table shows now; `empty` is set when it is the empty message. */
export function renderBody(ctx: BodyContext, loading: boolean, stale: boolean): { body: ReactNode; empty: boolean } {
  const { layout } = ctx;
  const { virtual, lines, rows, projection } = layout;
  if (loading && !stale) return { body: loadingBody(ctx), empty: false };
  if (projection.filtered.length === 0) return { body: emptyBody(ctx), empty: true };
  if (lines) return { body: groupedBody(ctx, lines), empty: false };
  if (virtual) {
    return {
      body: (
        <VirtualBody virtual={virtual} colSpan={layout.columnCount}>
          {rows.map((row, i) => renderRow(ctx, row, i, virtual.from + i))}
          {ctx.filler}
        </VirtualBody>
      ),
      empty: false,
    };
  }
  return {
    body: (
      <tbody>
        {rows.map((row, i) => renderRow(ctx, row, i, i))}
        {ctx.filler}
      </tbody>
    ),
    empty: false,
  };
}
