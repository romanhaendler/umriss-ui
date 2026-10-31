import { cloneElement, createContext, useCallback, useContext, useId, useRef, useState } from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import { cx } from "../../lib/cx";
import { elementRef } from "../../lib/elementRef";
import { mergeRefs } from "../../lib/mergeRefs";
import type { RefProp } from "../../lib/refProp";
import { Popover } from "../Popover";
import styles from "./Menu.module.css";

interface MenuContextValue {
  close: () => void;
}

/* Internal: `ContextMenu` provides the same context and the same keyboard
   handling, so that its entries close it the way they close a menu. Neither
   leaves the package - `index.ts` names what does. */
export const MenuContext = /* @__PURE__ */ createContext<MenuContextValue | null>(null);

/** Arrow keys, Home and End over the enabled entries; Tab closes. `close`
    gives the focus back to where the menu came from, and the Tab then moves on
    from there; left in the panel, it would leave from the portal at the end
    of the page. */
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
      if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        typeahead(items, index, event.key);
      }
      break;
  }
}

/* The letters typed within half a second form one prefix (APG menu button). A
   single letter, typed again, moves on to the next entry that begins with it;
   more letters narrow the prefix from the focused entry. */
const TYPEAHEAD_PAUSE = 500;
let typed = { text: "", at: 0 };

function typeahead(items: readonly HTMLElement[], index: number, key: string) {
  const now = Date.now();
  const text = (now - typed.at > TYPEAHEAD_PAUSE ? "" : typed.text) + key.toLowerCase();
  typed = { text, at: now };
  const repeated = text.length > 1 && [...text].every((c) => c === text[0]);
  const prefix = repeated ? (text[0] as string) : text;
  const from = prefix.length === 1 ? index + 1 : Math.max(index, 0);
  for (let n = 0; n < items.length; n++) {
    const item = items[(from + n) % items.length] as HTMLElement;
    if (item.textContent?.trim().toLowerCase().startsWith(prefix)) {
      item.focus();
      return;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Menu – dropdown menu with a portal panel and keyboard handling.     */
/* ------------------------------------------------------------------ */

/** The props of `Menu`. */
export interface MenuProps {
  /** Trigger, e.g. a <Button>; must accept refs. Its own ref keeps its
      element: the menu holds the same one beside it. */
  trigger: ReactElement<{ ref?: Ref<HTMLElement>; "aria-expanded"?: boolean; "aria-describedby"?: string; "aria-label"?: string } & Record<string, unknown>>;
  /** The entries – typically `MenuItem` and `MenuSeparator`. */
  children: ReactNode;
  /** Alignment of the panel relative to the trigger. */
  align?: "start" | "end";
}

/** A dropdown menu: `trigger` opens a panel of `MenuItem`s below it. The arrow
    keys, Home and End move between the entries; Escape and an outside click
    close it. */
export function Menu({ trigger, children, align = "start" }: MenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();
  // ArrowUp on the trigger opens the menu at its last entry, ArrowDown and a click at its first.
  const [enterAtLast, setEnterAtLast] = useState(false);

  const closeMenu = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  /* On opening, focus goes to the first selectable entry (the last, after ArrowUp) as soon as the panel
     stands, as in `ContextMenu`. An effect on `open` runs before the popover
     has found its portal target. */
  const attachPanel = useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node;
    const items = node?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ?? [];
    (enterAtLast ? items[items.length - 1] : items[0])?.focus();
  }, [enterAtLast]);

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) =>
    handleMenuKeyDown(event, panelRef.current, closeMenu);

  const triggerProps = trigger.props;

  return (
    <>
      {cloneElement(trigger, {
        /* The trigger keeps its own ref beside the menu's. The rule takes a
           ref handed on as one read during render; nothing reads `.current`. */
        // eslint-disable-next-line react-hooks/refs
        ref: mergeRefs(triggerRef, elementRef<HTMLElement>(trigger)),
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? panelId : undefined,
        onClick: (event: ReactMouseEvent<HTMLElement>) => {
          (triggerProps.onClick as ((e: ReactMouseEvent<HTMLElement>) => void) | undefined)?.(event);
          setEnterAtLast(false);
          setOpen(!open);
        },
        onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
          (triggerProps.onKeyDown as ((e: ReactKeyboardEvent<HTMLElement>) => void) | undefined)?.(event);
          if (event.defaultPrevented || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return;
          event.preventDefault();
          setEnterAtLast(event.key === "ArrowUp");
          setOpen(true);
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
        <div ref={attachPanel} className={styles.content} onKeyDown={handlePanelKeyDown}>
          <MenuContext value={{ close: closeMenu }}>{children}</MenuContext>
        </div>
      </Popover>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* MenuItem                                                            */
/* ------------------------------------------------------------------ */

/** The props of `MenuItem`: a button's attributes, with `onSelect` for what
    the entry does. */
export interface MenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect">, RefProp<HTMLButtonElement> {
  /** What the entry does. The menu closes afterwards by itself: a menu that
      stays open after something has happened hides the result. */
  onSelect?: () => void;
  /** "danger" for destructive actions. */
  tone?: "default" | "danger";
}

/** An entry of a `Menu` or a `ContextMenu`. It runs `onSelect` and closes the
    menu. */
export function MenuItem({ ref, onSelect, tone = "default", className, children, onClick, ...rest }: MenuItemProps) {
  const menu = useContext(MenuContext);

  return (
    <button
      ref={ref}
      type="button"
      tabIndex={-1}
      className={cx(styles.item, tone === "danger" && styles.danger, className)}
      {...rest}
      role="menuitem"
      /* Composed, not overridden by `rest`: a caller's `onClick` would take
         the closing away from the entry. It runs first and can prevent it. */
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        onSelect?.();
        menu?.close();
      }}
    >
      {children}
    </button>
  );
}

/** Fine dividing line between groups of menu entries. */
export function MenuSeparator({ ref, className, ...rest }: HTMLAttributes<HTMLDivElement> & RefProp<HTMLDivElement>) {
  return <div ref={ref} className={cx(styles.separator, className)} {...rest} role="separator" />;
}
