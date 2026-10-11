/* The shapes ChartScene holds and hands out: registration entries, a series'
   hit, the snapshots the HTML layer reads, and the data table's groups. */

import type { SilhouetteKind } from "./Silhouette";
import { EMPTY_LAYOUT, type LayoutResult } from "./layout";
import { type Hatch, type MarkerShape } from "./marks";
import { type Extent } from "./materialize";
import type {
  AxisConfig,
  LimitConfig,
  HoverState,
  LegendConfig,
  MaterializedSeries,
  SeriesConfig,
  TooltipConfig,
  TooltipPoint,
} from "./types";






export interface SeriesEntry {
  order: number;
  config: SeriesConfig;
  /** The place in the palette, assigned on the first registration of the name.
      Read only for named series; a nameless one has no identity a place could
      hang on. */
  slot: number;
  /** The palette place a nameless series last received - in order to notice that
      it has changed. */
  lastSlot: number | null;
  materialized: MaterializedSeries | null;
  /** Which of the caller's rows each point came from, where the series is
      not held row by row: a category axis holds it by place (ADR-0052). */
  rows: Uint32Array | null;
  extent: Extent | null;
  /** Bars only: the smallest x distance, computed once per materialisation. It
      does not belong in the materialised series - the other series kinds do not
      need it (ADR-0002). For the matrix the cell width, for a state band the
      median distance its last segment runs past its last point, for the same
      reason in the same place. */
  step: number | null;
  /** Matrix only: the second cell edge. */
  cellHeight: number | null;
  /** Matrix only: the palette index per cell, once per materialisation and
      colouring - not per redraw, which a legend hover causes as well. */
  buckets: Int32Array | null;
  /** Stacked only: the series' own values, as its accessor gave them. Its
      materialised y holds its top and y0 the stack below;
      these are what the stack is summed from again when a member changes. */
  own: Float64Array | null;
  /** Stacked only: what each point shows as its value - its own, or its share
      in a normalised stack - and the stack's total there. */
  stacked: { value: Float64Array; total: Float64Array; normalize: boolean } | null;
}

/** A series' hit, before the hits are grouped into one tooltip. */
export interface Candidate {
  entry: SeriesEntry;
  index: number;
  color: string;
  name: string;
  px: number;
  py: number;
  xValue: number;
  yValue: number;
  /** Does this hit get a hover marker? Not on a band or a cell: there the
      mark is the area itself, and a point on it points at nothing. */
  marked: boolean;
  /** Does this mark cover an area instead of sitting on a point? A band and a
      cell lie under the pointer where they cover it - their px is the
      beginning of the section and not the place being pointed at. */
  areal: boolean;
  /** A stacked segment reaching over the pointer's y: under "nearest" it wins
      over a nearer top, which may be the segment above's. */
  covers: boolean;
  level?: number;
  segment?: { from: number; to: number; label: string };
  box?: TooltipPoint["box"];
  /** Where its marker stands, where that is not px: a grouped box's centre.
      px stays the x value's, so that hits at one x group together. */
  markX?: number;
}

export interface AxisEntry {
  order: number;
  config: AxisConfig;
}

/** The categories of an axis (ADR-0052): the library keeps the map from
    category to place, and writes the ticks and their labels a caller once
    wrote by hand. */
export interface Categories {
  names: readonly string[];
  place: ReadonlyMap<string, number>;
  /** Every place, as the axis' named ticks. */
  ticks: readonly number[];
  /** A place's category; a value between two places reads as the nearer. */
  format: (v: number) => string;
}

export interface LimitEntry {
  order: number;
  config: LimitConfig;
}

export interface LegendItem {
  /** Unique within the legend. A state series yields several entries, so the
      registration number alone is not enough as a key. */
  id: string;
  name: string;
  /** Its series is hidden - for a state, every band that shows it. */
  hidden: boolean;
  /** The series names a click toggles - for a state, every band that shows
      it; none for a series without a name, which cannot be hidden. */
  names: string[];
  /** A CSS background for the chip: a colour, or a matrix' steps side by
      side. */
  color: string;
  /** The series highlighted on hover - several where state bands share a
      state. */
  seriesIds: number[];
  /** Under encoding by marks, what the chip shows
      besides the colour; null where the colour stands alone. */
  mark: LegendMark | null;
}

