/* The data table's content: one table per x axis and one per matrix, every
   cell as text in the format the tooltip writes. */

import { type Course } from "./downsample";
import { lowerBound } from "./hit";
import type { ChartScene } from "./scene";
import { boxAt, stackOf } from "./sceneConfig";
import { type SeriesEntry, type DataTableGroup } from "./sceneModel";
import { totalCell, formatY } from "./sceneSpeech";
import { tableRows } from "./table";
import type { MaterializedSeries } from "./types";
import { MINUTE } from "./workingTime";










/** What the data table lists: one table per x axis for the series on it, one
    per matrix - a matrix has two positions per value, and shares no rows.
    Only the visible domain, and above the limit its downsampled course
    (table.ts). Called by the open table, once per layout. */
export function dataTableGroups(s: ChartScene): DataTableGroup[] {
  const all = s.seriesInOrder();
  // In the order their first series came: a matrix alone, the others by
  // their x axis.
  const parts: SeriesEntry[][] = [];
  const byAxis = new Map<string, SeriesEntry[]>();
  for (const entry of s.walkable()) {
    const shared = entry.config.kind === "matrix" ? undefined : byAxis.get(entry.config.xAxisId);
    if (shared !== undefined) shared.push(entry);
    else {
      const part = [entry];
      parts.push(part);
      if (entry.config.kind !== "matrix") byAxis.set(entry.config.xAxisId, part);
    }
  }
  return parts.flatMap((entries) => {
    const first = entries[0] as SeriesEntry;
    if (first.config.kind === "matrix") return matrixTable(s, first, all) ?? [];
    return courseTable(s, entries, all) ?? [];
  });
}

/** The series of one x axis, merged on their x. */
export function courseTable(s: ChartScene, entries: readonly SeriesEntry[], all: readonly SeriesEntry[]): DataTableGroup | null {
  const w = s.wording;
  const axisId = (entries[0] as SeriesEntry).config.xAxisId;
  const xAxis = s.findAxis("x", axisId);
  if (xAxis === null) return null;
  const [from, to] = xAxis.scale.domain;
  // A stacked series lists its own values, not its tops.
  const rows = tableRows(
    entries.map((e) => {
      const mat = e.materialized as MaterializedSeries;
      if (e.stacked !== null) return { ...mat, y: e.stacked.value, y0: null };
      return e.config.kind === "state" ? { ...mat, changesOnly: true } : mat;
    }),
    from,
    to,
  );
  // Readings less than a minute apart carry their seconds, as the tooltip's
  // header does - otherwise rows would share one heading.
  let seconds = false;
  for (let r = 1; r < rows.x.length && !seconds; r++) {
    const d = (rows.x[r] as number) - (rows.x[r - 1] as number);
    seconds = d > 0 && d < MINUTE;
  }
  const caption = w.tableCaption(s.xLabel(axisId, from), s.xLabel(axisId, to));
  // A stack's total column follows its last member (K4).
  const closes = (e: SeriesEntry): SeriesEntry[] | null => {
    const key = stackOf(e.config);
    if (key === undefined || e.stacked === null) return null;
    const members = entries.filter((m) => stackOf(m.config) === key);
    return members[members.length - 1] === e ? members : null;
  };
  return {
    key: `x:${axisId}`,
    caption: rows.thinned ? `${caption} ${w.downsampled(rows.readings)}` : caption,
    columns: [
      s.findAxisConfig("x", axisId)?.label ?? w.positionColumn,
      ...entries.flatMap((e) => {
        const name = s.nameFor(e, all.indexOf(e));
        const own = e.config.kind !== "box" ? [name] : s.boxParts(e, null).map((p) => `${name} – ${p.label}`);
        return closes(e) === null ? own : [...own, w.stackTotal];
      }),
    ],
    rows: rows.x.map((x, r) => [
      s.xLabel(axisId, x, seconds),
      ...entries.flatMap((e, k) => {
        const course = rows.courses[k] as Course;
        const i = rows.at[r]?.[k] ?? -1;
        const own = e.config.kind === "box" ? boxCells(s, e, course, i) : [cellText(s, e, course, i)];
        const members = closes(e);
        return members === null ? own : [...own, totalCell(s, members, e, x)];
      }),
    ]),
  };
}

/** A box's cells, top to bottom; empty where it has no box. The
    course may be thinned: its point is found in the channels by its x.
    ponytail: two boxes at one x read the first's numbers when thinned;
    carry the index through downsample() should that ever matter. */
export function boxCells(s: ChartScene, entry: SeriesEntry, course: Course, i: number): string[] {
  const mat = entry.materialized as MaterializedSeries;
  const median = i < 0 ? Number.NaN : (course.y[i] as number);
  const at = lowerBound(mat.x, mat.length, course.x[i] as number);
  const v = Number.isNaN(median) || mat.box === null ? null : { ...boxAt(mat.box, at), median };
  return s.boxParts(entry, v).map((p) => p.value);
}

/** One cell: empty where the series has no reading there or a gap; a
    state's name; a corridor's two edges; every other value as the tooltip
    writes it. */
export function cellText(s: ChartScene, entry: SeriesEntry, course: Course, i: number): string {
  if (i < 0) return "";
  const v = course.y[i] as number;
  if (Number.isNaN(v)) return "";
  const config = entry.config;
  if (config.kind === "state") return config.states[v | 0]?.label ?? "";
  const lower = course.y0?.[i];
  if (lower !== undefined && !Number.isNaN(lower)) return `${formatY(s, entry, lower)} – ${formatY(s, entry, v)}`;
  return formatY(s, entry, v);
}

/** A matrix' table: its cells inside the visible x domain, by column and
    row, with their value. */
export function matrixTable(s: ChartScene, entry: SeriesEntry, all: readonly SeriesEntry[]): DataTableGroup | null {
  const mat = entry.materialized;
  const xAxis = s.findAxis("x", entry.config.xAxisId);
  const yAxis = s.findAxis("y", entry.config.yAxisId);
  if (mat === null || mat.w === null || xAxis === null || yAxis === null) return null;
  const [from, to] = xAxis.scale.domain;
  const rows: string[][] = [];
  // ponytail: a matrix is listed whole inside the domain, never thinned - a
  // grid of cells stays small enough to be drawn one rectangle each; a
  // matrix of hundreds of thousands of cells would want a limit here too.
  for (let i = 0; i < mat.length; i++) {
    const x = mat.x[i] as number;
    const value = mat.w[i] as number;
    if (x < from || x > to || !Number.isFinite(value)) continue;
    rows.push([s.xLabel(xAxis.id, x), yAxis.format(mat.y[i] as number), formatY(s, entry, value)]);
  }
  const w = s.wording;
  return {
    key: `m:${entry.order}`,
    caption: w.tableCaption(xAxis.format(from), xAxis.format(to)),
    columns: [
      s.findAxisConfig("x", entry.config.xAxisId)?.label ?? w.positionColumn,
      s.findAxisConfig("y", entry.config.yAxisId)?.label ?? w.rowColumn,
      s.nameFor(entry, all.indexOf(entry)),
    ],
    rows,
  };
}
