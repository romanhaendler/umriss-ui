/* The colour helpers of ColorPicker; internal to core, not exported.
   Colours travel as lowercase "#rrggbb" strings. */

/** Hue 0..360, saturation and brightness 0..1 - the HSB of Photoshop, Figma and the browser's own picker. */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

export type Rgb = readonly [number, number, number];

/** "#abc", "ABC", "#aabbcc" -> "#aabbcc"; null if the text is not a whole hex colour. */
export function normalizeHex(text: unknown): string | null {
  if (typeof text !== "string") return null;
  const digits = text.trim().replace(/^#/, "").toLowerCase();
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/.test(digits)) return null;
  return `#${digits.length === 3 ? [...digits].map((digit) => digit + digit).join("") : digits}`;
}

export function hexToRgb(hex: string): Rgb {
  const n = parseInt((normalizeHex(hex) ?? "#000000").slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: Rgb): string {
  const part = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const channel = (n: number) => {
    const k = (n + h / 60) % 6;
    return 255 * (v - v * s * Math.max(0, Math.min(k, 4 - k, 1)));
  };
  return rgbToHex([channel(5), channel(3), channel(1)]);
}

/** Keeps the previous hue (and saturation) where the colour has none, so grey and black do not throw the handles about. */
export function hexToHsv(hex: string, prev?: Hsv): Hsv {
  const [r, g, b] = hexToRgb(hex).map((x) => x / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = prev?.h ?? 0;
  if (d > 0) {
    h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  const s = max === 0 ? (prev?.s ?? 0) : d / max;
  return { h, s, v: max };
}

/** WCAG's relative luminance, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((x) => {
    const s = x / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
