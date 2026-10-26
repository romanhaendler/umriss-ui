/* DOM binding, size and DPR, and the frame loop: what the scene does when a
   container, a canvas or the live regions come and go, when the size or the
   pixel ratio changes, and when a frame is due. Functions over the scene. */

import { warnOnce } from "./dev";
import { TextMeasurer } from "./measure";
import type { ChartScene } from "./scene";
import { paintSeriesLayer, paintOverlayLayer } from "./sceneDraw";
import { pointerMove } from "./sceneHit";
import { reapplyKey } from "./sceneKeys";
import { updateLayout } from "./sceneLayout";
import { materialize } from "./sceneMaterial";
import { endRange } from "./sceneView";
import { scheduleSummary } from "./sceneSpeech";
import { resolveTheme, subscribeTheme } from "./theme";
import { type ChartsWording } from "./wording";
import { pushLayoutSnapshot } from "./sceneSnapshots";

export function bind(
  s: ChartScene,
  container: HTMLElement,
  seriesCanvas: HTMLCanvasElement,
  overlayCanvas: HTMLCanvasElement,
  themeRoot: HTMLElement,
): void {
  if (s.container !== null && s.container !== container) {
    warnOnce("chart-twice", "The Chart of one useChart is drawn twice at once: one Chart per useChart - a second chart is a second call.");
  }
  s.container = container;
  s.themeRoot = themeRoot;
  s.seriesCanvas = seriesCanvas;
  s.overlayCanvas = overlayCanvas;
  s.seriesCtx = seriesCanvas.getContext("2d");
  s.overlayCtx = overlayCanvas.getContext("2d");
  s.measurer = new TextMeasurer(themeRoot);
  s.dpr = typeof devicePixelRatio === "number" ? devicePixelRatio : 1;
  rebindDprWatch(s);
  s.unsubscribeTheme = subscribeTheme(() => {
    s.theme = null;
    s.painted.clear();
    s.measurer?.clear();
    s.hysteresis.clear();
    markLayoutDirty(s);
  });
  // A web font that arrives after the first layout makes every measured label
  // wider than its band: measure anew once it is there. The hysteresis goes
  // with the cache, since it remembers band widths measured in the fallback font.
  const fonts = typeof document === "undefined" ? undefined : document.fonts;
  fonts?.addEventListener?.("loadingdone", s.onFontsLoaded);
  s.theme = null;
  s.painted.clear();
  markLayoutDirty(s);
}

export function bindTooltip(s: ChartScene, el: HTMLElement | null): void {
  s.tooltipEl = el;
}

export function bindA11y(s: ChartScene, readout: HTMLElement | null, summary: HTMLElement | null): void {
  s.readoutEl = readout;
  s.summaryEl = summary;
  scheduleSummary(s);
}

export function setWording(s: ChartScene, wording: ChartsWording): void {
  if (wording === s.wording) return;
  s.wording = wording;
  // The data table's key and caption are written from it, and a percent
  // axis' labels; a layout pushes both and the summary.
  markLayoutDirty(s);
}

export function unbind(s: ChartScene): void {
  endRange(s);
  if (s.frameHandle !== null && typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(s.frameHandle);
    s.frameHandle = null;
  }
  s.dprMedia?.removeEventListener?.("change", s.onDprChange);
  s.dprMedia = null;
  s.unsubscribeTheme?.();
  s.unsubscribeTheme = null;
  if (typeof document !== "undefined") {
    document.fonts?.removeEventListener?.("loadingdone", s.onFontsLoaded);
  }
  s.measurer?.remove();
  s.measurer = null;
  s.container = null;
  s.themeRoot = null;
  s.seriesCanvas = null;
  s.overlayCanvas = null;
  s.seriesCtx = null;
  s.overlayCtx = null;
  s.tooltipEl = null;
  s.readoutEl = null;
  s.summaryEl = null;
  if (s.readoutTimer !== null) clearTimeout(s.readoutTimer);
  if (s.summaryTimer !== null) clearTimeout(s.summaryTimer);
  s.readoutTimer = null;
  s.summaryTimer = null;
}

