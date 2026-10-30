/* The frame: the scroll area and the <table> in it. It reads the registry on
   every render, works out the layout (frameLayout.ts), wires the grid, and
   hands the body, the head and the foot their parts. */

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { ControlSizeProvider, announce, useDensityFor, useFormats, useWording } from "@umriss-ui/core";
import { cx } from "./cx";
import { NewRowButton } from "./toolbar";
import { useFlexWidths } from "./flexWidths";
import type { Registry } from "./registry";
import type { TableProps } from "./types";
import { useLineMotion } from "./motion";
import { GridContext, GridFocus, useGridState } from "./grid";
import { rowLine } from "./model/gridWalk";
import { frameGrid } from "./frameGrid";
import { copyKeyHandler } from "./copyKey";
import { CurrentRowContext, chooseRow } from "./currentRow";
import { warnOnce } from "./dev";
import { CutValueTip } from "./cutValueTip";
import {
  useCurrentRowInView,
  useRevealedRow,
  useCutValueWarnings,
  useUnboundedVirtualWarning,
  useDraftOfVanishedRow,
  useFocusAfterFold,
  useHeldColumnWidths,
  useStickyHeaderHeights,
  useVirtualPitch,
} from "./frameEffects";
import { errorBody, newRowBody, pageFiller, renderBody } from "./frameBody";
import type { BodyContext } from "./frameBody";
import { frameLayout } from "./frameLayout";
import { FootRow, HeadRow } from "./headFoot";
import { MatchOffer } from "./matchOffer";
import { Beyond, PinPlacement, ViewWidth } from "./scrollArea";
import { markBeyond, markStuck, markUnder } from "./scrollMarks";
import styles from "./Table.module.css";

