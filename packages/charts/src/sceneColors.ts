/* Series colours and the legend's entries: the palette place of a name, a
   colour as the canvas can paint it, the matrix' colouring in steps, and the
   labels and marks of the limits. Functions over the scene. */

import { warnOnce } from "./dev";
import { type LimitDrawItem } from "./draw";
import { CLASS_TICK, insideContainer, spread } from "./layout";
import { assess } from "./limit";
import { hatchFor } from "./marks";
import type { ChartScene } from "./scene";
import { takesPalette } from "./sceneConfig";
import { type SeriesEntry, type LegendItem, type LegendMark, type LimitLabel } from "./sceneModel";
import { isHidden } from "./sceneView";
import { FALLBACK_THEME, resolveColours, type ResolvedTheme } from "./theme";
import type { LimitConfig, MatrixColoring, MaterializedSeries } from "./types";












/** The stroke before a limit's label in a colour of its own, and its gap to
    the text (`.uc-limit-mark` in charts.css). */
export const LIMIT_MARK = 10 + 4;

/* ---------------- Colouring of the matrix ----------------

   The library interpolates no colours. A gradient is exactly the list of its
   stops: as many steps as the caller names colours. Interpolating between two CSS
   colours would mean bringing along a colour parser - for arbitrary CSS colour
   values, in a package that has none and is to get none. */

/** Palette of a colouring. For the assessment three colours: "unknown" is
    none - a missing value becomes a hole, as everywhere else in this library, and
    a hole carries no colour. */
export function matrixColors(coloring: MatrixColoring, theme: ResolvedTheme): readonly string[] {
  if (coloring.kind === "assessment") {
    return [theme.colorOk, theme.colorWarning, theme.colorAlarm];
  }
  return coloring.stops;
}

/** A legend chip for a colouring: its colours side by side, as hard stops. The
    matrix draws steps, and its chip shows the same steps - a palette colour
    there would explain a colour the matrix never draws. */
