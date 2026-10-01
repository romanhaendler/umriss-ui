/* A field's width, in characters (control-sizes 02, ADR-0041).

   The stylesheet half stands in `#own-styles` (`.extent`): a field fills the
   width its place gives it, and where the place asks how wide it is - a
   toolbar, a row, anything that shrinks to fit - it answers with its natural
   width, `--_chars` characters of its own type plus its own chrome, and never
   with what it shows. This is the other half: the inline style that hands a
   count to that rule.

   `chars` given, the field is `fit-content` - its own natural width at that
   count, in any place, never wider than the place. A field's natural count of
   its own (a date picker's is the length of its format) moves the natural
   width without fixing the field. `extra` is what the field shows beside its
   value - a number's prefix and suffix - and is counted either way. */

import type { CSSProperties } from "react";

export interface ExtentOptions {
  /** The field's natural count when the caller names none; without it, the
      stylesheet's. */
  natural?: number;
  /** Characters the field shows beside its value, counted on top. */
  extra?: number;
}

const whole = (count: number) => Math.max(1, Math.round(count));

export function extentStyle(chars: number | undefined, { natural, extra }: ExtentOptions = {}): CSSProperties | undefined {
  const given = chars !== undefined && Number.isFinite(chars);
  const style: Record<string, string | number> = {};
  if (given) {
    style["--_chars"] = whole(chars);
    style.inlineSize = "fit-content";
  } else if (natural !== undefined && Number.isFinite(natural)) {
    style["--_chars"] = whole(natural);
  }
  if (extra !== undefined && extra > 0) style["--_extra"] = extra;
  return Object.keys(style).length > 0 ? (style as CSSProperties) : undefined;
}
