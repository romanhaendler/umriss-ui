/* What a chart says in words: the live readout of the keyboard's point, the
   summary the plot is described by, and the value formats they share with the
   tooltip and the data table. Functions over the scene they speak for. */

import { formatFn, formatValue } from "./format";
import { lowerBound } from "./hit";
import type { ChartScene } from "./scene";
import { stackOf, normalizes } from "./sceneConfig";
import { type SeriesEntry, type Candidate, type LimitText, type StackTotal } from "./sceneModel";
import type { MaterializedSeries } from "./types";







/** The readout waits for the keys to rest this long. */
export const READOUT_REST = 150;
/** The summary waits for layouts - a zoom - to rest this long. */
export const SUMMARY_REST = 100;

/** The readout, written once the keys rest: a held key speaks where
    it stops. It reads what the tooltip shows, the emphasised series first. */
export function scheduleReadout(s: ChartScene): void {
  if (s.readoutEl === null) return;
  if (s.readoutTimer !== null) clearTimeout(s.readoutTimer);
  s.readoutTimer = setTimeout(() => {
    s.readoutTimer = null;
    const el = s.readoutEl;
    if (el !== null && s.activeBy === "keyboard") el.textContent = readoutText(s);
  }, READOUT_REST);
}

/** Something to hear at once, in the readout's place - not a key's, so
    not waiting for the keys to rest. */
export function say(s: ChartScene, text: string): void {
  if (s.readoutTimer !== null) clearTimeout(s.readoutTimer);
  s.readoutTimer = null;
  if (s.readoutEl !== null) s.readoutEl.textContent = text;
}

export function readoutText(s: ChartScene): string {
  const hover = s.hover;
  if (hover === null) return "";
  const rows = hover.hit.points.map((point, k) => {
    const row = s.hoverRows[k];
    // A box is heard as its numbers in a list after its name.
    const box = row?.box?.map((p) => `${p.label} ${p.value}`).join(", ");
    const name = box === undefined ? point.seriesName : `${point.seriesName}:`;
    return { order: s.hoverOrders[k], name, value: box ?? row?.value ?? "", x: row?.x ?? "" };
  });
  const emph = s.emphasised()?.order;
  rows.sort((a, b) => Number(b.order === emph) - Number(a.order === emph));
  // The totals after every series, as the tooltip's last rows.
  const totals = s.hoverTotals.map((t) => ({ name: t.name, value: t.value, x: "" }));
  const limits = s.hoverLimits.map((l) => ({ name: l.name, value: l.value, x: "" }));
  return s.wording.readout(s.hoverXLabel, [...rows, ...totals, ...limits]);
}

/** The labelled limits with their value in their own axis' format, a band's
    two edges as one value; only those on the y axis `yAxisId` where given. */
export function limitTexts(s: ChartScene, yAxisId?: string): LimitText[] {
  const out: LimitText[] = [];
  for (const { config } of s.limitsInOrder()) {
    if (config.label === undefined || config.label === "") continue;
    const id = s.limitAxisId(config);
    if (yAxisId !== undefined && (config.orientation !== "y" || id !== yAxisId)) continue;
    const axis = s.findAxis(config.orientation, id);
    if (axis === null) continue;
    // A y limit is a value of its axis: written as a series is, not by the
    // tick step, which would round 0.5 to 1 on an axis stepping by one.
    const write =
      config.orientation === "y"
        ? (yTickFormat(s, id) ?? ((v: number) => formatValue(v, s.wording.locale)))
        : axis.format;
    const at = (v: number) => write(s.limitAt(config, v));
    out.push({ name: config.label, value: config.kind === "line" ? at(config.value) : `${at(config.from)} – ${at(config.to)}` });
  }
  return out;
}

/** The totals of the stacks in a hit, each after its stack's last
    member. A normalised stack's total is no share: it is written in the
    series' own `format`, as its readings would be. */
export function totalsOf(s: ChartScene, chosen: readonly Candidate[]): StackTotal[] {
  const out: StackTotal[] = [];
  chosen.forEach((k, i) => {
    const key = stackOf(k.entry.config);
    const stacked = k.entry.stacked;
    if (key === undefined || stacked === null) return;
    if (chosen.some((later, j) => j > i && stackOf(later.entry.config) === key)) return;
    out.push({ after: i, name: s.wording.stackTotal, value: totalText(s, k.entry, stacked.total[k.index] as number) });
  });
  return out;
}

/** A stack's total as text, shared by the tooltip and the data table. */
export function totalText(s: ChartScene, entry: SeriesEntry, total: number): string {
  return (entry.stacked as NonNullable<SeriesEntry["stacked"]>).normalize ? (entry.config.format === undefined ? formatValue(total, s.wording.locale) : formatFn(entry.config.format, s.wording.locale)(total)) : formatY(s, entry, total);
}

/** The total of the stack `last` closes at the row's x, found in the
    members' own channels (the table's courses may be thinned); empty where
    no member reads there. */