export function chipOf(colors: readonly string[]): string {
  const share = 100 / Math.max(1, colors.length);
  const stops = colors.map((c, k) => `${c} ${k * share}% ${(k + 1) * share}%`);
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

/** The value range a gradient spreads over: its own, or that of the data. */
export function gradientRange(
  w: Float64Array,
  n: number,
  range: readonly [number, number] | undefined,
): readonly [number, number] {
  let min = range?.[0];
  let max = range?.[1];
  if (min === undefined || max === undefined) {
    min = Number.POSITIVE_INFINITY;
    max = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < n; i++) {
      const v = w[i] as number;
      if (!Number.isFinite(v)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  return [min, max];
}

/** Bucket of one value: the index into the palette, -1 for a hole. `min` and
    `max` are the gradient's range and mean nothing to an assessment. */
export function bucketOf(
  v: number,
  coloring: MatrixColoring,
  count: number,
  min: number,
  max: number,
): number {
  if (coloring.kind === "assessment") {
    const b = assess(v, coloring.limits);
    // Four outcomes, four answers. Folding "unknown" onto the same bucket as
    // "ok" would be exactly the defect the limit model is written against: a
    // value nobody has would look like a good one.
    return b.verdict === "alarm"
      ? 2
      : b.verdict === "warning"
        ? 1
        : b.verdict === "ok"
          ? 0
          : -1; // unknown: a hole, and a hole carries no colour
  }
  if (!Number.isFinite(v)) return -1;
  const span = max - min;
  // Degenerate span: everything into the middle, instead of dividing by zero.
  const share = span > 0 ? (v - min) / span : 0.5;
  const k = Math.floor(share * count);
  return k < 0 ? 0 : k >= count ? count - 1 : k;
}

/** Bucket per cell: the index into the palette, -1 for a hole. Once per frame, so
    that the drawing loop calls no function per cell. */
export function matrixBuckets(
  mat: MaterializedSeries,
  coloring: MatrixColoring,
  count: number,
): Int32Array {
  const n = mat.length;
  const buckets = new Int32Array(n);
  const w = mat.w;
  if (w === null || count === 0) {
    buckets.fill(-1);
    return buckets;
  }
  const [min, max] =
    coloring.kind === "gradient" ? gradientRange(w, n, coloring.range) : [0, 0];
  for (let i = 0; i < n; i++) buckets[i] = bucketOf(w[i] as number, coloring, count, min, max);
  return buckets;
}

/** A caller's CSS colour as the canvas can draw it (finding 15). */
export function paint(s: ChartScene, color: string): string {
  const root = s.themeRoot;
  if (root === null) return color;
  // Under forced colours a caller's colour is the page's text colour, as
  // the browser would force it on an element (C4).
  if (s.theme?.forced === true) return s.theme.colorText;
  let resolved = s.painted.get(color);
  if (resolved === undefined) {
    resolved = resolveColours(root, { color }).color;
    s.painted.set(color, resolved);
  }
  return resolved;
}

export function colorFor(s: ChartScene, entry: SeriesEntry): string {
  if (entry.config.color !== undefined) return paint(s, entry.config.color);
  // A band's colours come from its states, a cell's from its colouring.
  if (!takesPalette(entry.config)) return "";
  // A tone is not a colour value but a role: the theme resolves it. Canvas knows
  // no CSS variables - a "var(--uc-color-alarm)" in the color prop would
  // silently go black.
  const tone = entry.config.tone;
  if (tone !== undefined) {
    const theme = s.theme ?? FALLBACK_THEME;
    return tone === "alarm" ? theme.colorAlarm : tone === "warning" ? theme.colorWarning : theme.colorOk;
  }
  // Before the theme has been read for the first time, the built-in palette
  // carries, so that series never all briefly get the same colour.
  const palette = s.theme?.series ?? FALLBACK_THEME.series;
  return palette[paletteSlot(s, entry) % Math.max(1, palette.length)] ?? FALLBACK_THEME.series[0] ?? "#2563eb";
}

/** Named: the place of the name. Nameless: the position among the series that
    take a palette place, as before - and a warning as soon as that shifts
    underneath it. */
export function paletteSlot(s: ChartScene, entry: SeriesEntry): number {
  if (entry.config.name !== undefined) return entry.slot;
  let index = 0;
  for (const e of s.series.values()) {
    if (e.order < entry.order && takesPalette(e.config)) index++;
  }
  if (entry.lastSlot !== null && entry.lastSlot !== index) {
    warnOnce(
      "series-without-name-colour",
      "a series without a name has changed its colour, because a series before it went away - with `name` it keeps it.",
    );
  }
  entry.lastSlot = index;
  return index;
}

export function nameFor(s: ChartScene, entry: SeriesEntry, index: number): string {
  if (entry.config.name !== undefined) return entry.config.name;
  // The last resort of the legend, and it stays one: the package has no text
  // layer, so every word it brings along itself is one word too many. Instead of
  // replacing it, it is made conspicuous.
  warnOnce(
    "series-without-name",
    `a series without a name is called "Series ${index + 1}" in the legend and the tooltip - the name belongs in \`name\`.`,
  );
  return `Series ${index + 1}`;
}

export function legendItems(s: ChartScene): LegendItem[] {
  const out: LegendItem[] = [];
  // Three lanes share one state list. The legend explains colours, not
  // series - so it explains every colour once. Twelve entries for four states
  // would not be a legend but a list.
  // A band that shares an entry is highlighted with it.
  const seen = new Map<string, LegendItem>();
  const theme = s.theme ?? FALLBACK_THEME;
  const hatches = s.marked() ? s.stateHatches() : null;
  s.seriesInOrder().forEach((entry, i) => {
    const config = entry.config;
    if (config.kind === "state") {
      // A state series does not explain itself but its colours. "Line 4" next to
      // a grey box says nothing; the reader wants to know what orange means.
      config.states.forEach((z, k) => {
        const key = `${z.label}\0${z.color}`;
        const known = seen.get(key);
        if (known !== undefined) {
          if (!known.seriesIds.includes(entry.order)) known.seriesIds.push(entry.order);
          known.hidden &&= isHidden(s, config);
          if (config.name !== undefined && !known.names.includes(config.name)) known.names.push(config.name);
          return;
        }
        const item: LegendItem = {
          id: `${entry.order}:${k}`,
          name: z.label,
          hidden: isHidden(s, config),
          names: config.name === undefined ? [] : [config.name],
          color: z.color,
          seriesIds: [entry.order],
          mark: hatches === null ? null : { dash: null, marker: null, swatches: [{ color: paint(s, z.color), hatch: hatches.get(z.label) ?? "none" }], ground: theme.colorBg },
        };
        seen.set(key, item);
        out.push(item);
      });
      return;
    }
    out.push({
      id: String(entry.order),
      name: nameFor(s, entry, i),
      hidden: isHidden(s, config),
      names: config.name === undefined ? [] : [config.name],
      color:
        config.kind === "matrix"
          ? chipOf(matrixColors(config.coloring, theme))
          : colorFor(s, entry),
      seriesIds: [entry.order],
      mark: legendMark(s, entry, theme),
    });
  });
  return out;
}

/** What a series' chip shows under encoding by marks. */
export function legendMark(s: ChartScene, entry: SeriesEntry, theme: ResolvedTheme): LegendMark | null {
  if (!s.marked()) return null;
  const config = entry.config;
  if (config.kind === "matrix") {
    const swatches = matrixColors(config.coloring, theme).map((c, k) => ({ color: paint(s, c), hatch: hatchFor(k) }));
    return { dash: null, marker: null, swatches, ground: theme.colorBg };
  }
  const marks = s.marksOf(entry);
  if (marks === null) return null;
  switch (config.kind) {
    case "line":
      return { dash: config.dash ?? marks.dash, marker: marks.marker, swatches: null, ground: theme.colorBg };
    case "area":
      return {
        dash: config.dash ?? marks.dash,
        marker: null,
        swatches: [{ color: colorFor(s, entry), hatch: marks.hatch, opacity: config.fillOpacity }],
        ground: theme.colorBg,
      };
    case "scatter":
      return { dash: null, marker: marks.marker, swatches: null, ground: theme.colorBg };
    default:
      return { dash: null, marker: null, swatches: [{ color: colorFor(s, entry), hatch: marks.hatch }], ground: theme.colorBg };
  }
}

export function limitColor(s: ChartScene, config: LimitConfig, theme: ResolvedTheme): string {
  if (config.color !== undefined) return paint(s, config.color);
  // A calculated limit carries no severity colour: it does not say "this is
  // bad" but "this is how this process otherwise behaves" (ADR-0008).
  if (config.role === "control") return theme.colorAxis;
  if (config.role === "zone") return theme.colorGrid;
  return config.severity === "alarm" ? theme.colorAlarm : theme.colorWarning;
}

/** Dash pattern per role. The reader has to be able to see at a glance whether
    the problem is the process or the tolerance. */
export function limitDash(s: ChartScene, config: LimitConfig): readonly number[] {
  switch (config.role) {
    case "control":
      return [];
    case "zone":
      return [2, 3];
    default:
      return [4, 3];
  }
}

export function limitItems(s: ChartScene, band: boolean): LimitDrawItem[] {
  const theme = s.theme ?? FALLBACK_THEME;
  const out: LimitDrawItem[] = [];
  for (const { config } of s.limitsInOrder()) {
    if ((config.kind === "band") !== band) continue;
    const axis = s.findAxis(config.orientation, s.limitAxisId(config));
    if (axis === null) continue;
    const color = limitColor(s, config, theme);
    const dash = limitDash(s, config);
    if (config.kind === "band") {
      out.push({
        orientation: config.orientation,
        fromPx: axis.scale.toPx(s.limitAt(config, config.from)),
        toPx: axis.scale.toPx(s.limitAt(config, config.to)),
        color,
        band: true,
        dash,
        hatch: s.marked(),
      });
    } else {
      const px = axis.scale.toPx(s.limitAt(config, config.value));
      out.push({
        orientation: config.orientation,
        fromPx: px,
        toPx: px,
        color,
        band: false,
        dash,
      });
    }
  }
  return out;
}

/** Labelled limits for the HTML layer: position and colour, ready. */
export function limitLabels(s: ChartScene): readonly LimitLabel[] {
  const out: LimitLabel[] = [];
  for (const { order, config } of s.limitsInOrder()) {
    if (config.label === undefined || config.label === "") continue;
    const axis = s.findAxis(config.orientation, s.limitAxisId(config));
    if (axis === null) continue;
    const value =
      config.kind === "line"
        ? s.limitAt(config, config.value)
        : (s.limitAt(config, config.from) + s.limitAt(config, config.to)) / 2;
    const size = s.measurer?.measure(config.label, CLASS_TICK);
    const height = size?.height ?? 0;
    const px = axis.scale.toPx(value);
    // As wide as a tick label of its text, and its 2 px padding either side;
    // in a colour of its own, the stroke before the text as well.
    const width = (size?.width ?? 0) + 4 + (config.color === undefined ? 0 : LIMIT_MARK);
    out.push({
      id: order,
      axisKey: axis.key,
      px,
      labelLeft: insideContainer(px, width, s.cssWidth),
      width,
      height,
      inside: axis.limitsInside,
      label: config.label,
      severity: config.severity,
      role: config.role,
      ...(config.color !== undefined ? { color: config.color } : {}),
    });
  }
  // A y label stands centred on its limit; two limits closer than a line
  // move apart, so each stays readable.
  for (const key of new Set(out.map((l) => l.axisKey))) {
    if (!key.startsWith("y:")) continue;
    const labels = out.filter((l) => l.axisKey === key);
    const height = Math.max(...labels.map((l) => l.height));
    spread(labels.map((l) => l.px), height).forEach((px, i) => ((labels[i] as LimitLabel).px = px));
  }
  return out;
}
