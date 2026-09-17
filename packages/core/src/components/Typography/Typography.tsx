/* Text, heading, link.

   The design concept rests on typographic rigour - and that was so far only
   present as a global base and as a private rule inside components, not as
   something an application can reach for. So every application reinvented
   its hierarchy, and the system frayed out where the library stops.

   These three are deliberately narrow: they release the token set and
   nothing else. No truncating, no permanent underlining - that would be
   behaviour, and behaviour belongs to the application. A generous version
   that takes on every size and every weight would be worse than none - it
   would legitimise precisely the fraying it is there against.

   `Heading` separates level and size: a visually small heading can still be
   the second level of the page. Whoever couples the two chooses, sooner or
   later, the wrong level in order to get the right size. */

import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ElementType, HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import styles from "./Typography.module.css";

export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type TextWeight = "regular" | "medium" | "semibold";
export type TextTone = "default" | "secondary" | "muted";
export type TextTracking = "normal" | "tight" | "display" | "caps";
export type TextLeading = "normal" | "tight";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Element to render as. Default `p`. */
  as?: ElementType;
  /** Type size from the token set. It is independent of the element: a `p`
      may be small without becoming a different element. */
  size?: TextSize;
  /** Font weight from the token set. */
  weight?: TextWeight;
  /** How loud the text is. `secondary` and `muted` step back without
      falling below the contrast threshold. */
  tone?: TextTone;
  /** Geist Mono with tabular figures – for numbers and identifiers. */
  mono?: boolean;
  /** Letter spacing from the token set. `caps` belongs with letterspaced
      capitals. */
  tracking?: TextTracking;
  /** Line spacing. `tight` for multi-line headings and key figures, where
      the normal spacing lets the lines fall apart. */
  leading?: TextLeading;
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as: Element = "p",
    size = "md",
    weight = "regular",
    tone = "default",
    mono = false,
    tracking = "normal",
    leading = "normal",
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <Element
      ref={ref}
      className={cx(
        styles.text,
        styles[`size-${size}`],
        styles[`weight-${weight}`],
        styles[`tone-${tone}`],
        mono && styles.mono,
        styles[`tracking-${tracking}`],
        styles[`leading-${leading}`],
        className,
      )}
      {...rest}
    >
      {children}
    </Element>
  );
});

/* ------------------------------------------------------------------ */
/* Heading – level and size are independent                            */
/* ------------------------------------------------------------------ */

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** The page's outline level (h1–h6). Default 2. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Optical size; independent of the level. Default matching the level. */
  size?: TextSize;
  /** Font weight from the token set. Default `semibold`. */
  weight?: TextWeight;
  /** How loud the heading is. */
  tone?: TextTone;
}

/* Default size per level - a default, not a constraint. */
const sizeForLevel: Record<1 | 2 | 3 | 4 | 5 | 6, TextSize> = {
  1: "2xl",
  2: "xl",
  3: "lg",
  4: "md",
  5: "sm",
  6: "xs",
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level = 2, size, weight = "semibold", tone = "default", className, children, ...rest },
  ref,
) {
  const Element = `h${level}` as "h1";
  const effectiveSize = size ?? sizeForLevel[level];

  return (
    <Element
      ref={ref}
      className={cx(
        styles.heading,
        styles[`size-${effectiveSize}`],
        styles[`weight-${weight}`],
        styles[`tone-${tone}`],
        // Large titles run slightly compressed, medium ones less so.
        (effectiveSize === "2xl" || effectiveSize === "xl") && styles.trackingDisplay,
        effectiveSize === "lg" && styles.trackingTight,
        className,
      )}
      {...rest}
    >
      {children}
    </Element>
  );
});

/* ------------------------------------------------------------------ */
/* Link                                                                */
/* ------------------------------------------------------------------ */

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Size from the token set – a link has to match its body text. */
  size?: TextSize;
  /** Opens in a new tab and sets the necessary protective attributes. */
  external?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { size = "md", external = false, className, children, ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      className={cx(styles.link, styles[`size-${size}`], className)}
      /* `noreferrer` belongs with it: without it the opened page can reach
         this one through `window.opener`. */
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
});
