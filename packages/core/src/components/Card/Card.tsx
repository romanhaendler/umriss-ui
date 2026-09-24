import { createContext, forwardRef, useContext, useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import styles from "./Card.module.css";
import { useWording } from "../../lib/language";

interface CardContextValue {
  collapsible: boolean;
  collapsed: boolean;
  toggle: () => void;
  bodyId: string;
}

const CardContext = createContext<CardContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Allows collapsing and expanding the body through the header. */
  collapsible?: boolean;
  /** Initial state of the collapse mechanism; afterwards it belongs to the
      card. Only effective together with `collapsible`. */
  defaultCollapsed?: boolean;
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { collapsible = false, defaultCollapsed = false, className, children, ...rest },
  ref,
) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const bodyId = useId();

  return (
    <section ref={ref} className={cx(styles.card, className)} {...rest}>
      <CardContext.Provider
        value={{ collapsible, collapsed, toggle: () => setCollapsed((value) => !value), bodyId }}
      >
        {children}
      </CardContext.Provider>
    </section>
  );
});

/* ------------------------------------------------------------------ */
/* CardHeader                                                          */
/* ------------------------------------------------------------------ */

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** The heading of the card. A node and not merely text, so that an
      identifier with markup can stand in it too. */
  title: ReactNode;
  /** Small all-caps label above the title, e.g. a category. */
  eyebrow?: ReactNode;
  /** Right-aligned area, e.g. buttons or badges. */
  actions?: ReactNode;
  /**
   * A dividing line below the head. Only set it where the body needs it -
   * typically with flush data (flush tables, logs). With normal content the
   * white space carries the hierarchy on its own.
   */
  divider?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { title, eyebrow, actions, divider = false, className, ...rest },
  ref,
) {
  const card = useContext(CardContext);
  const wording = useWording();

  return (
    <div ref={ref} className={cx(styles.header, divider && styles.divider, className)} {...rest}>
      <div className={styles.headerText}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.headerRight}>
        {actions}
        {card?.collapsible && (
          <button
            type="button"
            className={styles.collapseButton}
            onClick={card.toggle}
            aria-expanded={!card.collapsed}
            aria-controls={card.bodyId}
          >
            {card.collapsed ? wording.show : wording.hide}
          </button>
        )}
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* CardBody                                                          */
/* ------------------------------------------------------------------ */

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Removes the inner padding, e.g. for flush tables. */
  flush?: boolean;
}

/* Collapsible, the body stands inside the two wrappers of the fold; the ref
   goes with the class to the body itself, the element a caller dresses. */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(function CardBody(
  { flush = false, className, children, ...rest },
  ref,
) {
  const card = useContext(CardContext);

  const body = (
    <div
      ref={ref}
      id={card?.bodyId}
      className={cx(styles.body, flush && styles.flush, className)}
      {...rest}
    >
      {children}
    </div>
  );

  if (!card?.collapsible) {
    return body;
  }

  // The height is animated through the 0fr/1fr grid trick; collapsed content
  // stays in the DOM but is inert (no focus, no interaction).
  return (
    <div className={cx(styles.collapse, card.collapsed && styles.collapsed)}>
      <div className={styles.collapseInner} inert={card.collapsed || undefined}>
        {body}
      </div>
    </div>
  );
});
