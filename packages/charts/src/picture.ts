/* The chart's picture (ADR-0075): one PNG of what the reader sees, painted on
   a canvas of its own - the ground, the series layer drawn again by the
   function the screen uses, then the root's HTML parts where the browser laid
   them out, in the page's fonts. The painter knows the chart's own parts, not
   HTML at large: boxes with a background, a top border, a skew, an opacity,
   text, and the legend's SVG chips as images. */

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

export async function toPicture(s: ChartScene): Promise<Blob> {
  const root = s.themeRoot;
  const plotEl = s.container;
  if (root === null || plotEl === null) throw new Error("The chart is not on screen.");
  const rect = root.getBoundingClientRect();
  const width = root.offsetWidth || rect.width;
  const height = root.offsetHeight || rect.height;
  if (!(width > 0) || !(height > 0)) throw new Error("The chart has no size.");
  const frame: Frame = { left: rect.left, top: rect.top, scale: rect.width / width || 1 };
  const ratio = Math.max(typeof devicePixelRatio === "number" ? devicePixelRatio : 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext("2d");
  if (ctx === null) throw new Error("No 2D canvas.");
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

  const images: Array<() => Promise<void>> = [];
  paintParts(ctx, root, frame, 1, images);
  // The chips come last: they lie on nothing the painter draws.
  for (const draw of images) await draw();
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob === null ? reject(new Error("The picture could not be encoded.")) : resolve(blob)), "image/png");
  });
}

function paintParts(ctx: CanvasRenderingContext2D, el: Element, frame: Frame, alpha: number, images: Array<() => Promise<void>>): void {
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
      if (part instanceof SVGElement) {
        if (part.localName === "svg") images.push(() => paintSvg(ctx, part, frame, own));
        continue;
      }
      paintBox(ctx, part, style, frame, own);
      paintParts(ctx, part, frame, own, images);
    }
  }
}

/** The element's computed 2D transform as [a, b, c, d]; its translation is
    already in the element's bounding rectangle. */
function linear(style: CSSStyleDeclaration): number[] {
  const m = /^matrix\(([^)]*)\)/.exec(style.transform)?.[1];
  return m === undefined ? [1, 0, 0, 1] : m.split(",").slice(0, 4).map(Number);
}

/** A box with a background (and its radius), and a top border as a line in
    its style. A transformed box (the axis break's skew) is drawn about the
    centre of its bounding rectangle, at its own layout size. */
function paintBox(ctx: CanvasRenderingContext2D, el: HTMLElement, style: CSSStyleDeclaration, frame: Frame, alpha: number): void {
  const color = style.backgroundColor;
  const fill = !(color === "" || color === "transparent" || color === "rgba(0, 0, 0, 0)");
  const border = parseFloat(style.borderTopWidth) || 0;
  const line = border > 0 && style.borderTopStyle !== "none" && style.borderTopStyle !== "hidden";
  if (!fill && !line) return;
  const r = el.getBoundingClientRect();
  const m = linear(style);
  const turned = m.some((v, i) => v !== [1, 0, 0, 1][i]);
  const w = turned ? el.offsetWidth : r.width / frame.scale;
  const h = turned ? el.offsetHeight : r.height / frame.scale;
  const cx = (r.left + r.width / 2 - frame.left) / frame.scale;
  const cy = (r.top + r.height / 2 - frame.top) / frame.scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  if (turned) ctx.transform(m[0] as number, m[1] as number, m[2] as number, m[3] as number, 0, 0);
  if (fill) {
    ctx.fillStyle = color;
    const radius = parseFloat(style.borderTopLeftRadius) || 0;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, radius);
    ctx.fill();
  }
  if (line) {
    ctx.strokeStyle = style.borderTopColor;
    ctx.lineWidth = border;
    ctx.setLineDash(style.borderTopStyle === "dashed" ? [border * 3, border * 3] : style.borderTopStyle === "dotted" ? [border, border] : []);
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2 + border / 2);
    ctx.lineTo(w / 2, -h / 2 + border / 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** An SVG chip as an image of its own serialised markup. */
function paintSvg(ctx: CanvasRenderingContext2D, svg: Element, frame: Frame, alpha: number): Promise<void> {
  const r = svg.getBoundingClientRect();
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      ctx.globalAlpha = alpha;
      ctx.drawImage(image, (r.left - frame.left) / frame.scale, (r.top - frame.top) / frame.scale, r.width / frame.scale, r.height / frame.scale);
      ctx.globalAlpha = 1;
      resolve();
    };
    // A chip that cannot be drawn leaves a gap, not a failed picture.
    image.onerror = () => resolve();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
  });
}

/** The words of each line box of a text node, in the order of the boxes: the
    text's own lines where they match the boxes, else each character goes to
    the box that holds it, so that a label the browser soft-wrapped paints each
    line once. A space the wrap swallowed has no box and goes with the
    character before it. Where no split can be made, the whole text. */
export function lineTexts(node: Text, boxes: readonly DOMRect[]): string[] {
  const text = node.data;
  const lines = text.split("\n");
  if (boxes.length === lines.length) return lines;
  if (boxes.length < 2) return [text];
  const parts = boxes.map(() => "");
  const range = document.createRange();
  let at = 0;
  for (let i = 0; i < text.length; i++) {
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    const r = range.getClientRects()[0];
    if (r !== undefined) {
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const found = boxes.findIndex((b) => x >= b.left - 1 && x <= b.right + 1 && y >= b.top - 1 && y <= b.bottom + 1);
      if (found >= 0) at = found;
    }
    parts[at] = (parts[at] ?? "") + text[i];
  }
  const words = parts.map((part) => part.trim());
  return words.every((w) => w !== "") ? words : [text];
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
  const own = lineTexts(node, boxes);
  // A computed 2D transform is "matrix(a, b, c, d, e, f)".
  const [a = 1, b = 0] = (/^matrix\(([^)]*)\)/.exec(style.transform)?.[1] ?? "").split(",").map(Number);
  const turn = (style.writingMode.startsWith("vertical") ? Math.PI / 2 : 0) + Math.atan2(b, a);

  ctx.font = style.font;
  ctx.fillStyle = style.color;
  ctx.letterSpacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
  ctx.textBaseline = "middle";
  ctx.globalAlpha = alpha;
  boxes.forEach((box, i) => {
    const line = own[i] ?? (own[0] as string);
    const cx = (box.left + box.width / 2 - frame.left) / frame.scale;
    const cy = (box.top + box.height / 2 - frame.top) / frame.scale;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(turn);
    ctx.textAlign = "center";
    ctx.fillText(line, 0, 0);
    if (style.textDecorationLine.includes("line-through")) {
      ctx.strokeStyle = style.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-box.width / frame.scale / 2, 0);
      ctx.lineTo(box.width / frame.scale / 2, 0);
      ctx.stroke();
    }
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}
