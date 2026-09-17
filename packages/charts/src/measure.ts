/* Text measurement for the layout measuring pass (R-3.3).
   A single hidden, reused span inside the chart root - no canvas measureText, so
   that measurement and the later HTML rendering use exactly the same font
   resolution. Results are cached; a change of theme or font clears the cache. */

export interface TextSize {
  readonly width: number;
  readonly height: number;
}

const EMPTY: TextSize = { width: 0, height: 0 };

export class TextMeasurer {
  private span: HTMLSpanElement | null = null;
  private readonly root: HTMLElement;
  private readonly cache = new Map<string, TextSize>();

  constructor(root: HTMLElement) {
    this.root = root;
  }

  private ensure(): HTMLSpanElement | null {
    if (this.span !== null) return this.span;
    if (typeof document === "undefined") return null;
    const span = document.createElement("span");
    span.className = "uc-measure";
    span.setAttribute("aria-hidden", "true");
    this.root.appendChild(span);
    this.span = span;
    return span;
  }

  /** Width and height of a text in the presentation of the given class. */
  measure(text: string, className: string): TextSize {
    const key = `${className}|${text}`;
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;
    const span = this.ensure();
    if (span === null) return EMPTY;
    span.className = `uc-measure ${className}`;
    span.textContent = text;
    const rect = span.getBoundingClientRect();
    const size: TextSize = { width: rect.width, height: rect.height };
    this.cache.set(key, size);
    return size;
  }

  clear(): void {
    this.cache.clear();
  }

  remove(): void {
    this.span?.remove();
    this.span = null;
    this.cache.clear();
  }
}
