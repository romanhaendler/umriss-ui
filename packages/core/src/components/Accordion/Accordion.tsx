import { createContext, forwardRef, useContext, useId, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { AngleGlyph } from "../../lib/glyphs";
import styles from "./Accordion.module.css";

interface AccordionContextValue {
  open: readonly string[];
  toggle: (value: string) => void;
  headingLevel: 2 | 3 | 4 | 5 | 6;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Accordion                                                           */
/* ------------------------------------------------------------------ */

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** `single` keeps at most one section open, `multiple` any number.
      Default: `single` */
  type?: "single" | "multiple";
  /** Controlled: the values of the open sections. A list for both types, so
      that switching the type changes nothing else. */
  value?: readonly string[];
  /** Uncontrolled: the sections open at the start. */
  defaultValue?: readonly string[];
  /** Reports the open sections after a header's click. Controlled, the
      accordion follows once `value` does; uncontrolled it is a message. */
  onChange?: (value: string[]) => void;
  /** The level of the heading each header stands in - the one that fits the
      page's outline. Default: 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

/* Sections behind headers - the APG accordion: each header is a button
   inside a heading, says with `aria-expanded` whether its section stands open,
   and the arrow keys move between the headers. It is `Card`'s collapse made
   into a list, with the same animated height, and it leaves the card's own
   collapse as it is: one surface that folds is a card, several sections that
   fold against each other are this. */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { type = "single", value: valueProp, defaultValue = [], onChange, headingLevel = 3, className, onKeyDown, children, ...rest },
  ref,
) {
  const [own, setOwn] = useState<readonly string[]>(defaultValue);
  const controlled = valueProp !== undefined;
  const open = controlled ? valueProp : own;

  const toggle = (item: string) => {
    const isOpen = open.includes(item);
    const next = isOpen ? open.filter((v) => v !== item) : type === "single" ? [item] : [...open, item];
    if (!controlled) setOwn(next);
    onChange?.(next);
  };

  /* Only a header's key moves the focus: a field inside an open panel keeps
     its arrows. The headers are asked of this accordion and not of a nested
     one inside a panel. */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const root = event.currentTarget;
    const target = event.target as HTMLElement;
    if (!target.matches("[data-accordion-header]") || target.closest("[data-accordion]") !== root) return;
    const headers = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-accordion-header]:not(:disabled)")).filter(
      (h) => h.closest("[data-accordion]") === root,
    );
    const index = headers.indexOf(target as HTMLButtonElement);
    const next = {
      ArrowDown: headers[(index + 1) % headers.length],
      ArrowUp: headers[(index - 1 + headers.length) % headers.length],
      Home: headers[0],
      End: headers[headers.length - 1],
    }[event.key];
    if (!next) return;
    event.preventDefault();
    next.focus();
  };

  return (
    <div ref={ref} className={cx(styles.accordion, className)} {...rest} data-accordion="" onKeyDown={handleKeyDown}>
      <AccordionContext.Provider value={{ open, toggle, headingLevel }}>{children}</AccordionContext.Provider>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* AccordionItem                                                       */
/* ------------------------------------------------------------------ */

export interface AccordionItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** What names the section in the accordion's `value`. */
  value: string;
  /** The header's text. It names the section's region too. */
  title: ReactNode;
  /** A section that cannot be opened now; its header stays in the list. */
  disabled?: boolean;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, title, disabled = false, className, children, ...rest },
  ref,
) {
  const accordion = useContext(AccordionContext);
  const id = useId();
  const headerId = `${id}-header`;
  const panelId = `${id}-panel`;
  const isOpen = accordion?.open.includes(value) ?? false;
  const Heading = `h${accordion?.headingLevel ?? 3}` as const;

  return (
    <div ref={ref} className={cx(styles.item, className)} {...rest}>
      <Heading className={styles.heading}>
        <button
          type="button"
          id={headerId}
          className={styles.header}
          aria-expanded={isOpen}
          aria-controls={panelId}
          disabled={disabled}
          data-accordion-header=""
          onClick={() => accordion?.toggle(value)}
        >
          <span className={styles.title}>{title}</span>
          <AngleGlyph className={cx(styles.chevron, isOpen && styles.chevronOpen)} />
        </button>
      </Heading>
      {/* The height animates through the 0fr/1fr grid, as the card's
          collapse does; a folded panel stays in the DOM, inert. */}
      <div className={cx(styles.collapse, !isOpen && styles.collapsed)}>
        <div className={styles.collapseInner} inert={!isOpen || undefined}>
          <div id={panelId} role="region" aria-labelledby={headerId} className={styles.panel}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
});
