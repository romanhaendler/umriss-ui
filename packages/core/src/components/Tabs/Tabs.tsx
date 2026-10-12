import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from "react";
import { cx } from "../../lib/cx";
import { idPart } from "../../lib/idPart";
import { mergeRefs } from "../../lib/mergeRefs";
import type { RefProp } from "../../lib/refProp";
import styles from "./Tabs.module.css";

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
  idBase: string;
}

const TabsContext = /* @__PURE__ */ createContext<TabsContextValue | null>(null);

function useTabs(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`${component} must be used inside <Tabs>.`);
  }
  return context;
}

/* ------------------------------------------------------------------ */
/* Tabs – controlled through value + onChange, or on their own from   */
/* defaultValue.                                                      */
/* ------------------------------------------------------------------ */

/** The props of `Tabs`. */
export interface TabsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    RefProp<HTMLDivElement> {
  /** The value of the visible tab. Controlled, `Tabs` remember nothing, so
      that the tab can come out of an address. */
  value?: string;
  /** Uncontrolled: the tab that stands first. Afterwards the choice belongs
      to the tabs - for a switch no address and no handler needs to know. */
  defaultValue?: string;
  /** Receives the value of the chosen tab. Controlled, the tab switches only
      once `value` follows; uncontrolled it is merely a message. */
  onChange?: (value: string) => void;
}

/** Tabs: a `TabList` of `Tab`s and one `TabPanel` per value. Controlled
    through `value` and `onChange`, or uncontrolled from `defaultValue`. */
export function Tabs({ ref, value, defaultValue, onChange, className, children, ...rest }: TabsProps) {
  const idBase = useId();
  const [ownValue, setOwnValue] = useState(defaultValue ?? "");
  const controlled = value !== undefined;
  const change = (next: string) => {
    if (!controlled) setOwnValue(next);
    onChange?.(next);
  };

  return (
    <div ref={ref} className={className} {...rest}>
      <TabsContext value={{ value: controlled ? value : ownValue, onChange: change, idBase }}>
        {children}
      </TabsContext>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TabList – the arrow keys switch and activate                        */
/* ------------------------------------------------------------------ */

/** The row of `Tab`s inside `Tabs`. The arrow keys, Home and End move
    between the tabs and choose them. */
export function TabList({
  ref,
  className,
  children,
  onKeyDown,
  ...rest
}: HTMLAttributes<HTMLDivElement> & RefProp<HTMLDivElement>) {
  const tabs = useTabs("TabList");
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const selectedTab = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!selectedTab) {
      setIndicator(null);
      return;
    }
    setIndicator({ left: selectedTab.offsetLeft, width: selectedTab.offsetWidth });
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, tabs.value]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    // The font arrives later than the first layout and changes the tabs' widths: measure again.
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
    );
    if (tabs.length === 0) return;
    const index = tabs.findIndex((tab) => tab === document.activeElement);
    event.preventDefault();

    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    tabs[next]?.focus();
    tabs[next]?.click();
  };

  return (
    <div
      ref={mergeRefs(listRef, ref)}
      className={cx(styles.list, className)}
      {...rest}
      role="tablist"
      onKeyDown={handleKeyDown}
    >
      {children}
      {indicator && (
        <span
          aria-hidden="true"
          className={styles.indicator}
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab                                                                 */
/* ------------------------------------------------------------------ */

/** The props of `Tab`. */
export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement>, RefProp<HTMLButtonElement> {
  /** The value this tab reports – and under which its panel stands. */
  value: string;
}

/** One tab of a `TabList`; choosing it shows the `TabPanel` of the same
    `value`. */
export function Tab({ ref, value, className, children, onClick, ...rest }: TabProps) {
  const tabs = useTabs("Tab");
  const selected = tabs.value === value;
  /* Uncontrolled without `defaultValue` no tab is chosen yet; then every tab
     is a tab stop, or the list could not be reached from the keyboard. */
  const noneChosen = tabs.value === "";

  return (
    <button
      ref={ref}
      type="button"
      className={cx(styles.tab, className)}
      {...rest}
      /* After `rest`: the role, the ids that tie tab and panel together and
         the roving tab stop are the tab's own. The value goes into the id
         masked: `aria-controls` and `aria-labelledby` split at whitespace. */
      role="tab"
      id={`${tabs.idBase}-tab-${idPart(value)}`}
      aria-selected={selected}
      aria-controls={`${tabs.idBase}-panel-${idPart(value)}`}
      tabIndex={selected || noneChosen ? 0 : -1}
      /* Composed, not overridden by `rest`: a caller's `onClick` would take
         the switching away from the tab. It runs first and can prevent it. */
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) tabs.onChange(value);
      }}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* TabPanel                                                            */
/* ------------------------------------------------------------------ */

/** The props of `TabPanel`. */
export interface TabPanelProps extends HTMLAttributes<HTMLDivElement>, RefProp<HTMLDivElement> {
  /** The value of the tab this panel belongs to. Only the matching panel
      stands in the document – a hidden panel would keep focus, scroll
      position and live regions that nobody sees. */
  value: string;
}

/** The content of one tab. Only the panel whose `value` is chosen stands in
    the document. */
export function TabPanel({ ref, value, className, children, ...rest }: TabPanelProps) {
  const tabs = useTabs("TabPanel");
  if (tabs.value !== value) return null;

  return (
    <div
      ref={ref}
      tabIndex={0}
      className={cx(styles.panel, className)}
      {...rest}
      role="tabpanel"
      id={`${tabs.idBase}-panel-${idPart(value)}`}
      aria-labelledby={`${tabs.idBase}-tab-${idPart(value)}`}
    >
      {children}
    </div>
  );
}