/** Detect a change of DPR (a change of monitor): rebind matchMedia. */
export function rebindDprWatch(s: ChartScene): void {
  if (typeof matchMedia !== "function") return;
  s.dprMedia?.removeEventListener?.("change", s.onDprChange);
  s.dpr = typeof devicePixelRatio === "number" ? devicePixelRatio : 1;
  s.dprMedia = matchMedia(`(resolution: ${s.dpr}dppx)`);
  s.dprMedia.addEventListener?.("change", s.onDprChange);
}

/** Called by the ResizeObserver; coalesced onto one rAF. */
export function requestResize(s: ChartScene, cssWidth: number, cssHeight: number): void {
  // Against the size still to come, not the one applied: a resize there and
  // back within one frame would otherwise leave the "there" pending.
  if (cssWidth === (s.pendingWidth ?? s.cssWidth) && cssHeight === (s.pendingHeight ?? s.cssHeight)) return;
  s.pendingWidth = cssWidth;
  s.pendingHeight = cssHeight;
  markLayoutDirty(s);
}

export function applyPendingSize(s: ChartScene): void {
  if (s.pendingWidth === null || s.pendingHeight === null) return;
  s.cssWidth = s.pendingWidth;
  s.cssHeight = s.pendingHeight;
  s.pendingWidth = null;
  s.pendingHeight = null;
  const { seriesCanvas, overlayCanvas, seriesCtx, overlayCtx, dpr } = s;
  if (!seriesCanvas || !overlayCanvas || !seriesCtx || !overlayCtx) return;
  const w = Math.max(0, Math.round(s.cssWidth * dpr));
  const h = Math.max(0, Math.round(s.cssHeight * dpr));
  for (const canvas of [seriesCanvas, overlayCanvas]) {
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${s.cssWidth}px`;
    canvas.style.height = `${s.cssHeight}px`;
  }
  // Every drawing coordinate in CSS pixels:
  seriesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function markSeriesDirty(s: ChartScene): void {
  s.seriesDirty = true;
  requestFrame(s);
}

export function markOverlayDirty(s: ChartScene): void {
  s.overlayDirty = true;
  requestFrame(s);
}

/** A layout-relevant change: it pulls the series and the overlay layer with
    it. */
export function markLayoutDirty(s: ChartScene): void {
  s.layoutDirty = true;
  s.seriesDirty = true;
  s.overlayDirty = true;
  requestFrame(s);
}

export function requestFrame(s: ChartScene): void {
  if (s.frameHandle !== null) return; // exactly one rAF
  if (s.container === null) return; // unbound: the flags stay set
  if (typeof requestAnimationFrame !== "function") return;
  s.frameHandle = requestAnimationFrame(() => {
    s.frameHandle = null;
    frame(s);
  });
}

/** The frame now, not on the next animation frame: a print layout is taken
    right after the media query's change, and a frame waited for lands after it. */
export function frameNow(s: ChartScene): void {
  if (s.frameHandle !== null && typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(s.frameHandle);
    s.frameHandle = null;
  }
  frame(s);
}

export function frame(s: ChartScene): void {
  applyPendingSize(s);
  if (s.theme === null && s.themeRoot !== null) {
    s.theme = resolveTheme(s.themeRoot);
  }
  if (s.cssWidth <= 0 || s.cssHeight <= 0) {
    // at size 0, neither draw nor throw. The HTML layer gets its state
    // all the same (the legend does not depend on the plot area); layoutDirty
    // stays set, and the next resize calculates the layout.
    if (s.layoutDirty) pushLayoutSnapshot(s);
    return;
  }
  if (s.materialsDirty) materialize(s);
  if (s.layoutDirty) {
    updateLayout(s);
    s.layoutDirty = false;
    pushLayoutSnapshot(s);
    // New data or a new layout under a resting pointer: the hit it had names
    // old values at old pixels. Ask again at the same place.
    if (s.activeBy === "keyboard") {
      s.hoverKey = "";
      reapplyKey(s);
    } else if (s.hover !== null) {
      const { mouseX, mouseY } = s.hover;
      s.hoverKey = "";
      pointerMove(s, mouseX, mouseY);
    }
  }
  if (s.seriesDirty) {
    paintSeriesLayer(s);
    s.seriesDirty = false;
  }
  if (s.overlayDirty) {
    paintOverlayLayer(s);
    s.overlayDirty = false;
  }
}
