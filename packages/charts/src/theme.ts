/* Theme module (R-1.7):
   Canvas knows no CSS variables. The resolved values are read **once** per chart
   root through getComputedStyle and cached as a ResolvedTheme. Invalidation:
   (a) a global MutationObserver on document.documentElement
       (attribute and class changes, e.g. switching data-theme),
   (b) the explicit invalidateTheme() API.
   After an invalidation all subscribers read anew and trigger a redraw.
   getComputedStyle never runs inside the draw loop - only here, outside it. */

export interface ResolvedTheme {
  colorAxis: string;
  colorGrid: string;
  colorText: string;
  colorBg: string;
  /** Colours of the two limit severities. A limit carries the colour of its
      severity, not that of its series - it belongs to none. */
  colorWarning: string;
  colorAlarm: string;
  /** The third outcome of an assessment. "unknown" deliberately has no
      colour: a missing value becomes a hole like every gap in this library, and
      a hole carries no colour, because a colour would be a claim. */
  colorOk: string;
  font: string;
  fontMono: string;
  series: readonly string[];
}

export const FALLBACK_THEME: ResolvedTheme = {
  colorAxis: "rgba(23, 23, 23, 0.17)",
  colorGrid: "rgba(23, 23, 23, 0.06)",
  colorText: "#71717a",
  colorBg: "#ffffff",
  colorWarning: "#8a5c00",
  colorAlarm: "#b13636",
  colorOk: "#217a4b",
  font: "system-ui, sans-serif",
  fontMono: "ui-monospace, monospace",
  series: ["#2563eb", "#db2777", "#059669", "#d97706", "#7c3aed", "#0891b2"],
};

/* Cache with a generation number: invalidateTheme() raises the generation, so
   that every entry is read anew on its next access.
   (WeakMaps cannot be emptied; the generation replaces the emptying, without
   holding on to element references.) */
const cache = new WeakMap<Element, { generation: number; theme: ResolvedTheme }>();
let generation = 0;

const subscribers = new Set<() => void>();
let observer: MutationObserver | null = null;

function readVar(style: CSSStyleDeclaration, name: string, fallback: string): string {
  const v = style.getPropertyValue(name).trim();
  return v === "" ? fallback : v;
}

function readTheme(root: Element): ResolvedTheme {
  const style = getComputedStyle(root);
  const series: string[] = [];
  for (let i = 1; i <= 6; i++) {
    series.push(readVar(style, `--uc-series-${i}`, FALLBACK_THEME.series[i - 1] ?? "#2563eb"));
  }
  return {
    colorAxis: readVar(style, "--uc-color-axis", FALLBACK_THEME.colorAxis),
    colorGrid: readVar(style, "--uc-color-grid", FALLBACK_THEME.colorGrid),
    colorText: readVar(style, "--uc-color-text", FALLBACK_THEME.colorText),
    colorBg: readVar(style, "--uc-color-bg", FALLBACK_THEME.colorBg),
    colorWarning: readVar(style, "--uc-color-warning", FALLBACK_THEME.colorWarning),
    colorAlarm: readVar(style, "--uc-color-alarm", FALLBACK_THEME.colorAlarm),
    colorOk: readVar(style, "--uc-color-ok", FALLBACK_THEME.colorOk),
    font: readVar(style, "--uc-font", FALLBACK_THEME.font),
    fontMono: readVar(style, "--uc-font-mono", FALLBACK_THEME.fontMono),
    series,
  };
}

function ensureObserver(): void {
  if (observer !== null) return;
  if (typeof MutationObserver === "undefined" || typeof document === "undefined") return;
  observer = new MutationObserver(() => invalidateTheme());
  observer.observe(document.documentElement, { attributes: true });
}

/** Resolved theme for a chart root element (cached, generation-safe). */
export function resolveTheme(root: Element): ResolvedTheme {
  ensureObserver();
  const entry = cache.get(root);
  if (entry !== undefined && entry.generation === generation) return entry.theme;
  const theme = readTheme(root);
  cache.set(root, { generation, theme });
  return theme;
}

/** Explicit invalidation: devalue the cache, every living chart reads anew and
    redraws. */
export function invalidateTheme(): void {
  generation++;
  for (const notify of subscribers) notify();
}

/** Internal API: scenes subscribe to theme invalidations. */
export function subscribeTheme(notify: () => void): () => void {
  subscribers.add(notify);
  return () => {
    subscribers.delete(notify);
  };
}
