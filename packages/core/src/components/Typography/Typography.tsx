/* Text, heading, link.

   These three are deliberately narrow: they release the token set and
   nothing else. No truncating, no permanent underlining - that is behaviour,
   and behaviour belongs to the application.

   `Heading` separates level and size: a visually small heading can still be
   the second level of the page. */

import type { AnchorHTMLAttributes, ElementType, HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import type { RefProp } from "../../lib/refProp";
import styles from "./Typography.module.css";

/** A type size of the token set. */
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
/** A font weight of the token set. */
export type TextWeight = "regular" | "medium" | "semibold";
/** How loud a text is; `secondary` and `muted` step back without falling below
    the contrast threshold. */
export type TextTone = "default" | "secondary" | "muted";
/** The letter spacing of the token set. */
export type TextTracking = "normal" | "tight" | "display" | "caps";
/** The line height of the token set. */
export type TextLeading = "normal" | "tight";

/** The props of `Text`. */
export interface TextProps extends HTMLAttributes<HTMLElement>, RefProp<HTMLElement> {
  /** Element to render as. */
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

/** Body text from the token set; `as` chooses the element, independent of the
    size. */
export function Text({
  ref,
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
}: TextProps) {
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
}

/* ------------------------------------------------------------------ */
/* Heading – level and size are independent                            */
/* ------------------------------------------------------------------ */

/** The props of `Heading`. */
export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement>, RefProp<HTMLHeadingElement> {
  /** The page's outline level (h1–h6). */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Optical size; independent of the level.
      @default the size matching the level */
  size?: TextSize;
  /** Font weight from the token set. */
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

/** A heading whose level and size are independent: a small heading can still
    be the second level of the page. */
export function Heading({
  ref,
  level = 2,
  size,
  weight = "semibold",
  tone = "default",
  className,
  children,
  ...rest
}: HeadingProps) {
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
}

/* ------------------------------------------------------------------ */
/* Link                                                                */
/* ------------------------------------------------------------------ */

/** The props of `Link`. */
export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, RefProp<HTMLAnchorElement> {
  /** Size from the token set – a link has to match its body text. */
  size?: TextSize;
  /** Opens in a new tab and sets the necessary protective attributes. */
  external?: boolean;
}

/** A link in the size of its text; `external` opens it in a new tab with the
    protective attributes set. */
export function Link({ ref, size = "md", external = false, className, children, ...rest }: LinkProps) {
  return (
    <a
      ref={ref}
      className={cx(styles.link, styles[`size-${size}`], className)}
      // `noreferrer` keeps the opened page from reaching this one through `window.opener`.
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
