/* <DataTable> - the chart's values as a table, on demand (charts-alternatives
   01, C1).

   A reader who wants every value at once should not have to walk a thousand
   positions with the arrow keys. The chart gets a disclosure key - in the
   legend where there is one, on its own line where there is none - and the key
   opens a plain table of what the chart shows: its visible domain, the x in the
   first column, then one column per visible series, every value in the format
   the tooltip writes it in. A long course is listed downsampled, and the
   caption says so (table.ts).

   It registers like the legend (charts depend on nothing, so core's table is
   not borrowed). The table lies over the plot area rather than below it: the
   chart has a fixed height, and a table growing inside it would squeeze the
   plot to nothing. While it is open the plot beneath is hidden from the eye
   and from a screen reader, so there is one picture of the values at a time. */

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useChartScene, useDataTable } from "./context";
import type { ChartScene } from "./scene";

/** The disclosure key: the legend shows it, or the table on its own line. */
export function DataKey({ scene, state }: { scene: ChartScene; state: { id: string; open: boolean } }): ReactNode {
  const wording = scene.getWording();
  return (
    <button
      type="button"
      className="uc-legend-item uc-data-key"
      aria-expanded={state.open}
      // Only while the panel is there to be pointed at.
      aria-controls={state.open ? state.id : undefined}
      onClick={() => scene.toggleDataTable()}
    >
      {state.open ? wording.hideData : wording.showData}
    </button>
  );
}

function DataTableInner({ scene }: { scene: ChartScene }): ReactNode {
  const id = useId();
  useDataTable("DataTable", id);
  const snapshot = useSyncExternalStore(scene.subscribeLayout, scene.getLayoutSnapshot, scene.getLayoutServerSnapshot);
  const state = snapshot.dataTable;
  const open = state?.open === true;
  // Written anew on each render - a layout, new data - and only while open.
  const groups = open ? scene.dataTableGroups() : [];

  /* The panel covers the plot area: where that stands depends on the legend
     above it, so it is measured after each layout rather than assumed. */
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  useLayoutEffect(() => {
    const plot = panelRef.current?.parentElement?.querySelector<HTMLElement>(":scope > .uc-plot");
    if (plot == null) return;
    const next = { top: plot.offsetTop, height: plot.offsetHeight };
    setBox((b) => (b !== null && b.top === next.top && b.height === next.height ? b : next));
  }, [snapshot, open]);

  if (state === null) return null;
  const style: CSSProperties | undefined = box === null ? undefined : { top: box.top, height: box.height };
  return (
    <>
      {snapshot.legend === null && (
        <div className="uc-legend uc-legend-top">
          <DataKey scene={scene} state={state} />
        </div>
      )}
      {open && (
        // A tab stop of its own: the panel scrolls, and a keyboard has to be
        // able to scroll it.
        <div ref={panelRef} id={state.id} className="uc-data-panel" style={style} tabIndex={0}>
          {groups.map((group) => (
            <table key={group.key} className="uc-data-table">
              <caption>{group.caption}</caption>
              <thead>
                <tr>
                  {group.columns.map((column, k) => (
                    <th key={k} scope="col">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row, r) => (
                  <tr key={r}>
                    <th scope="row">{row[0]}</th>
                    {row.slice(1).map((cell, k) => (
                      <td key={k}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      )}
    </>
  );
}

export function DataTable(): ReactNode {
  const scene = useChartScene("DataTable");
  if (scene === null) return null; // PROD outside a Chart (R-2.3)
  return <DataTableInner scene={scene} />;
}