export function Frame({
  registry,
  props: given,
  name,
}: {
  registry: Registry;
  props: TableProps<unknown>;
  /** The three names of the table, for the <table> (ADR-0068). */
  name: { "aria-label"?: string; "aria-labelledby"?: string; "aria-describedby"?: string };
}) {
  /* A late answer makes the table busy as `loading` does. */
  const error = registry.hook?.error;
  const props = error !== undefined ? { ...given, loading: false } : registry.hook?.late ? { ...given, loading: true } : given;
  const {
    selectable = false,
    stickyHeader = false,
    striped = false,
    density,
    maxHeight,
    empty,
    loading = false,
    rowProps,
    currentRow,
    onCurrentRowChange,
    grid: gridMode = false,
  } = props;

  useSyncExternalStore(registry.subscribe, registry.bodyVersion, registry.bodyVersion);
  const wording = useWording();
  const formats = useFormats();
  const resolvedDensity = useDensityFor(density, "regular");
  const baseId = useId();
  const tableRef = useRef<HTMLTableElement>(null);
  /* The most lines a page of the table has shown - what a short page, an
     empty result and placeholders keep the height of (ADR-0042). Kept from an earlier render,
     as React keeps information from previous renders: set while rendering. */
  const [heldBefore, setHeldBefore] = useState(0);
  const grid = useGridState();
  /* Which pinned blocks stick in the width the scroll area has - measured
     (`PinPlacement`, `blocksThatStick`). */
  const [sticking, setSticking] = useState({ start: true, end: true });

  useLayoutEffect(() => {
    registry.setFrameTable(tableRef.current);
    return () => {
      registry.setFrameTable(null);
    };
  }, [registry]);

  useDraftOfVanishedRow(registry, grid);
  useStickyHeaderHeights(tableRef, stickyHeader);
  useFocusAfterFold(registry, tableRef);
  useHeldColumnWidths(registry, tableRef, loading);
  useFlexWidths(tableRef, registry.hook?.tableState.filtered);
  useCutValueWarnings(tableRef);
  useUnboundedVirtualWarning(registry.hook?.tableState.virtual);
  useVirtualPitch(registry, tableRef);
  useCurrentRowInView(registry, currentRow);
  useRevealedRow(registry);

  /* Regrouping and folding move the lines that stay; a virtual window does
     not - its rows come and go with the scroll. */
  const moving = registry.hook && !registry.hook.tableState.virtual ? registry.hook.publicSnapshot : null;
  useLineMotion(tableRef, moving ? `${moving.grouping.join("|")}#${moving.folded.join("|")}` : "");

  /* A selection the user changed is said as a count; one handed in and changed
     by the application is not. */
  const chosen = registry.hook?.publicSnapshot.selection;
  useEffect(() => {
    if (registry.takePicked() && gridMode && selectable && chosen && !chosen.allMatching) announce(wording.tableSelectedCount(chosen.count), tableRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only a change of the selection is said
  }, [chosen?.selected, chosen?.except]);

  const hook = registry.hook;
  if (!hook) return null;

  const drafting = grid.state.editing?.row === true;
  const layout = frameLayout({ registry, hook, props, drafting, sticking });
  const { snapshot, virtual, lines, entries, grouping, dataColumns, columnCount, pins, pinned, blocks, rows, footerShown } = layout;

  const { lines: gridLinesNow, fresh, ids: gridIds, events: gridEvents } = frameGrid({ registry, hook, props, layout, grid });
  // eslint-disable-next-line react-hooks/refs -- the table is read when a key is pressed, not while rendering
  const onCopyKey = copyKeyHandler({ registry, hook, grid, gridMode, gridLines: gridLinesNow, dataColumns, formats, wording, tableElement: () => tableRef.current });

  /* The toolbar's "New row" reaches the grid through the registry: this
     render's handler, over this render's lines. */
  registry.setAddRow(gridEvents?.addRow ?? null);

  registry.setCellFocus(gridMode
    ? {
        columns: dataColumns.map((e) => e.spec.id),
        put: (key, column) => {
          const columnIndex = gridIds.indexOf(column);
          const lineIndex = Math.max(1, gridLinesNow.findIndex((l) => l.key === rowLine(key)));
          grid.setState((s) => ({ ...s, widget: false, active: { line: rowLine(key), column, lineIndex, columnIndex } }));
          grid.focus.want("cell");
        },
      }
    : null);

  if (onCurrentRowChange && !registry.rowHeader()) {
    warnOnce("currentRowHeader", "The keyboard cannot choose a row without a row header; mark a column `rowHeader` for `onCurrentRowChange`. The pointer still can.");
  }

  /* A page holds its height (ADR-0042). Every line is one pitch, so a page
     of the table is `pageSize` pitches whatever it shows: with a pagination
     bar, a page keeps the most lines it has shown, up to `pageSize` - a short
     last page fills up, a search or a condition that leaves three rows of
     seventy fills up to ten, an empty result keeps the same height, and a
     table that never had more than three rows stays three rows tall. A
     grouped page is `pageSize` lines as well, its repeated headers counted
     (grouping.ts, `pageLines`). */
  const pageSize = (registry.paginates() || snapshot.server) && !virtual ? snapshot.pageSize : 0;
  const shownLines = lines ? lines.length : rows.length;
  const shownNow = pageSize && !loading ? Math.min(shownLines, pageSize) : 0;
  if (shownNow > heldBefore) setHeldBefore(shownNow);
  const heldLines = Math.min(Math.max(shownNow, heldBefore, snapshot.pageCount > 1 ? pageSize : 0), pageSize);
  /* Loading over rows keeps the rows: they dim, after a moment, and take no
     pointer until the answer is in. Placeholders stand only where there is
     nothing to keep. */
  const stale = loading && shownLines > 0;

  const body: BodyContext = {
    registry,
    hook,
    layout,
    selectable,
    gridMode,
    empty,
    rowProps,
    baseId,
    formats,
    wording,
    pageSize,
    heldLines,
    filler: pageFiller(heldLines, shownLines, pageSize, columnCount),
  };
  const shown = error !== undefined ? { body: errorBody(body, error, hook.retry), empty: true } : renderBody(body, loading, stale);

  return (
    <>
      {snapshot.server && selectable && <MatchOffer hook={hook} />}
      <div
        ref={virtual?.scrollRef}
        onScroll={(event) => {
          virtual?.onScroll();
          if (lines && stickyHeader) markStuck(event.currentTarget);
          if (blocks.start || blocks.end) markUnder(event.currentTarget);
          markBeyond(event.currentTarget, blocks);
        }}
        onKeyDown={onCopyKey}
        onAnimationEnd={(event) => (event.target as Element).removeAttribute("data-copied")}
        className={styles.scroll}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {/* Every control in the table is small: a row is one pitch tall, and a
            control of the regular size would not fit it (ADR-0042). */}
        <ControlSizeProvider size="sm">
        <table
          ref={tableRef}
          role={lines || entries ? "treegrid" : gridMode ? "grid" : undefined}
          aria-multiselectable={gridMode && selectable ? true : undefined}
          aria-readonly={gridMode && !dataColumns.some((e) => e.spec.edit !== undefined) ? true : undefined}
          onKeyDown={gridEvents?.onKeyDown}
          onFocus={gridEvents?.onFocus}
          onClick={(event) => {
            gridEvents?.onClick(event);
            if (onCurrentRowChange) chooseRow(event, hook.rowKey, onCurrentRowChange);
          }}
          onBlur={gridEvents?.onBlur}
          data-depth={lines ? grouping.length : undefined}
          style={lines ? ({ "--u-header-levels": grouping.length - 1 } as CSSProperties) : undefined}
          {...name}
          /* With virtualisation not every row stands in the document; plus one
             for the header row and one for the footer row, which count per ARIA. */
          aria-rowcount={layout.numbered ? layout.rowTotal + layout.headRows + (footerShown ? 1 : 0) : undefined}
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
          <HeadRow registry={registry} hook={hook} layout={layout} props={props} wording={wording} />
          <GridContext value={gridEvents ? { ...gridEvents.context, hook, wording } : null}>
            <CurrentRowContext value={{ key: currentRow, report: onCurrentRowChange && ((row) => onCurrentRowChange(hook.rowKey(row), row)) }}>
              {fresh && newRowBody(body, fresh)}
              {shown.body}
            </CurrentRowContext>
          </GridContext>
          {footerShown && <FootRow layout={layout} gridMode={gridMode} formats={formats} wording={wording} />}
        </table>
        </ControlSizeProvider>
        {shown.empty && <ViewWidth table={tableRef} />}
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
