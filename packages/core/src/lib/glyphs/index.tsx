/* A set of glyphs - and one that sets a standard.

   ============================ The specification ============================

   A glyph of this library is:

   1. **Nominal size 10.** The `viewBox` is `0 0 10 10`, so that paths can
      be compared and carried between glyphs. A glyph flatter or narrower than
      a square crops one side (`0 0 10 6`); the longer side stays 10.
   2. **Stroke width 1.4** at nominal size.
   3. **`currentColor`.** A glyph takes the text colour of its place and never
      carries one of its own.
   4. **No fill.** `fill="none"`; it is drawn with the stroke.
   5. **Round ends.** `strokeLinecap="round"`, and where segments meet
      `strokeLinejoin="round"` as well.
   6. **`aria-hidden`.** A glyph is decoration. What it means is said by the
      accessible name of the control it sits in.

   ===========================================================================

   The specification is held by a check, not by this comment: the glyph test
   of each package (`tests-unit/glyphs.test.ts`, rules in `scripts/glyphs.ts`)
   reads every component source and holds every inline `<svg>` to it. The
   width is relative to the nominal size - 1.4 per 10 units - so a glyph shown
   at 13 pixels has the weight of one shown at 9. What more than one component
   draws stands here, once. */

import type { SVGProps } from "react";
import type { RefProp } from "../refProp";

/** The props of a glyph: an SVG's attributes and its edge length. */
export interface GlyphProps extends Omit<SVGProps<SVGSVGElement>, "viewBox" | "children">, RefProp<SVGSVGElement> {
  /**
   * Edge length in pixels. The default is the size the glyph is drawn at in
   * the components.
   */
  size?: number;
}

/** The cross that clears a field, removes a tag or a chip, and closes a
    dialog, a toast or an alert - one drawing at the size of its place. */
export function CrossGlyph({ ref, size = 9, ...rest }: GlyphProps) {
  return (
    <svg ref={ref} viewBox="0 0 10 10" width={size} height={size} aria-hidden="true" {...rest}>
      <path
        d="M1.6 1.6l6.8 6.8M8.4 1.6L1.6 8.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The "more" of a menu trigger: three dots. Each is a zero-length stroke, which
    a round cap draws as a dot. */
export function MoreGlyph({ ref, size = 12, ...rest }: GlyphProps) {
  return (
    <svg ref={ref} viewBox="0 0 10 10" width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M2 5h0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 5h0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 5h0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** The plus of `NumberInput`'s step buttons. */
export function PlusGlyph({ ref, size = 10, ...rest }: GlyphProps) {
  return (
    <svg ref={ref} viewBox="0 0 10 10" width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M5 2v6M2 5h6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** The minus of `NumberInput`'s step buttons. */
export function MinusGlyph({ ref, size = 10, ...rest }: GlyphProps) {
  return (
    <svg ref={ref} viewBox="0 0 10 10" width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M2 5h6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* The component tips the chevron by 90 degrees when the branch is open, so
   that the motion has the same spring as everywhere else.

   The table's row expander, the schedule's and the calculation's fold
   controls draw the same chevron, and take it from here. */

/** The chevron that expands and collapses a branch. Drawn pointing right;
    rotate it by 90 degrees for an open branch. */
export function AngleGlyph({ ref, size = 10, ...rest }: GlyphProps) {
  return (
    <svg ref={ref} viewBox="0 0 10 10" width={size} height={size} aria-hidden="true" {...rest}>
      <path
        d="M3.5 1.5 7 5l-3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The chevron against a bar: the last step of a sequence. Drawn pointing
    right; turn it by 180 degrees for the first. */
export function EndGlyph({ ref, size = 10, ...rest }: GlyphProps) {
  return (
    <svg ref={ref} viewBox="0 0 10 10" width={size} height={size} aria-hidden="true" {...rest}>
      <path
        d="M1.5 1.5 5 5 1.5 8.5M8.5 1.5v7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The grip a drag is taken by: two grooves. Dots are fill, and point 4 of
    the specification draws with the stroke. */
export function GripGlyph({ ref, size = 10, ...rest }: GlyphProps) {
  return (
    <svg ref={ref} viewBox="0 0 10 10" width={size} height={size} aria-hidden="true" {...rest}>
      <path
        d="M3.5 3v4M6.5 3v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The grid laid over an area. Two by two lines; the frame is missing on
    purpose, otherwise it would be a window. */
export function GridGlyph({ ref, size = 10, ...rest }: GlyphProps) {
  return (
    <svg ref={ref} viewBox="0 0 10 10" width={size} height={size} aria-hidden="true" {...rest}>
      <path
        d="M3.7 1.5v7M6.3 1.5v7M1.5 3.7h7M1.5 6.3h7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Measuring: a line with two end marks. Not a ruler with a scale: the teeth
    would be a grey stripe at ten nominal units. */
export function MeasureGlyph({ ref, size = 10, ...rest }: GlyphProps) {
  return (
    <svg ref={ref} viewBox="0 0 10 10" width={size} height={size} aria-hidden="true" {...rest}>
      <path
        d="M2 8L8 2M1 6.5v2.5h2.5M9 3.5V1H6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* The date pickers' two characters, set at 12 pixels. */

/** A calendar leaf: a sheet with its header and two rings. With `range`, a
    bar across the sheet stands for the span a range picker chooses. */
export function CalendarGlyph({ ref, size = 12, range = false, ...rest }: GlyphProps & { range?: boolean }) {
  return (
    <svg ref={ref} viewBox="0 0 10 10" width={size} height={size} aria-hidden="true" {...rest}>
      <rect x="1" y="1.6" width="8" height="7.7" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path
        d={range ? "M1 4.4h8M3.2.7v1.9M6.8.7v1.9M3.8 6.9h2.4" : "M1 4.4h8M3.2.7v1.9M6.8.7v1.9"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A clock face at a quarter past - the time pickers' character. */
export function ClockGlyph({ ref, size = 12, ...rest }: GlyphProps) {
  return (
    <svg ref={ref} viewBox="0 0 10 10" width={size} height={size} aria-hidden="true" {...rest}>
      <circle cx="5" cy="5" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5 2.9v2.3l1.6 1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
