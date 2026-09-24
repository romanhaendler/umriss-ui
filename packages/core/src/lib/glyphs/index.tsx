/* A set of glyphs - and one that sets a standard.

   ============================ The specification ============================

   A glyph of this library is:

   1. **Nominal size 10.** The `viewBox` is `0 0 10 10`, so that paths can
      be compared and carried between glyphs. A glyph flatter or narrower than
      a square crops one side (`0 0 10 6`); the longer side stays 10.
   2. **Stroke width 1.4** at nominal size. Not 1.5, not 1.6: the width chosen
      is the one that occurs most often in the existing set.
   3. **`currentColor`.** A glyph takes the text colour of its place and never
      carries one of its own.
   4. **No fill.** `fill="none"`; it is drawn with the stroke.
   5. **Round ends.** `strokeLinecap="round"`, and where segments meet
      `strokeLinejoin="round"` as well.
   6. **`aria-hidden`.** A glyph is decoration. What it means is said by the
      accessible name of the control it sits in.

   ===========================================================================

   Why this is written down: until now there was no stroke width and no optical
   size a new glyph could have held to - only whatever the nearest component
   happened to do. The same cross shape stood in the code six times at width
   1.4, once at 1.5 and once at 1.6.

   The specification is held by a check, not by this comment: the glyph test
   of each package (`tests-unit/glyphs.test.ts`, rules in `scripts/glyphs.ts`)
   reads every component source and holds every inline `<svg>` to it. The
   width is relative to the nominal size - 1.4 per 10 units - so a glyph shown
   at 13 pixels has the weight of one shown at 9. A glyph that needs less room
   in one direction crops the box (`0 0 10 6`) rather than shrinking the unit.
   What more than one component draws stands here, once. */

import type { SVGProps } from "react";
import { forwardRef } from "react";

export interface GlyphProps extends Omit<SVGProps<SVGSVGElement>, "viewBox" | "children"> {
  /**
   * Edge length in pixels. The default is the size the glyph is already drawn
   * at today - whoever changes it changes the picture.
   */
  size?: number;
}

/** The cross that clears a field, removes a tag or a chip, and closes a
    dialog, a toast or an alert - one drawing at the size of its place. */
export const CrossGlyph = forwardRef<SVGSVGElement, GlyphProps>(function CrossGlyph(
  { size = 9, ...rest },
  ref,
) {
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
});

/* Plus and minus of the stepper buttons - together with the cross, the glyphs
   the specification was read off. */

export const PlusGlyph = forwardRef<SVGSVGElement, GlyphProps>(function PlusGlyph(
  { size = 10, ...rest },
  ref,
) {
  return (
    <svg ref={ref} viewBox="0 0 10 10" width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M5 2v6M2 5h6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
});

export const MinusGlyph = forwardRef<SVGSVGElement, GlyphProps>(function MinusGlyph(
  { size = 10, ...rest },
  ref,
) {
  return (
    <svg ref={ref} viewBox="0 0 10 10" width={size} height={size} aria-hidden="true" {...rest}>
      <path d="M2 5h6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
});

/* The chevron that expands and collapses a branch. It is not drawn rotated
   but set rotated: the component tips it by 90 degrees when the branch is
   open, so that the motion has the same spring as everywhere else.

   The table's row expander, the schedule's and the calculation's fold
   controls draw the same chevron, and take it from here. */

export const AngleGlyph = forwardRef<SVGSVGElement, GlyphProps>(function AngleGlyph(
  { size = 10, ...rest },
  ref,
) {
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
});

/* Three glyphs for the dock (floating-dock 06). They do not come from the
   existing set but are drawn to the specification - that is the way packages/core/docs/glyphs.md
   prescribes for a new glyph: take it from the set, and where the set does not
   have it, draw it to the specification and put it in. */

/** The grip a dock is moved by: two grooves, the hand needs no more. Dotted
    would be the obvious form and is wrong here - dots are fill, and point 4 of
    the specification draws with the stroke.

    The grooves stand the same way in both orientations of the dock. Turning
    them with it would be prettier and would need a `rotate()` in a component
    whose acceptance (ADR-0014, ticket 04) rules exactly that out - a glyph
    that has to be rotated to be right is one that would be rotated along at
    the change. */
export const GripGlyph = forwardRef<SVGSVGElement, GlyphProps>(function GripGlyph(
  { size = 10, ...rest },
  ref,
) {
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
});

/** The grid laid over an area. Two by two lines; the frame is missing on
    purpose, otherwise it would be a window. */
export const GridGlyph = forwardRef<SVGSVGElement, GlyphProps>(function GridGlyph(
  { size = 10, ...rest },
  ref,
) {
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
});

/** Measuring: a line with two end marks. Not a ruler with a scale - the teeth
    would be a grey stripe at ten nominal units. */
export const MeasureGlyph = forwardRef<SVGSVGElement, GlyphProps>(function MeasureGlyph(
  { size = 10, ...rest },
  ref,
) {
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
});

/* The date pickers' two characters. Each stood twice, once per picker, at
   nominal size 14 and width 1.3; they are drawn at 10 now, and set at 12
   pixels - at 13 the relative stroke read heavier than the field's text. */

/** A calendar leaf: a sheet with its header and two rings. With `range`, a
    bar across the sheet stands for the span a range picker chooses. */
export const CalendarGlyph = forwardRef<SVGSVGElement, GlyphProps & { range?: boolean }>(function CalendarGlyph(
  { size = 12, range = false, ...rest },
  ref,
) {
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
});

/** A clock face at a quarter past - the time pickers' character. */
export const ClockGlyph = forwardRef<SVGSVGElement, GlyphProps>(function ClockGlyph(
  { size = 12, ...rest },
  ref,
) {
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
});
