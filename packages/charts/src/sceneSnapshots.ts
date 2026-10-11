/* The snapshots the HTML layer subscribes to: the layout (legend, limit
   labels, silhouette, data table) and the hover (tooltip rows, totals,
   limits), rebuilt when the scene says they changed. Functions over the
   scene. */

import type { ChartScene } from "./scene";
import { legendItems, limitLabels } from "./sceneColors";
import { say, scheduleSummary } from "./sceneSpeech";
import { isHidden, zoomAxes } from "./sceneView";

/** Does a visible series have a point to show - a y that is no gap, and for
    a cell a value? A chart without one says so rather than draw an empty
    frame on [0, 1]. Stops at the first point found. */
export function showsAPoint(s: ChartScene): boolean {
  for (const entry of s.series.values()) {
    const mat = entry.materialized;
    if (mat === null || isHidden(s, entry.config)) continue;
    for (let i = 0; i < mat.length; i++) {
      if (!Number.isNaN(mat.y[i] as number) && (mat.w === null || Number.isFinite(mat.w[i] as number))) return true;
    }
  }
  return false;
}

export function pushLayoutSnapshot(s: ChartScene): void {
  scheduleSummary(s);
  if (s.sayView) {
    s.sayView = false;
    const first = zoomAxes(s)[0];
    if (first !== undefined) {
      const [from, to] = first.layout.scale.domain;
      say(s, s.wording.visibleRange(s.xLabel(first.config.id, from), s.xLabel(first.config.id, to)));
    }
  }
  const empty = !showsAPoint(s);
  s.layoutSnapshot = {
    version: s.layoutSnapshot.version + 1,
    layout: s.layout,
    legend: s.legend,
    series: legendItems(s),
    limits: limitLabels(s),
    empty,
    loading: s.loading,
    silhouette: s.loading && empty ? (s.seriesInOrder()[0]?.config.kind ?? "none") : null,
    dataTable: s.dataTable,
  };
  for (const notify of s.layoutSubscribers) notify();
}

export function pushHoverSnapshot(s: ChartScene): void {
  s.hoverSnapshot = {
    version: s.hoverSnapshot.version + 1,
    hover: s.hover,
    tooltip: s.tooltip,
    xLabel: s.hoverXLabel,
    rows: s.hoverRows,
    totals: s.hoverTotals,
    limits: s.hoverLimits,
  };
  for (const notify of s.hoverSubscribers) notify();
}