/** A legend chip's marks: a line with its dash and marker (a scatter: the
    marker alone), or swatches with their hatch - one for a bar or a state, one
    per step for a matrix. An area has both, its dash over one swatch with its
    fill's `opacity`, hatched in its own colour as the plot does it. `ground`
    is the colour a hatch is drawn in across any other swatch. */
export interface LegendMark {
  dash: readonly number[] | null;
  marker: MarkerShape | null;
  swatches: readonly { color: string; hatch: Hatch; opacity?: number }[] | null;
  ground: string;
}

/** A labelled limit, ready for the axis band. */
export interface LimitLabel {
  id: number;
  axisKey: string;
  px: number;
  /** An x limit's label: its left edge in container coordinates, kept inside
      the container as a tick label is. */
  labelLeft: number;
  /** An x limit's label: its width with its padding; a tick label it reaches
      over would stand half covered and is left out. */
  width: number;
  /** The line a y limit's label takes; a tick label closer than that would
      stand half covered and is left out. */
  height: number;
  /** A y label inside the plot, at its far edge and on its value as in the
      band - where the band had no room for it (`AxisLayout.limitsInside`). */
  inside: boolean;
  label: string;
  severity: string;
  role: string;
  /** The limit's own colour, which its line takes too. The label's text
      stays in the axis's text colour and a short stroke before it takes this
      one; without it the stylesheet colours the text by severity and role. */
  color?: string;
}

export interface LayoutSnapshot {
  version: number;
  layout: LayoutResult;
  legend: LegendConfig | null;
  series: readonly LegendItem[];
  limits: readonly LimitLabel[];
  /** No visible series has a point to show. */
  empty: boolean;
  /** The rows are on their way, as of this layout: it ends with the frame
      that lays out the answer, not before. */
  loading: boolean;
  /** While the chart is loading with nothing to show, the kind of its first
      series in drawing order - the shape its silhouette takes -, "none"
      without a series; null otherwise. */
  silhouette: SilhouetteKind | null;
  /** The registered data table - the id its panel carries, and whether it is
      open -, or null without one. The legend shows its key. */
  dataTable: { id: string; open: boolean } | null;
}

/** One table of the data table: the series of one x axis, or one matrix. Every
    cell is text already, in the format the tooltip writes. */
export interface DataTableGroup {
  key: string;
  caption: string;
  columns: readonly string[];
  /** The first cell of each row is its x - the row's heading. */
  rows: readonly (readonly string[])[];
}

/** One row of the built-in tooltip, written out once per hit. */
export interface TooltipRow {
  /** The value in the format of the point's y axis; a state's name. */
  value: string;
  /** The point's x value in the format of its own x axis - empty where that
      is the x axis of the header. */
  x: string;
  /** Under forced colours the chip's background is forced away, so the chip
      draws the legend's marks instead; null draws
      the point's colour. */
  chip: { color: string; mark: LegendMark } | null;
  /** A box's numbers top to bottom as drawn, each named; null
      for every other kind, whose value stands alone. */
  box: readonly { label: string; value: string }[] | null;
}

/** A labelled limit as the tooltip, the readout and the summary write it. */
export interface LimitText {
  name: string;
  value: string;
}

/** A stack's total in the built-in tooltip. */
export interface StackTotal {
  /** The index of the row it follows - its stack's last member in the hit. */
  after: number;
  name: string;
  value: string;
}

export interface HoverSnapshot {
  version: number;
  hover: HoverState | null;
  tooltip: TooltipConfig | null;
  /** The x value in the format of the hit x axis (the built-in tooltip uses
      it). */
  xLabel: string;
  /** Parallel to the hit's points. */
  rows: readonly TooltipRow[];
  /** One per stack in the hit. */
  totals: readonly StackTotal[];
  /** The labelled limits of the hit's y axis; empty unless `<Tooltip limits />`. */
  limits: readonly LimitText[];
}

export const EMPTY_LAYOUT_SNAPSHOT: LayoutSnapshot = {
  version: 0,
  layout: EMPTY_LAYOUT,
  legend: null,
  series: [],
  limits: [],
  // Unknown before the first frame: saying "No data" there would flash.
  empty: false,
  loading: false,
  silhouette: null,
  dataTable: null,
};

export const EMPTY_HOVER_SNAPSHOT: HoverSnapshot = {
  version: 0,
  hover: null,
  tooltip: null,
  xLabel: "",
  rows: [],
  totals: [],
  limits: [],
};

/** A shared x position, in the units of the x axis it was read on. */
export interface SyncedX {
  axisId: string;
  value: number;
}
