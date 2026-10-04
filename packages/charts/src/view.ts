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
  /** The hidden series, by `name`. Not built yet: component-view 02. */
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

/** The view without the spans of axes that do not zoom here. `null` while no
    axis is declared: then it stays as it is - otherwise the first render would
    erase every span. */
export function onlyKnown(view: ChartView, known: ReadonlySet<string> | null): ChartView {
  if (known === null || view.domains === undefined) return view;
  const entries = Object.entries(view.domains);
  const kept = entries.filter(([id]) => known.has(id));
  if (kept.length === entries.length) return view;
  const rest: ChartView = view.hidden === undefined ? {} : { hidden: view.hidden };
  return kept.length > 0 ? { ...rest, domains: Object.fromEntries(kept) } : rest;
}

/** How long a view reported may take to come back as `initialView`. */
const ECHO_MS = 1000;

/** The views a chart reported that may still come back - the schedule's and
    the table's rule (component-view 07). An application keeping the view hands
    it back a frame or more late - by then a pan has moved on, and going to the
    view handed in would jump back. So a view handed in that equals one
    reported since the last one handed in, within a second, is the chart's own
    state coming back, not a view to go to. The echoes come in order: one drops
    itself and every older report, a view from outside drops them all. The
    second bounds the list where nothing is handed back, and lets such an
    application still restore a view it kept. */
export class Echoes {
  private reports: { key: string; at: number }[] = [];

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

/** The limits of an axis that names none: at most the data's extent, at least
    three data steps - the smallest distance between two neighbouring points. */
export function defaultLimits(extent: readonly [number, number], step: number): ZoomLimits {
  return { min: 3 * step, max: extent[1] - extent[0] };
}