export function totalCell(s: ChartScene, members: readonly SeriesEntry[], last: SeriesEntry, x: number): string {
  for (const m of members) {
    const mat = m.materialized as MaterializedSeries;
    const at = lowerBound(mat.x, mat.length, x);
    const total = at < mat.length && mat.x[at] === x ? (m.stacked as NonNullable<SeriesEntry["stacked"]>).total[at] : undefined;
    if (total !== undefined && !Number.isNaN(total)) return totalText(s, last, total);
  }
  return "";
}

/** The summary is rebuilt after a layout, but not on every one: a zoom lays
    out every frame, and the summary reads every visible point. */
export function scheduleSummary(s: ChartScene): void {
  if (s.summaryEl === null) return;
  if (s.summaryTimer !== null) clearTimeout(s.summaryTimer);
  s.summaryTimer = setTimeout(() => {
    s.summaryTimer = null;
    if (s.summaryEl !== null) s.summaryEl.textContent = summaryText(s);
  }, SUMMARY_REST);
}

/** Kind of content, series by name, the visible stretch, each series' range
    in it and the keys. A band has no range - its values are states. */
export function summaryText(s: ChartScene): string {
  const w = s.wording;
  const series = s.walkable();
  const parts: string[] = [];
  const all = s.seriesInOrder();
  if (series.length > 0) parts.push(w.seriesList(series.map((e) => s.nameFor(e, all.indexOf(e)))));
  const first = series[0];
  const xAxis = first === undefined ? null : s.findAxis("x", first.config.xAxisId);
  if (first !== undefined && xAxis !== null) {
    const [from, to] = xAxis.scale.domain;
    parts.push(w.visibleRange(s.xLabel(first.config.xAxisId, from), s.xLabel(first.config.xAxisId, to)));
  }
  for (const entry of series) {
    if (entry.config.kind === "state") continue;
    const range = visibleRange(s, entry);
    if (range === null) continue;
    const name = s.nameFor(entry, all.indexOf(entry));
    parts.push(w.seriesExtent(name, formatY(s, entry, range[0]), formatY(s, entry, range[1])));
  }
  const limits = limitTexts(s);
  if (limits.length > 0) parts.push(w.limitList(limits));
  if (s.tooltip !== null) parts.push(w.walkHelp);
  if (s.tooltip !== null && s.onSelect !== null) parts.push(w.selectHelp);
  if (s.hasZoom()) parts.push(w.zoomHelp);
  if (s.legend !== null && s.seriesNames().some((name) => name !== undefined)) parts.push(w.legendHelp);
  return parts.join(" ");
}

/** The lowest and highest value of a series inside its x axis' domain; a
    cell's value, every other kind's y. */
export function visibleRange(s: ChartScene, entry: SeriesEntry): [number, number] | null {
  const mat = entry.materialized;
  const xAxis = s.findAxis("x", entry.config.xAxisId);
  if (mat === null || xAxis === null) return null;
  const [from, to] = xAxis.scale.domain;
  // A stacked series' range is its own values', not its tops'.
  const values = mat.w ?? entry.stacked?.value ?? mat.y;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  // ponytail: reads every visible point once per summary; debounced above,
  // so a zoom pays it once when it rests, not per frame.
  for (let i = lowerBound(mat.x, mat.length, from); i < mat.length && (mat.x[i] as number) <= to; i++) {
    const v = values[i] as number;
    if (!Number.isFinite(v) || Number.isNaN(mat.y[i] as number)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return min <= max ? [min, max] : null;
}

/** A value as the tooltip writes it: the series' format, else its y axis'
    (a cell's value has no y axis format). */
export function formatY(s: ChartScene, entry: SeriesEntry, v: number): string {
  const config = entry.config;
  // A share is no reading: it reads as its axis does, in percent. The
  // series' `format` writes readings - the stack's total among them.
  if (config.format !== undefined && entry.stacked?.normalize !== true) return formatFn(config.format, s.wording.locale)(v);
  if (config.kind === "matrix") return formatValue(v, s.wording.locale);
  // Only a share takes the percent an axis gives a normalised stack: a line
  // on the same axis still reads its own values.
  const own =
    entry.stacked?.normalize === true
      ? yTickFormat(s, config.yAxisId)
      : s.findAxisConfig("y", config.yAxisId)?.tickFormat;
  return own === undefined ? formatValue(v, s.wording.locale) : formatFn(own, s.wording.locale)(v);
}

/** A y axis' `tickFormat`; without one, an axis that carries a normalised
    stack reads in percent. */
export function yTickFormat(s: ChartScene, axisId: string): ((v: number) => string) | undefined {
  const own = s.findAxisConfig("y", axisId)?.tickFormat;
  if (own !== undefined) return formatFn(own, s.wording.locale);
  for (const e of s.series.values()) {
    if (e.config.yAxisId === axisId && normalizes(e.config)) return s.percent;
  }
  return undefined;
}
