/* What the tooltip says and where it stands: a row per hit with its value and
   chip, a box's numbers and outliers, and the tooltip's position. Functions
   over the scene. */

import { formatValue } from "./format";
import { hatchFor, type Hatch } from "./marks";
import { BOX_KEYS } from "./materialize";
import type { ChartScene } from "./scene";
import { colorFor, legendMark } from "./sceneColors";
import { type SeriesEntry, type Candidate, type LegendMark, type TooltipRow } from "./sceneModel";
import { formatY } from "./sceneSpeech";
import { type ResolvedTheme } from "./theme";
import type { TooltipPoint } from "./types";
import { MINUTE } from "./workingTime";











/** A box's rows top to bottom as drawn: its further numbers with the median
    between the quartiles. */
export const BOX_ROWS = [...BOX_KEYS.slice(0, 2), "median", ...BOX_KEYS.slice(2)] as const;

/** A box's tooltip and table write this many outliers, and count the rest. */
export const OUTLIERS_SHOWN = 5;

/** Does a neighbour of the hit lie less than a minute from it? Then the header
    of a time axis carries the seconds - readings a second apart would
    otherwise share one header. A property of the data where the pointer is,
    not of the tick step, which never goes below a minute. */
export function subMinute(hit: Candidate): boolean {
  const mat = hit.entry.materialized;
  if (mat === null) return false;
  const at = mat.x[hit.index] as number;
  const near = (d: number) => d > 0 && d < MINUTE;
  return (
    (hit.index > 0 && near(at - (mat.x[hit.index - 1] as number))) ||
    (hit.index + 1 < mat.length && near((mat.x[hit.index + 1] as number) - at))
  );
}

/** What the built-in tooltip writes for one hit. A state has a name and no
    meaningful number; a cell has a number that is not its y position, and so
    no y axis' format; every other value is read against its y axis and
    written in its format. A series' own `format` comes before either. */
export function tooltipRow(s: ChartScene, k: Candidate, headerXAxisId: string): TooltipRow {
  const config = k.entry.config;
  const label = k.segment?.label;
  const value = label !== undefined && label !== "" ? label : formatY(s, k.entry, k.level ?? k.yValue);
  const ownX = config.xAxisId === headerXAxisId ? "" : s.xLabel(config.xAxisId, k.xValue);
  // A cell in a named row says which: its level alone would not.
  const named = config.kind === "matrix" && s.categoriesAt("y", config.yAxisId) !== undefined;
  const row = named ? (s.findAxis("y", config.yAxisId)?.format(k.yValue) ?? "") : "";
  const x = [ownX, row].filter((part) => part !== "").join(", ");
  // A reading the box does not have is no row.
  const box = k.box === undefined ? null : boxParts(s, k.entry, { ...k.box, median: k.yValue }).filter((p) => p.value !== "");
  return { value, x, chip: s.theme?.forced === true ? tooltipChip(s, k, s.theme) : null, box };
}

/** A box's readings top to bottom as drawn: the five, then mean,
    notch, n and outliers - each only where the series has it. One list for
    the tooltip's rows and the table's columns; without numbers (a table
    row with no box) every value is empty, and so is one not given. */
export function boxParts(
  s: ChartScene,
  entry: SeriesEntry,
  v: (NonNullable<TooltipPoint["box"]> & { median: number }) | null,
): { label: string; value: string }[] {
  const w = s.wording;
  const channels = entry.materialized?.box ?? null;
  const y = (n: number | undefined) => (n === undefined || !Number.isFinite(n) ? "" : formatY(s, entry, n));
  const parts = BOX_ROWS.map((key) => ({ label: w[key], value: y(v?.[key]) }));
  if (channels?.mean != null) parts.push({ label: w.mean, value: y(v?.mean) });
  if (channels?.notchLower != null) {
    const lower = y(v?.notchLower);
    const upper = y(v?.notchUpper);
    parts.push({ label: w.notch, value: lower === "" || upper === "" ? "" : `${lower} – ${upper}` });
  }
  if (channels?.count != null) {
    const n = v?.count;
    parts.push({ label: w.count, value: n === undefined || !Number.isFinite(n) ? "" : formatValue(n, s.wording.locale) });
  }
  if (channels?.outliers != null) {
    const list = v?.outliers ?? [];
    parts.push({ label: w.outliers, value: list.length > 0 ? outlierText(s, entry, list) : "" });
  }
  return parts;
}

/** A box's outliers top to bottom as drawn, the first five written out. */
export function outlierText(s: ChartScene, entry: SeriesEntry, outliers: readonly number[]): string {
  const sorted = [...outliers].sort((a, b) => b - a);
  return s.wording.outlierList(sorted.slice(0, OUTLIERS_SHOWN).map((v) => formatY(s, entry, v)), Math.max(0, sorted.length - OUTLIERS_SHOWN));
}

/** A hit's chip drawn as its legend entry is: a band's state and a cell's
    step by their hatch, every other series by its marks. */
export function tooltipChip(s: ChartScene, k: Candidate, theme: ResolvedTheme): { color: string; mark: LegendMark } | null {
  const config = k.entry.config;
  const swatch = (hatch: Hatch) => ({
    color: theme.colorText,
    mark: { dash: null, marker: null, swatches: [{ color: theme.colorText, hatch }], ground: theme.colorBg },
  });
  if (config.kind === "state") return swatch(s.stateHatches().get(k.segment?.label ?? "") ?? "none");
  if (config.kind === "matrix") return swatch(hatchFor(k.entry.buckets?.[k.index] ?? 0));
  const mark = legendMark(s, k.entry, theme);
  return mark === null ? null : { color: colorFor(s, k.entry), mark };
}

/** 12 px to the right of the crosshair, flipping at the right edge,
    clamped vertically. */
export function positionTooltip(s: ChartScene): void {
  const el = s.tooltipEl;
  if (el === null) return;
  const hover = s.hover;
  if (hover === null) {
    el.style.opacity = "0";
    return;
  }
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  let x = hover.hit.xPx + 12;
  if (x + width > s.cssWidth) x = hover.hit.xPx - 12 - width;
  if (x < 0) x = 0;
  let y = hover.mouseY - height / 2;
  y = Math.min(Math.max(y, 0), Math.max(0, s.cssHeight - height));
  el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  el.style.opacity = "1";
}
