/* Chart - container and ChartScene provider.

   Structure of the DOM:
     .uc-root      flex column; the --uc-* variables live here (theme root)
       .uc-plot    reference area of all pixel coordinates; catches the mouse events
         canvas.uc-layer-series   series and grid
         canvas.uc-layer-overlay  crosshair and hover markers
         .uc-axes                 axes, ticks, titles (HTML)
         .uc-tooltip              tooltip (HTML)
       <Legend/>   optional, placed above or below the plot area through CSS order

   Canvas access happens exclusively inside effects (SSR-safe).
   Accessibility baseline: role="img" + aria-label on the plot,
   canvas elements aria-hidden. */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import { ChartContext } from "./context";
import type { ChartScene } from "./scene";
import { AxesHtml } from "./AxesHtml";
import { useSilhouette } from "./Silhouette";
import { TooltipHtml } from "./TooltipHtml";
import { asRows, warnOnce } from "./dev";
import { DEFAULT_CHARTS_WORDING, type ChartsWording } from "./wording";
import { checkZone } from "./zone";
import type { ChartPerf, Padding } from "./types";
import "./styles/charts.css";

/** The props of `Chart`. Its rows are not among them: `useChart(rows)` binds
    them (ADR-0048). */
export interface ChartProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The root element, the `<div>` that `className`, `style`, `id` and the
      `data-*` attributes reach. */
  ref?: Ref<HTMLDivElement>;
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
      Its `locale` also formats every number and every date or time label the
      chart makes itself (`en-GB`, `de-DE`; the browser's language is not
      read) - a `tickFormat` or `format` of your own stays in charge of its
      axis or series. German: `GERMAN_CHARTS_WORDING` from `@umriss-ui/charts/wording/de`.
      @default DEFAULT_CHARTS_WORDING */
  wording?: Partial<ChartsWording>;
  /** An IANA time zone (`"Europe/Berlin"`) for every time axis of the chart, a
      calendar axis included: ticks stand on its hours and midnights, and the
      labels, tooltip, readout, data table and summary write its time, in the
      wording's `locale`. Where the reader's zone is another, the axis title
      ends in the zone's name (after mount). An hour a clock change doubles is
      ticked twice and its labels carry the offset; the hour it removes has
      no tick. A name Intl does not know throws its `RangeError`. An
      application on `@umriss-ui/core` passes `useFormats().timeZone`.
      @default the reader's zone */
  timeZone?: string;
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
      sending each other their view (`useChart`'s `onViewChange` and
      `setView`). */
  syncId?: string;
  /** Instrumentation for the benchmark page; not needed otherwise. */
  onPerf?: (perf: ChartPerf) => void;
  /** The axes, series and companions of this chart. They draw nothing
      themselves: each registers its configuration and the scene draws it,
      and the order in the JSX is the drawing order. */
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
    "aria-label": label,
    "aria-labelledby": labelledBy,
    "aria-describedby": describedBy,
    ref,
    className,
    style,
    onPerf,
    syncId,
    empty: emptyProp,
    loading = false,
    wording: wordingProp,
    timeZone,
    encoding = "color",
    children,
    ...rest
  } = props;

  const wording = useMemo<ChartsWording>(() => ({ ...DEFAULT_CHARTS_WORDING, ...wordingProp }), [wordingProp]);
  if (timeZone !== undefined) checkZone(timeZone);
  const empty = emptyProp ?? wording.empty;

  const rootRef = useRef<HTMLDivElement | null>(null);
  /* The chart's effects and the caller's ref bind the same root. */
  const setRoot = useCallback(
    (element: HTMLDivElement | null): void => {
      rootRef.current = element;
      if (typeof ref === "function") ref(element);
      else if (ref) ref.current = element;
    },
    [ref],
  );
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

  if (label === undefined && labelledBy === undefined) {
    warnOnce(
      "chart-arialabel",
      "Chart without aria-label - please set a meaningful description (R-7.6).",
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

    // The page's print layout is not a resize the observer reports, and at
    // `beforeprint` the page is still laid out for the screen; inside the
    // media query's change the print layout can be measured. The frame runs
    // here and in `flushSync`, so that the HTML axes are in the DOM before
    // the page is printed. The same change on the way back restores the screen.
    const printMedia = typeof matchMedia === "function" ? matchMedia("print") : null;
    const onPrint = (): void => {
      const box = plot.getBoundingClientRect();
      scene.requestResize(box.width, box.height);
      flushSync(() => scene.frameNow());
      // The page may still be settling here (the way back from print can
      // measure a transient width) and the observer saw no print layout, so it
      // would report no change: observing anew has it report the settled size.
      observer.unobserve(plot);
      observer.observe(plot);
    };
    printMedia?.addEventListener?.("change", onPrint);

    // Leaving the window ends the hover just as pointerleave does.
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
      printMedia?.removeEventListener?.("change", onPrint);
      scene.unbind();
    };
  }, [scene]);

  // Taking over data and configuration: only a scene entry plus a dirty flag.
  // The rows in a layout effect, so that they stand before the series' effects
  // of the same commit compare their functions on them: new rows with a new
  // function are a new course, not a function that reads a changed outer value.
  useLayoutEffect(() => {
    scene.setData(asRows(data, "the rows of useChart"));
  }, [scene, data]);

  useEffect(() => {
    scene.setPadding(pad);
  }, [scene, pad]);

  useEffect(() => {
    scene.setWording(wording);
  }, [scene, wording]);

  useEffect(() => {
    scene.setTimeZone(timeZone);
  }, [scene, timeZone]);

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
  // registered.
  useEffect(() => {
    scene.validate();
  });

  /* A chart with a tooltip has hits to walk, one with a zoomable x axis has
     keys to zoom: either is one tab stop (ADR-0030). Neither stays an image. */
  const hasHits = useSyncExternalStore(
    scene.subscribeHover,
    () => scene.getHoverSnapshot().tooltip !== null,
    () => false,
  );
  const keyed = useSyncExternalStore(scene.subscribeLayout, () => hasHits || scene.keyed(), () => false);

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
    // getBoundingClientRect, no layout read in the hover path. The hit
    // test allocates a handful of small objects per move, whatever the
    // point count.
    scene.drag(e.nativeEvent);
    scene.pointerMove(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  return (
    <ChartContext value={scene}>
      <div
        {...rest}
        ref={setRoot}
        className={className ? `uc-root ${className}` : "uc-root"}
        style={containerStyle}
      >
        {/* The image is the plot area, not the root: the root contains the
            legend, and the descendants of an image are presentational to a
            screen reader. The legend stands beside it and stays reachable. */}
        <div
          ref={plotRef}
          className="uc-plot"
          role={keyed ? "application" : "img"}
          aria-roledescription={keyed ? wording.roleDescription : undefined}
          aria-label={label}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy === undefined ? summaryId : `${summaryId} ${describedBy}`}
          aria-busy={loading || undefined}
          data-stale={stale || undefined}
          data-arriving={arriving || undefined}
          tabIndex={keyed ? 0 : undefined}
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
          onClick={(e) => scene.click(e.nativeEvent)}
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
        {/* What a screen reader hears: the readout after a
            key, and the summary the plot is described by. Beside the plot,
            not in it: an image's descendants are presentational. */}
        <div ref={readoutRef} className="uc-sr" aria-live="polite" />
        <div ref={summaryRef} id={summaryId} className="uc-sr" />
        {children}
      </div>
    </ChartContext>
  );
}

/** 'Show all': while a zoomable x axis shows less than
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
