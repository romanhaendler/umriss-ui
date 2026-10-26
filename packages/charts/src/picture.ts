/* The chart's picture (ADR-0075): one PNG of what the reader sees, painted on
   a canvas of its own - the ground, the series layer drawn again by the
   function the screen uses, then the root's HTML parts where the browser laid
   them out, in the page's fonts. The painter knows the chart's own parts, not
   HTML at large: boxes with a background, and text. */

import { drawSeriesLayer } from "./draw";
import type { ChartScene } from "./scene";
import { seriesInput } from "./sceneDraw";
import { FALLBACK_THEME } from "./theme";

/** Parts that are not in the picture: the overlay and its hover, the tooltip,
    what only a screen reader hears, the measuring span, the zoom's button,
    the data key and its panel, and the loading silhouette. */
const LEFT_OUT =
  ".uc-layer-series, .uc-layer-overlay, .uc-tooltip, .uc-sr, .uc-measure, .uc-show-all, .uc-data-key, .uc-data-panel, .uc-silhouette";

/** Where the root's pixels are: its CSS size, and how much smaller or larger
    it shows on screen (a CSS transform on an ancestor). */
interface Frame {
  left: number;
  top: number;
  scale: number;
}

export function toPicture(s: ChartScene): Promise<Blob> {
  const root = s.themeRoot;
  const plotEl = s.container;
  if (root === null || plotEl === null) return Promise.reject(new Error("The chart is not on screen."));
  const rect = root.getBoundingClientRect();
  const width = root.offsetWidth || rect.width;
  const height = root.offsetHeight || rect.height;
  if (!(width > 0) || !(height > 0)) return Promise.reject(new Error("The chart has no size."));
  const frame: Frame = { left: rect.left, top: rect.top, scale: rect.width / width || 1 };
  const ratio = Math.max(typeof devicePixelRatio === "number" ? devicePixelRatio : 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext("2d");
  if (ctx === null) return Promise.reject(new Error("No 2D canvas."));
  const theme = s.theme ?? FALLBACK_THEME;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  // The series layer clears what it draws on, so the ground goes in behind it.
  const plotRect = plotEl.getBoundingClientRect();
  ctx.save();
  ctx.translate((plotRect.left - frame.left) / frame.scale, (plotRect.top - frame.top) / frame.scale);
  drawSeriesLayer(ctx, seriesInput(s, theme));
  ctx.restore();
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = theme.colorBg;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";

  paintParts(ctx, root, frame, 1);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob === null ? reject(new Error("The picture could not be encoded.")) : resolve(blob)), "image/png");
  });
}

function paintParts(ctx: CanvasRenderingContext2D, el: Element, frame: Frame, alpha: number): void {
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      paintText(ctx, child as Text, el as HTMLElement, frame, alpha);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const part = child as HTMLElement;
      if (part.matches(LEFT_OUT)) continue;
      const style = getComputedStyle(part);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const opacity = parseFloat(style.opacity);
      const own = alpha * (Number.isNaN(opacity) ? 1 : opacity);
      paintBox(ctx, part, style, frame, own);
      paintParts(ctx, part, frame, own);
    }
  }
}

function paintBox(ctx: CanvasRenderingContext2D, el: HTMLElement, style: CSSStyleDeclaration, frame: Frame, alpha: number): void {
  const color = style.backgroundColor;
  if (color === "" || color === "transparent" || color === "rgba(0, 0, 0, 0)") return;
  const r = el.getBoundingClientRect();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect((r.left - frame.left) / frame.scale, (r.top - frame.top) / frame.scale, r.width / frame.scale, r.height / frame.scale);
  ctx.globalAlpha = 1;
}

/** A text node in its element's font, colour and letter-spacing, line by line
    where the browser broke it. A vertical title is turned as on screen: the
    writing mode's quarter turn and the element's own rotation. */
function paintText(ctx: CanvasRenderingContext2D, node: Text, el: HTMLElement, frame: Frame, alpha: number): void {
  const text = node.data;
  if (text.trim() === "") return;
  const style = getComputedStyle(el);
  const range = document.createRange();
  range.selectNodeContents(node);
  const boxes = Array.from(range.getClientRects());
  if (boxes.length === 0) return;
  const lines = text.split("\n");
  const own = boxes.length === lines.length ? lines : [text];
  // A computed 2D transform is "matrix(a, b, c, d, e, f)".
  const [a = 1, b = 0] = (/^matrix\(([^)]*)\)/.exec(style.transform)?.[1] ?? "").split(",").map(Number);
  const turn = (style.writingMode.startsWith("vertical") ? Math.PI / 2 : 0) + Math.atan2(b, a);

  ctx.font = style.font;
  ctx.fillStyle = style.color;
  ctx.letterSpacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
  ctx.textBaseline = "middle";
  ctx.globalAlpha = alpha;
  boxes.forEach((box, i) => {
    const line = own[i % own.length] as string;
    const cx = (box.left + box.width / 2 - frame.left) / frame.scale;
    const cy = (box.top + box.height / 2 - frame.top) / frame.scale;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(turn);
    ctx.textAlign = "center";
    ctx.fillText(line, 0, 0);
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}
