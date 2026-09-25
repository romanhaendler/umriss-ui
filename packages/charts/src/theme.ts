/* Theme module (R-1.7):
   Canvas knows no CSS variables. The resolved values are read **once** per chart
   root and cached as a ResolvedTheme. Invalidation:
   (a) a global MutationObserver on document.documentElement (attribute
       changes - a `style="color-scheme: dark"`, a `class="dark"`, a `data-*`
       an application switches its mode with),
   (b) a subscription to `prefers-color-scheme`, for an application that
       follows the system with `color-scheme: light dark`,
   (c) the explicit invalidateTheme() API, for a switch on another ancestor.
   After an invalidation all subscribers read anew and trigger a redraw.
   getComputedStyle never runs inside the draw loop - only here, outside it.

   A colour is not read as the variable's text: a token written
   `light-dark(<light>, <dark>)` (ADR-0021) comes back as exactly that, and a
   canvas ignores it. Each colour is set on a probe element inside the chart
   root as `color: var(--uc-…)` and read back as the computed `color`, which
   the browser resolves in the scheme that applies there. Where no resolution
   comes back (a DOM without a style engine), the variable's text is used, as
   before.

   Under `forced-colors: active` - the Windows contrast mode - the browser
   forces the colours of every element, and of nothing drawn on a canvas. So
   the chart forces itself (charts-alternatives C4): the theme resolves to the
   system colours the page around it now wears - text and marks in
   `CanvasText`, the ground in `Canvas`, the grid in `GrayText`, the two
   severities in `Highlight` - and every series, told apart no longer by
   colour, is told apart by its marks (marks.ts). */

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
  /** The page is in forced colours: every colour above is a system colour, and
      the chart encodes by marks whatever its `encoding`. */
  forced: boolean;
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
  forced: false,
};

const FORCED_QUERY = "(forced-colors: active)";

function forcedColors(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(FORCED_QUERY).matches;
}

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

/** Runs `read` with a hidden probe inside `root` that resolves a CSS colour to
    its computed value - or gives the value back as it stands where no
    resolution comes back - and removes the probe afterwards.

    `system`: the probe reads system colours as they are. Forced colours
    repaint an element's text at computed-value time, so without it "Canvas"
    would read back as the forced text colour. */
function withProbe<R>(root: Element, read: (resolve: (value: string) => string) => R, system = false): R {
  const probe = root.ownerDocument.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  if (system) probe.style.setProperty("forced-color-adjust", "none");
  root.appendChild(probe);
  try {
    return read((value) => {
      probe.style.color = "";
      probe.style.color = value;
      const resolved = getComputedStyle(probe).color;
      return resolved === "" || resolved.startsWith("var(") ? value : resolved;
    });
  } finally {
    probe.remove();
  }
}

/** The theme under forced colours: the system colours, every series in the
    text colour - its marks tell it apart. */
function forcedTheme(root: Element, style: CSSStyleDeclaration): ResolvedTheme {
  return withProbe(
    root,
    (resolve) => {
      const text = resolve("CanvasText");
      const highlight = resolve("Highlight");
      return {
        colorAxis: text,
        colorGrid: resolve("GrayText"),
        colorText: text,
        colorBg: resolve("Canvas"),
        colorWarning: highlight,
        colorAlarm: highlight,
        colorOk: text,
        font: readVar(style, "--uc-font", FALLBACK_THEME.font),
        fontMono: readVar(style, "--uc-font-mono", FALLBACK_THEME.fontMono),
        series: FALLBACK_THEME.series.map(() => text),
        forced: true,
      };
    },
    true,
  );
}

function readTheme(root: Element): ResolvedTheme {
  const style = getComputedStyle(root);
  if (forcedColors()) return forcedTheme(root, style);
  return withProbe(root, (resolve) => {
    const readColour = (name: string, fallback: string): string => {
      const text = readVar(style, name, fallback);
      if (text === fallback) return fallback;
      const resolved = resolve(`var(${name})`);
      return resolved === `var(${name})` ? text : resolved;
    };

    const series: string[] = [];
    for (let i = 1; i <= 6; i++) {
      series.push(readColour(`--uc-series-${i}`, FALLBACK_THEME.series[i - 1] ?? "#2563eb"));
    }
    return {
      colorAxis: readColour("--uc-color-axis", FALLBACK_THEME.colorAxis),
      colorGrid: readColour("--uc-color-grid", FALLBACK_THEME.colorGrid),
      colorText: readColour("--uc-color-text", FALLBACK_THEME.colorText),
      colorBg: readColour("--uc-color-bg", FALLBACK_THEME.colorBg),
      colorWarning: readColour("--uc-color-warning", FALLBACK_THEME.colorWarning),
      colorAlarm: readColour("--uc-color-alarm", FALLBACK_THEME.colorAlarm),
      colorOk: readColour("--uc-color-ok", FALLBACK_THEME.colorOk),
      font: readVar(style, "--uc-font", FALLBACK_THEME.font),
      fontMono: readVar(style, "--uc-font-mono", FALLBACK_THEME.fontMono),
      series,
      forced: false,
    };
  });
}

function ensureObserver(): void {
  if (observer !== null) return;
  if (typeof MutationObserver === "undefined" || typeof document === "undefined") return;
  observer = new MutationObserver(() => invalidateTheme());
  observer.observe(document.documentElement, { attributes: true });
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => invalidateTheme());
    // Entering or leaving the contrast mode is a change of theme as well.
    window.matchMedia(FORCED_QUERY).addEventListener?.("change", () => invalidateTheme());
  }
}

/** Any number of CSS colours - a token, `light-dark(…)`, `var(--…)`, a
    literal - resolved to values a canvas can draw, in the scheme that applies
    at `root`. The same probe `resolveTheme` uses, for a canvas of a
    neighbouring package (ADR-0022): the schedule draws its subtasks with the
    colours of @umriss-ui/core and of its caller, not with the chart palette.

    Not cached: the caller keeps the result and reads anew when
    `subscribeTheme` tells it to. Where no resolution comes back (a DOM
    without a style engine), a colour is given back as it stands. */
export function resolveColours<K extends string>(
  root: Element,
  colours: Readonly<Record<K, string>>,
): Record<K, string> {
  ensureObserver();
  return withProbe(root, (resolve) => {
    const resolved = {} as Record<K, string>;
    for (const key of Object.keys(colours) as K[]) resolved[key] = resolve(colours[key]);
    return resolved;
  });
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

/** Subscribe to theme invalidations - a switch of `color-scheme` on the
    document, the system's preference, or `invalidateTheme()`. The scenes of
    the charts use it, and so does any canvas that resolved its colours with
    `resolveColours`. Returns the unsubscribe. */
export function subscribeTheme(notify: () => void): () => void {
  subscribers.add(notify);
  return () => {
    subscribers.delete(notify);
  };
}
