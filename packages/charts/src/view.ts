/* The view of a chart (ADR-0047): the span each zoomable x axis shows and the
   hidden series - how the reader is looking, never the data.

   The scene holds it; `useChart` takes a start through `initialView` and
   reports every change through `onViewChange`. Pure, so that the rules can be
   tested without a canvas. */

/** How a reader is looking at a chart. Whatever is at its default is absent. */
export interface ChartView {
  /** The span each zoomable x axis shows, by axis `id` - a lone x axis is
      `"x"`. An axis absent here shows its own `domain`. An id that names no
      zoomable x axis falls out. */
  domains?: Readonly<Record<string, readonly [number, number]>>;
  /** The hidden series, by `name`; a series without one cannot be hidden. A
      name no series carries falls out. */
  hidden?: readonly string[];
}

/** The narrowest and the widest span zoom may reach, in the axis' units - the
    schedule's shape. */
export interface ZoomLimits {
  readonly min: number;
  readonly max: number;
}

/** What a view handed in is compared by: its content, not its identity - a
    view written in the call is a new object on every render. Ids and names
    are sets, so their order does not count, and an empty part is no part. */
export const viewKey = (view: ChartView): string =>
  JSON.stringify([
    Object.entries(view.domains ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    [...(view.hidden ?? [])].sort(),
  ]);

/** The view without what does not occur here: the spans of axes that do not
    zoom, the hidden names no series carries. `null` while nothing of the kind
    is declared: then that part stays as it is - otherwise the first render
    would erase it. */
export function onlyKnown(
  view: ChartView,
  axes: ReadonlySet<string> | null,
  names: ReadonlySet<string> | null = null,
): ChartView {
  const domains = Object.entries(view.domains ?? {}).filter(([id]) => axes === null || axes.has(id));
  const hidden = (view.hidden ?? []).filter((name) => names === null || names.has(name));
  if (domains.length === Object.keys(view.domains ?? {}).length && hidden.length === (view.hidden ?? []).length) return view;
  return {
    ...(domains.length > 0 && { domains: Object.fromEntries(domains) }),
    ...(hidden.length > 0 && { hidden }),
  };
}

/** The hidden names after `names` are toggled: shown together where every
    one is hidden, hidden together otherwise. */
export function toggleHidden(hidden: readonly string[], names: readonly string[]): string[] {
  const show = names.every((name) => hidden.includes(name));
  return show ? hidden.filter((name) => !names.includes(name)) : [...new Set([...hidden, ...names])];
}

/** The hidden names that show only the series `names` among the chart's
    series - by name, `undefined` for one without. */
export function showOnly(names: readonly string[], series: readonly (string | undefined)[]): string[] {
  return [...new Set(series.filter((one): one is string => one !== undefined && !names.includes(one)))];
}

/** Whether `names` are the only series visible already - a legend gesture
    then shows all. A series without a name does not count: it cannot be
    hidden. */
export function onlyVisible(
  names: readonly string[],
  hidden: readonly string[],
  series: readonly (string | undefined)[],
): boolean {
  return series.every((one) => one === undefined || names.includes(one) !== hidden.includes(one));
}

/** Whether `hidden` hides every series - which nothing may do but a view
    handed in: where it would, all are shown instead. */
export function hidesAll(hidden: readonly string[], series: readonly (string | undefined)[]): boolean {
  return series.length > 0 && series.every((one) => one !== undefined && hidden.includes(one));
}

/** How long a view reported may take to come back as `initialView`. */
const ECHO_MS = 1000;

/** The views a component reported that may still come back, by their
    content key - the chart's and the schedule's (ADR-0047), the table holding
    a copy of its own. An application keeping the view hands
    it back a frame or more late - by then a pan has moved on, and going to the
    view handed in would jump back. So a view handed in that equals one
    reported since the last one handed in, within a second, is the component's
    own state coming back, not a view to go to. The echoes come in order: one drops
    itself and every older report, a view from outside drops them all. The
    second bounds the list where nothing is handed back, and lets such an
    application still restore a view it kept. */
export class Echoes {
  private reports: { key: string; at: number }[] = [];

  /** Notes a view reported, by its key. */
  reported(key: string): void {
    const now = performance.now();
    this.reports = this.reports.filter((r) => now - r.at < ECHO_MS);
    this.reports.push({ key, at: now });
  }

  /** Whether the view handed in is a report coming back. */
  has(key: string): boolean {
    return this.at(key) >= 0;
  }

  /** Forgets what the view handed in answers. */
  handed(key: string): void {
    const at = this.at(key);
    this.reports = at < 0 ? [] : this.reports.slice(at + 1);
  }

  private at(key: string): number {
    const now = performance.now();
    return this.reports.findIndex((r) => r.key === key && now - r.at < ECHO_MS);
  }
}

/** Zoom a span by `factor` (below 1 is closer) around a `share` of it, which
    keeps its value; the span stays within the limits. */
export function zoomSpan(
  domain: readonly [number, number],
  share: number,
  factor: number,
  limits: ZoomLimits,
): [number, number] {
  const span = domain[1] - domain[0];
  const next = Math.min(limits.max, Math.max(limits.min, span * factor));
  const from = domain[0] + share * span - share * next;
  return [from, from + next];
}

/** The limits of an axis that names none: at most the data's extent - or the
    axis' own domain, where that is wider, as a "nice" one is: zooming out
    never narrows what the axis shows unzoomed -, at least three data steps,
    the smallest distance between two neighbouring points. Where no step can
    be measured - a lone point - there is nothing to zoom into. */
export function defaultLimits(
  extent: readonly [number, number],
  step: number,
  own: readonly [number, number] = extent,
): ZoomLimits {
  const max = Math.max(extent[1] - extent[0], own[1] - own[0]);
  return { min: step > 0 ? 3 * step : max, max };
}

/** Whether a span is the axis' own domain - then it is the default and no
    part of the view. Up to rounding: a zoom out to the widest span lands on
    it by arithmetic, not exactly. */
export function sameSpan(span: readonly [number, number], own: readonly [number, number]): boolean {
  const near = 1e-9 * Math.max(Math.abs(own[1] - own[0]), Number.MIN_VALUE);
  return Math.abs(span[0] - own[0]) <= near && Math.abs(span[1] - own[1]) <= near;
}
