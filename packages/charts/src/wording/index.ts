/* The charts' wording (ADR-0031): a register named after what each entry
   labels, English by default. German stands behind the subpath
   `@umriss-ui/charts/wording/de`. The charts depend on nothing, so core's
   register is not borrowed - its pattern is (ADR-0019). */

export interface ChartsWording {
  /** What a screen reader calls the plot area that takes the keys
      (`aria-roledescription`). */
  roleDescription: string;
  /** Shown in the plot area when no visible series has a point to show. */
  empty: string;
  /** The summary's count of visible series. */
  seriesCount: (count: number) => string;
  /** The summary's visible stretch of the x axis, both ends formatted. */
  visibleRange: (from: string, to: string) => string;
  /** The summary's lowest and highest value of one series in that stretch. */
  seriesExtent: (name: string, min: string, max: string) => string;
  /** The keys that walk the chart. */
  walkHelp: string;
  /** The keys that zoom and pan it - only where the chart can be zoomed. */
  zoomHelp: string;
}

export const DEFAULT_CHARTS_WORDING: ChartsWording = {
  roleDescription: "chart",
  empty: "No data",
  seriesCount: (count) => (count === 1 ? "1 series." : `${count} series.`),
  visibleRange: (from, to) => `From ${from} to ${to}.`,
  seriesExtent: (name, min, max) => `${name} from ${min} to ${max}.`,
  walkHelp:
    "Left and right arrows move through the values, up and down change the series, Home and End go to the first and the last, Escape clears.",
  zoomHelp: "Plus and minus zoom, Shift with left or right pans, 0 shows everything.",
};
