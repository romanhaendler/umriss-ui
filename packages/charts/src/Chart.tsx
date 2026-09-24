/* Chart<T> - container and ChartScene provider (4.1, R-2.1, R-2.8-R-2.10).

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
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { ChartContext } from "./context";
import { ChartScene } from "./scene";
import { AxesHtml } from "./AxesHtml";
import { TooltipHtml } from "./TooltipHtml";
import { warnOnce } from "./dev";
import { DEFAULT_CHARTS_WORDING, type ChartsWording } from "./wording";
import type { ChartPerf, Padding } from "./types";
import "./styles/charts.css";

export interface ChartProps<T> {
  /** Shared data basis (required); access only through accessors (R-2.4). */
  data: readonly T[];
  /** Width in CSS pixels, or `"100%"` for the host's. Without a value the chart
      measures its host and follows it through a ResizeObserver. */
  width?: number | "100%";
  /** Height in CSS pixels; 300 without a value. Unlike the width, the chart
      does not take its host's. */
  height?: number;
  /** Outer spacing of the plot area in CSS pixels. */
  padding?: number | Partial<Padding>;
  /** Required in DEV through a warning (R-7.6). */
  ariaLabel?: string;
  /** Goes to the root element, as it does everywhere in this workspace. */
  className?: string;
  /** Goes to the root element. The plot area is measured, never styled from
      here: a height set past the component is a height the scene does not know
      about. */
  style?: CSSProperties;
  /** Shown in the middle of the plot area when no visible series has a point
      to show - no data, only gaps, or every series hidden. Axes and frame
      stay. Without a value the wording's `empty`; this prop wins over it. */
  empty?: ReactNode;
  /** The chart's words (ADR-0031): English without a value, entries left out
      fall back to English. German: `GERMAN_CHARTS_WORDING` from
      `@umriss-ui/charts/wording/de`. */
  wording?: Partial<ChartsWording>;
  /** Charts with the same id share the pointer's x position, in domain units:
      each draws its crosshair there, the tooltip stays with the chart under
      the pointer. Zoom is not shared - give every chart the same controlled
      `domain`. */
  syncId?: string;
  /** Instrumentation for the benchmark page (R-5.1); not needed otherwise. */
  onPerf?: (perf: ChartPerf) => void;
  /** The axes, series and companions of this chart. They draw nothing
      themselves: each registers its configuration and the scene draws it
      (R-2.1), and the order in the JSX is the drawing order. */
  children?: ReactNode;
}

export function Chart<T>(props: ChartProps<T>): ReactNode {
  const {
    data,
    width = "100%",
    height = 300,
    padding = 8,
    ariaLabel,
    className,
    style,
    onPerf,
    syncId,
    empty: emptyProp,
    wording: wordingProp,
    children,
  } = props;

  const wording = useMemo<ChartsWording>(() => ({ ...DEFAULT_CHARTS_WORDING, ...wordingProp }), [wordingProp]);
  const empty = emptyProp ?? wording.empty;

  const [scene] = useState(() => new ChartScene());
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
    scene.setOnPerf(onPerf ?? null);
  }, [scene, onPerf]);

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
  const walkable = useSyncExternalStore(
    scene.subscribeHover,
    () => scene.getHoverSnapshot().tooltip !== null,
    () => false,
  );

  const containerStyle: CSSProperties = {
    width: width === "100%" ? "100%" : `${width}px`,
    height: `${height}px`,
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
          role={walkable ? "application" : "img"}
          aria-roledescription={walkable ? wording.roleDescription : undefined}
          aria-label={ariaLabel}
          aria-describedby={summaryId}
          tabIndex={walkable ? 0 : undefined}
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
          onDoubleClick={() => scene.doubleClick()}
          onPointerLeave={(e) => {
            if (e.pointerType !== "touch") scene.pointerLeave();
          }}
        >
          <canvas ref={seriesRef} className="uc-layer-series" aria-hidden="true" />
          <canvas ref={overlayRef} className="uc-layer-overlay" aria-hidden="true" />
          <AxesHtml scene={scene} empty={empty} />
          <TooltipHtml scene={scene} />
        </div>
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

/** Did the focus come by keyboard? A click focuses the plot too, and must not
    start the walk. Where the selector is unknown, it is taken as yes. */
function focusVisible(el: HTMLElement): boolean {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}
