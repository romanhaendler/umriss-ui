/* Chart - container and ChartScene provider (4.1, R-2.1, R-2.8-R-2.10).

   Structure of the DOM:
     .uc-root      flex column; the --uc-* variables live here (theme root)
       .uc-plot    reference area of all pixel coordinates; catches the mouse events
         canvas.uc-layer-series   series and grid
         canvas.uc-layer-overlay  crosshair and hover markers
         .uc-axes                 axes, ticks, titles (HTML)
         .uc-tooltip              tooltip (HTML)
       <Legend/>   optional, placed above or below the plot area through CSS order

   Canvas access happens exclusively inside effects (SSR-safe, R-7.4).
   Accessibility baseline (R-7.6): role="img" + aria-label on the container,
   canvas elements aria-hidden. */

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { ChartContext } from "./context";
import type { ChartScene } from "./scene";
import { AxesHtml } from "./AxesHtml";
import { useSilhouette } from "./Silhouette";
import { TooltipHtml } from "./TooltipHtml";
import { warnOnce } from "./dev";
import { DEFAULT_CHARTS_WORDING, type ChartsWording } from "./wording";
import type { ChartPerf, Padding } from "./types";
import "./styles/charts.css";

/** The props of `Chart`. Its rows are not among them: `useChart(rows)` binds
    them (ADR-0048). */
export interface ChartProps {
  /** Width in CSS pixels, or `"100%"` for the host's: the chart measures its
      host and follows it through a ResizeObserver.
      @default "100%" */
  width?: number | "100%";
  /** Height in CSS pixels, fixed. Left out, the chart fills its frame - a
      stretched grid cell, a card the grid stretches, a container of definite
      height - and never goes below 300 px, which is also its height in a
      frame without one. A different floor goes through `style`'s `minHeight`
      (ADR-0050).
      @default fills the frame, at least 300 px */
  height?: number;
  /** Outer spacing of the plot area in CSS pixels. */
  padding?: number | Partial<Padding>;
  /** Required in DEV through a warning.
      @remarks R-7.6 */
  ariaLabel?: string;
  /** Goes to the root element, as it does everywhere in this workspace. */
  className?: string;
  /** Goes to the root element, after the chart's own styles: a `height` or
      `minHeight` set here wins. The plot area is observed in both directions
      and the scene follows it. */
  style?: CSSProperties;
  /** Shown in the middle of the plot area when no visible series has a point
      to show - no data, only gaps, or every series hidden. Axes and frame
      stay. Not while `loading`.
      @default the wording's `empty` */
  empty?: ReactNode;
  /** The rows are on their way, as the table's `loading` says (ADR-0042). A
      course already drawn stays: it dims after a moment and takes no pointer
      until the answer is in. Where there is nothing to show, the empty
      message waits. The plot is `aria-busy` meanwhile.
      @default false */
  loading?: boolean;
  /** The chart's words (ADR-0031); entries left out fall back to English.
      German: `GERMAN_CHARTS_WORDING` from `@umriss-ui/charts/wording/de`.
      @default DEFAULT_CHARTS_WORDING */
  wording?: Partial<ChartsWording>;
  /** How series are told apart. `"color"`: by their colour.
      `"marks"`: by a dash and a marker shape as well - a line, an area and a
      scatter -, and by a hatch - a bar, a state, a matrix cell, a limit band -,
      chosen by the same palette place as the colour, so that a reader who does
      not see the colours still tells them apart; the legend's chips show the
      same. A caller's own `dash` wins over the place's.
      @default "color" */
  encoding?: "color" | "marks";
  /** Charts with the same id share the pointer's x position, in domain units:
      each draws its crosshair there, the tooltip stays with the chart under
      the pointer. Zoom is not shared this way: charts zoom together by
      handing each other their view (`useChart`'s `initialView` and
      `onViewChange`). */
  syncId?: string;
  /** Instrumentation for the benchmark page; not needed otherwise.
      @remarks R-5.1 */
  onPerf?: (perf: ChartPerf) => void;
  /** The axes, series and companions of this chart. They draw nothing
      themselves: each registers its configuration and the scene draws it,
      and the order in the JSX is the drawing order.
      @remarks R-2.1 */
  children?: ReactNode;
}

/** The container of a chart: it holds the data, measures the plot area and
    draws on canvas whatever its children register - axes, series, limits,
    legend and tooltip. The order of the children is the drawing order.
    Reached through `useChart`, which hands it the rows and the scene that
    holds its view. */
