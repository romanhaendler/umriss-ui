import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from "react";
import { cx } from "../../lib/cx";
import { idPart } from "../../lib/idPart";
import styles from "./Tabs.module.css";

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
  idBase: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`${component} must be used inside <Tabs>.`);
  }
  return context;
}

/* ------------------------------------------------------------------ */
/* Tabs – controlled: value + onChange come from the application.      */
/* ------------------------------------------------------------------ */

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** The value of the visible tab. Controlled: `Tabs` remembers nothing,
      so that the tab can come out of an address. */
  value: string;
  /** Receives the value of the chosen tab. */
  onChange: (value: string) => void;
}

export function Tabs({ value, onChange, className, children, ...rest }: TabsProps) {
  const idBase = useId();

  return (
    <div className={className} {...rest}>
      <TabsContext.Provider value={{ value, onChange, idBase }}>{children}</TabsContext.Provider>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TabList – the arrow keys switch and activate                        */
/* ------------------------------------------------------------------ */

export function TabList({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
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
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
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
    <div ref={listRef} role="tablist" className={cx(styles.list, className)} onKeyDown={handleKeyDown} {...rest}>
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

export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The value this tab reports – and under which its panel stands. */
  value: string;
}

export function Tab({ value, className, children, ...rest }: TabProps) {
  const tabs = useTabs("Tab");
  const selected = tabs.value === value;

  return (
    <button
      type="button"
      role="tab"
      /* The value goes into the id masked: `aria-controls` and
         `aria-labelledby` split at whitespace, and a tab "first page" would
         otherwise point at two ids that do not exist. */
      id={`${tabs.idBase}-tab-${idPart(value)}`}
      aria-selected={selected}
      aria-controls={`${tabs.idBase}-panel-${idPart(value)}`}
      tabIndex={selected ? 0 : -1}
      className={cx(styles.tab, className)}
      onClick={() => tabs.onChange(value)}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* TabPanel                                                            */
/* ------------------------------------------------------------------ */

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** The value of the tab this panel belongs to. Only the matching panel
      stands in the document – a hidden panel would keep focus, scroll
      position and live regions that nobody sees. */
  value: string;
}

export function TabPanel({ value, className, children, ...rest }: TabPanelProps) {
  const tabs = useTabs("TabPanel");
  if (tabs.value !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${tabs.idBase}-panel-${idPart(value)}`}
      aria-labelledby={`${tabs.idBase}-tab-${idPart(value)}`}
      tabIndex={0}
      className={cx(styles.panel, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
