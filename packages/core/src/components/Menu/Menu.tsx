import { cloneElement, createContext, useContext, useEffect, useId, useRef, useState } from "react";
import type {
  ButtonHTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import { cx } from "../../lib/cx";
import { Popover } from "../Popover";
import styles from "./Menu.module.css";

interface MenuContextValue {
  close: () => void;
}

/* Internal: `ContextMenu` provides the same context and the same keyboard
   handling, so that its entries close it the way they close a menu. Neither
   leaves the package - `index.ts` names what does. */
export const MenuContext = createContext<MenuContextValue | null>(null);

/** Arrow keys, Home and End over the enabled entries; Tab closes. */
export function handleMenuKeyDown(
  event: ReactKeyboardEvent<HTMLElement>,
  panel: HTMLElement | null,
  close: () => void,
) {
  const items = Array.from(panel?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ?? []);
  if (items.length === 0) return;
  const index = items.findIndex((item) => item === document.activeElement);

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      items[(index + 1) % items.length]?.focus();
      break;
    case "ArrowUp":
      event.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
      break;
    case "Home":
      event.preventDefault();
      items[0]?.focus();
      break;
    case "End":
      event.preventDefault();
      items[items.length - 1]?.focus();
      break;
    case "Tab":
      close();
      break;
    default:
      break;
  }
}

/* ------------------------------------------------------------------ */
/* Menu – dropdown menu with a portal panel and keyboard handling.     */
/* ------------------------------------------------------------------ */

export interface MenuProps {
  /** Trigger, e.g. a <Button>; must accept refs. */
  trigger: ReactElement<Record<string, unknown>>;
  /** The entries – typically `MenuItem` and `MenuSeparator`. */
  children: ReactNode;
  /** Alignment of the panel relative to the trigger. */
  align?: "start" | "end";
}

export function Menu({ trigger, children, align = "start" }: MenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const closeMenu = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // On opening, on to the first selectable entry.
  useEffect(() => {
    if (!open) return;
    panelRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]:not([disabled])')
      ?.focus();
  }, [open]);

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) =>
    handleMenuKeyDown(event, panelRef.current, () => setOpen(false));

  const triggerProps = trigger.props;

  return (
    <>
      {cloneElement(trigger, {
        ref: triggerRef,
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? panelId : undefined,
        onClick: (event: ReactMouseEvent<HTMLElement>) => {
          (triggerProps.onClick as ((e: ReactMouseEvent<HTMLElement>) => void) | undefined)?.(event);
          setOpen(!open);
        },
      })}
      <Popover
        open={open}
        onOpenChange={setOpen}
        anchorRef={triggerRef}
        align={align}
        role="menu"
        id={panelId}
        className={styles.panel}
      >
        <div ref={panelRef} className={styles.content} onKeyDown={handlePanelKeyDown}>
          <MenuContext.Provider value={{ close: closeMenu }}>{children}</MenuContext.Provider>
        </div>
      </Popover>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* MenuItem                                                            */
/* ------------------------------------------------------------------ */

export interface MenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
  /** What the entry does. The menu closes afterwards by itself: a menu that
      stays open after something has happened hides the result. */
  onSelect?: () => void;
  /** "danger" for destructive actions. */
  tone?: "default" | "danger";
}

export function MenuItem({ onSelect, tone = "default", className, children, ...rest }: MenuItemProps) {
  const menu = useContext(MenuContext);

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      className={cx(styles.item, tone === "danger" && styles.danger, className)}
      onClick={() => {
        onSelect?.();
        menu?.close();
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Fine dividing line between groups of menu entries. */
export function MenuSeparator() {
  return <div role="separator" className={styles.separator} />;
}