export function Chart(props: ChartProps & { data: readonly unknown[]; scene: ChartScene }): ReactNode {
  const {
    data,
    scene,
    width = "100%",
    height,
    padding = 8,
    ariaLabel,
    className,
    style,
    onPerf,
    syncId,
    empty: emptyProp,
    loading = false,
    wording: wordingProp,
    encoding = "color",
    children,
  } = props;

  const wording = useMemo<ChartsWording>(() => ({ ...DEFAULT_CHARTS_WORDING, ...wordingProp }), [wordingProp]);
  const empty = emptyProp ?? wording.empty;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<HTMLDivElement | null>(null);
  const seriesRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const readoutRef = useRef<HTMLDivElement | null>(null);
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const summaryId = useId();

  const padObject = typeof padding === "number" ? undefined : padding;
  const padNumber = typeof padding === "number" ? padding : undefined;
  const padTop = padNumber ?? padObject?.top;
  const padRight = padNumber ?? padObject?.right;
  const padBottom = padNumber ?? padObject?.bottom;
  const padLeft = padNumber ?? padObject?.left;
  const pad = useMemo<Padding>(
    () => ({
      top: padTop ?? 8,
      right: padRight ?? 8,
      bottom: padBottom ?? 8,
      left: padLeft ?? 8,
    }),
    [padTop, padRight, padBottom, padLeft],
  );

  if (ariaLabel === undefined) {
    warnOnce(
      "chart-arialabel",
      "Chart without ariaLabel - please set a meaningful description (R-7.6).",
    );
  }

  // DOM binding, ResizeObserver (coalesced onto a rAF in the scene), DPR.
  useEffect(() => {
    const root = rootRef.current;
    const plot = plotRef.current;
    const seriesCanvas = seriesRef.current;
    const overlayCanvas = overlayRef.current;
    if (!root || !plot || !seriesCanvas || !overlayCanvas) return;

    scene.bind(plot, seriesCanvas, overlayCanvas, root);
    scene.bindA11y(readoutRef.current, summaryRef.current);

    const rect = plot.getBoundingClientRect();
    scene.requestResize(rect.width, rect.height);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry === undefined) return;
      const box = entry.contentBoxSize?.[0];
      if (box !== undefined) {
        scene.requestResize(box.inlineSize, box.blockSize);
      } else {
        scene.requestResize(entry.contentRect.width, entry.contentRect.height);
      }
    });
    observer.observe(plot);

    // Leaving the window ends the hover just as pointerleave does (R-4.10).
    const onBlur = (): void => scene.pointerLeave();
    window.addEventListener("blur", onBlur);
    const onTapOutside = (e: PointerEvent): void => {
      if (!plot.contains(e.target as Node)) scene.pointerLeave();
    };
    document.addEventListener("pointerdown", onTapOutside);
    // Zoom takes the wheel from the page, so the listener cannot be passive -
    // which React's is.
    const onWheel = (e: WheelEvent): void => scene.wheel(e);
    plot.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      plot.removeEventListener("wheel", onWheel);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("pointerdown", onTapOutside);
      observer.disconnect();
      scene.unbind();
    };
  }, [scene]);

  // Taking over data and configuration: only a scene entry plus a dirty flag
  // (R-2.2).
  useEffect(() => {
    scene.setData(data);
  }, [scene, data]);

  useEffect(() => {
    scene.setPadding(pad);
  }, [scene, pad]);

  useEffect(() => {
    scene.setWording(wording);
  }, [scene, wording]);

  useEffect(() => {
    scene.setEncoding(encoding);
  }, [scene, encoding]);

  useEffect(() => {
    scene.setOnPerf(onPerf ?? null);
  }, [scene, onPerf]);

  useEffect(() => {
    scene.setLoading(loading);
  }, [scene, loading]);

  useEffect(() => {
    scene.setSyncId(syncId ?? null);
    return () => scene.setSyncId(null);
  }, [scene, syncId]);

  // Runs after the effects of all children: only then is every axis and series
  // registered (R-4.12, R-4.13).
  useEffect(() => {
    scene.validate();
  });

  /* A chart with a tooltip has hits to walk: it is one tab stop whose keys
     move its Active point (ADR-0030). Without one it stays an image. */
  const hasHits = useSyncExternalStore(
    scene.subscribeHover,
    () => scene.getHoverSnapshot().tooltip !== null,
    () => false,
  );

  /* Loading over a course keeps the course, stale - as laid out, so that
     the stale state ends with the frame that draws the answer. */
  const stale = useSyncExternalStore(
    scene.subscribeLayout,
    () => {
      const snapshot = scene.getLayoutSnapshot();
      return snapshot.loading && !snapshot.empty;
    },
    () => false,
  );

  const silhouette = useSilhouette(scene);
  const arriving = silhouette?.leaving === true;

  const containerStyle: CSSProperties = {
    width: width === "100%" ? "100%" : `${width}px`,
    // Without a number: 100% where the frame has a definite height, auto where
    // it has none, and the floor either way (ADR-0050).
    ...(height === undefined
      ? { height: "100%", minHeight: 300 }
      : { height: `${height}px` }),
    ...style,
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>): void => {
    // offsetX/offsetY are already relative to .uc-plot - no
    // getBoundingClientRect, no layout read in the hover path (R-5.4). The hit
    // test does allocate: a handful of small objects per move, whatever the
    // point count - about 3 µs per move at 3 × 1,000,000 points, measured, a
    // five-thousandth of a frame. Pooling them would buy nothing visible.
    scene.drag(e.nativeEvent);
    scene.pointerMove(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  return (
    <ChartContext.Provider value={scene}>
      <div
        ref={rootRef}
        className={className ? `uc-root ${className}` : "uc-root"}
        style={containerStyle}
      >
        {/* The image is the plot area, not the root: the root contains the
            legend, and the descendants of an image are presentational to a
            screen reader. The legend stands beside it and stays reachable
            (library-audit 05). */}
        <div
          ref={plotRef}
          className="uc-plot"
          role={hasHits ? "application" : "img"}
          aria-roledescription={hasHits ? wording.roleDescription : undefined}
          aria-label={ariaLabel}
          aria-describedby={summaryId}
          aria-busy={loading || undefined}
          data-stale={stale || undefined}
          data-arriving={arriving || undefined}
          tabIndex={hasHits ? 0 : undefined}
          onKeyDown={(e) => {
            if (scene.key(e.nativeEvent)) e.preventDefault();
          }}
          onFocus={(e) => scene.focus(focusVisible(e.currentTarget))}
          onBlur={() => scene.blur()}
          onPointerMove={onPointerMove}
          // A touch has no hover: the tap shows the tooltip, and the leave that
          // follows every lifted finger would take it straight away again. A
          // tap on empty plot ends it, as does one outside (the effect above).
          onPointerDown={(e) => {
            scene.pointerDown(e.nativeEvent);
            onPointerMove(e);
          }}
          onPointerUp={(e) => scene.pointerUp(e.nativeEvent)}
          onPointerCancel={(e) => scene.pointerUp(e.nativeEvent)}
          onDoubleClick={() => scene.resetZoom()}
          onPointerLeave={(e) => {
            if (e.pointerType !== "touch") scene.pointerLeave();
          }}
        >
          <canvas ref={seriesRef} className="uc-layer-series" aria-hidden="true" />
          <canvas ref={overlayRef} className="uc-layer-overlay" aria-hidden="true" />
          <AxesHtml scene={scene} empty={empty} silhouette={silhouette} />
          <TooltipHtml scene={scene} />
        </div>
        <ShowAll scene={scene} plotRef={plotRef} label={wording.showAll} />
        {/* What a screen reader hears (charts-a11y 03): the readout after a
            key, and the summary the plot is described by. Beside the plot,
            not in it: an image's descendants are presentational. */}
        <div ref={readoutRef} className="uc-sr" aria-live="polite" />
        <div ref={summaryRef} id={summaryId} className="uc-sr" />
        {children}
      </div>
    </ChartContext.Provider>
  );
}

/** 'Show all' (component-view 04): while a zoomable x axis shows less than
    its own domain, a quiet control brings every zoomed axis back. It stands
    beside the plot, not in it - a tab stop of its own outside the plot's
    application role -, laid over the corner of the plot area away from a
    legend or data key above it. */
function ShowAll({ scene, plotRef, label }: { scene: ChartScene; plotRef: RefObject<HTMLDivElement | null>; label: string }): ReactNode {
  const zoomed = useSyncExternalStore(
    scene.subscribeView,
    () => scene.getView().domains !== undefined,
    () => false,
  );
  const snapshot = useSyncExternalStore(scene.subscribeLayout, scene.getLayoutSnapshot, scene.getLayoutServerSnapshot);
  const { plot } = snapshot.layout;
  if (!zoomed || plot.width <= 0) return null;
  // A legend above the plot - or the data key's line where there is none.
  const top = snapshot.legend === null ? snapshot.dataTable !== null : snapshot.legend.placement === "top";
  return (
    <ShowAllButton
      scene={scene}
      plotRef={plotRef}
      label={label}
      // In the plot's coordinates; the plot's own offset in the root is added
      // where it is known.
      x={plot.x + plot.width}
      y={top ? plot.y + plot.height : plot.y}
      bottom={top}
    />
  );
}

function ShowAllButton(props: {
  scene: ChartScene;
  plotRef: RefObject<HTMLDivElement | null>;
  label: string;
  x: number;
  y: number;
  bottom: boolean;
}): ReactNode {
  const { scene, plotRef, label, x, y, bottom } = props;
  const ref = useRef<HTMLButtonElement | null>(null);

  // Where the plot stands in the root depends on a legend above it.
  useLayoutEffect(() => {
    const button = ref.current;
    const plotEl = plotRef.current;
    if (button === null || plotEl === null) return;
    button.style.left = `${plotEl.offsetLeft + x}px`;
    button.style.top = `${plotEl.offsetTop + y}px`;
  });

  // Gone with the focus, it hands the focus to the plot - before it leaves
  // the document, while it still knows that it had it.
  useLayoutEffect(() => {
    const button = ref.current;
    const plotEl = plotRef.current;
    return () => {
      if (button !== null && button.ownerDocument.activeElement === button) plotEl?.focus();
    };
  }, [plotRef]);

  return (
    <button
      ref={ref}
      type="button"
      className={bottom ? "uc-show-all uc-show-all-bottom" : "uc-show-all"}
      onClick={() => scene.resetZoom()}
    >
      {label}
    </button>
  );
}

/** Did the focus come by keyboard? A click focuses the plot too, and must not
    start the walk. Where the selector is unknown, it is taken as yes. */
function focusVisible(el: HTMLElement): boolean {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}
