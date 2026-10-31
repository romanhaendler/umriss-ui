/* The Fitted page: in a filled frame a page holds as many whole lines as the
   scroll area has room for. The fitted size is kept apart from the chosen one
   (`setFittedPageSize`), so the page, the view and the frame's held height
   never read it.

   The scroll area is observed; the page is cut anew once its height has held
   still for SETTLE_MS, so that a drag of a neighbour's height does not cut a
   page per frame. A cut that would leave a row cut off leaves at once - only
   a growing page waits. */

import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { warnOnce } from "./dev";
import { layoutHeight, linePitch } from "./pinned";
import { lineCount } from "./model/tableModel";
import type { Registry } from "./registry";

/** How long the scroll area's height must hold before the page grows or shrinks to it. */
export const SETTLE_MS = 120;

/** The same in server mode, where every cut is a request. */
export const SERVER_SETTLE_MS = 300;

/** Whether the frame cuts the page: filled, paged by the application's option
    or by this hook, and not virtual or a tree. */
export function fits(registry: Registry): boolean {
  const state = registry.hook?.tableState;
  return !!state && registry.framed && registry.paginates() && !state.virtual && !registry.tree && state.chosenPageSize === null;
}

/** Server mode, the page to be fitted and not yet measured, or measured and
    not yet the page in the state: no request goes out. */
export const awaitsFit = (registry: Registry): boolean =>
  registry.server && fits(registry) && registry.fitMeasured !== registry.hook!.tableState.pageSize;

/** The lines a page holds in `room` px of lines of `pitch` px, `now` being the
    page held: it keeps its size while `room` is in [now·pitch − 1, (now+1)·pitch)
    - it grows at a whole further line and shrinks only when more than a pixel
    of the last row would be cut, which absorbs rounding and a wrapping pager. */
export function fittedLines(room: number, pitch: number, now: number): number {
  if (room >= now * pitch - 1 && room < (now + 1) * pitch) return now;
  return Math.max(1, Math.floor(room / pitch));
}

const linesOf = (registry: Registry) => {
  if (registry.server) return registry.hook?.publicSnapshot.rowCount ?? 0;
  return lineCount(registry.projection());
};

/** The head, the foot and the room between them in a scroll area. */
function measure(table: HTMLTableElement, scroll: HTMLElement) {
  const pitch = linePitch(table);
  const head = table.tHead ? layoutHeight(table.tHead) : 0;
  const foot = table.tFoot ? layoutHeight(table.tFoot) : 0;
  return { pitch, room: scroll.clientHeight - head - foot };
}

/** The height the offer to select all that match takes when it appears, while it
    does not stand: a probe of the line's own size, measured beside the scroll area. */
function offerHeight(scroll: HTMLElement): number {
  const frame = scroll.parentElement;
  if (!frame || frame.querySelector("[data-select-matching]")) return 0;
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = "position:absolute;visibility:hidden;border-bottom:1px solid transparent;min-height:calc(var(--u-control-height-sm) + 2 * var(--u-space-1) + 1px)";
  frame.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return height;
}

/* `offer`: a server table with a selection column, where the offer's line may
   come with a tick. The fit leaves room for it, so that it takes a spare line
   of the body and the page keeps its size. */
export function useFit(registry: Registry, tableRef: RefObject<HTMLTableElement | null>, loading: boolean, pitch: number, offer: boolean) {
  const latest = useRef({ loading });
  useLayoutEffect(() => {
    latest.current = { loading };
  });
  const seen = useRef("");
  const seenLines = useRef(0);

  /* The page is cut where the table is filled, paged by the application's
     option or by this hook, and has a held height to measure against. */
  const cut = () => {
    const hook = registry.hook;
    const table = tableRef.current;
    const scroll = table?.parentElement;
    if (!hook || !table || !scroll) return;
    const state = hook.tableState;
    if (!fits(registry)) {
      if (state.pageSize !== (state.chosenPageSize ?? state.defaultPageSize)) state.setFittedPageSize(null);
      return;
    }
    /* The held height is the basis the scroll area is measured around; before
       it stands, the area is as tall as its rows. */
    if (!scroll.style.getPropertyValue("--_table-held")) return;
    /* A scroll area that is not laid out (display: none) has no room to read. */
    if (!scroll.clientHeight) return;
    const { pitch: line, room: area } = measure(table, scroll);
    if (!line) return;
    const room = offer ? area - offerHeight(scroll) : area;
    const total = linesOf(registry);
    const now = state.pageSize;
    const next = fittedLines(room, line, now);
    /* The first measurement of a server's table is what its first request
       waits for: it is taken whatever the rows say. */
    const first = registry.server && registry.fitMeasured === null;
    if (!first) {
      /* No lines and no placeholders: the area is as tall as the empty message. */
      if (total === 0 && !latest.current.loading) return;
      /* Where every line fits one page the area is as tall as the lines and
         says nothing about the frame. */
      if (total > 0 && next >= total && now >= total) return;
    }
    if (next < 3) warnOnce("fit-few-lines", `The table's frame holds fewer than three lines (${next}); give it more height or let it flow.`);
    if (next !== now) state.setFittedPageSize(next === state.defaultPageSize ? null : next);
    if (registry.server) registry.setFitMeasured(next);
  };

  /* After every render that changes what the cut depends on, at once: the
     first measurement and the follow-up of a density never show a page that
     is cut wrong for a frame. A new line is cut for as well. */
  const state = registry.hook?.tableState;
  const key = `${registry.framed}|${pitch}|${state?.pageSize}|${state?.chosenPageSize}`;
  const lines = registry.hook && !registry.server ? linesOf(registry) : 0;
  useLayoutEffect(() => {
    const forced = seen.current !== key;
    if (!forced && seenLines.current === lines) return;
    seen.current = key;
    seenLines.current = lines;
    cut();
  });

  useLayoutEffect(() => {
    const scroll = tableRef.current?.parentElement;
    if (!scroll || typeof ResizeObserver === "undefined") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cutsARow = () => {
      const table = tableRef.current;
      const hook = registry.hook;
      if (!table || !hook || !registry.framed) return false;
      const { pitch: line, room } = measure(table, scroll);
      return line > 0 && room < hook.tableState.pageSize * line - 1;
    };
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      if (!registry.server && cutsARow()) cut();
      else timer = setTimeout(cut, registry.server ? SERVER_SETTLE_MS : SETTLE_MS);
    });
    observer.observe(scroll);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `cut` reads the registry and the refs when it runs
  }, [registry, tableRef, registry.hook !== null]);
}
