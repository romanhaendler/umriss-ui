import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../lib/cx";
import { durationFrom, prefersReducedMotion } from "../../lib/motion";
import { roleFromTone } from "../../lib/roleFromTone";
import { motionOrigin } from "../Popover/position";
import styles from "./Toast.module.css";
import { useWording } from "../../lib/language";
import { CrossGlyph } from "../../lib/glyphs";
import { usePortalTarget, useToastConfig } from "../../lib/provider";

/* The region stands in the window's bottom right corner and the messages
   above it: each grows out of that corner - the motion origin of a panel
   above its anchor, aligned to the end. */
const REGION_STYLE = { "--_origin": motionOrigin("top", "end") } as CSSProperties;

export type ToastTone = "neutral" | "success" | "warning" | "danger";

export interface ToastOptions {
  /** What has happened – a sentence in the perfect tense, not a request. */
  title: string;
  /** One more sentence where the title alone is too little. Nothing the
      reader MUST read: the toast goes away by itself. */
  description?: string;
  /** How the message turns out. The tone is never the only information – the
      symbol beside it and the text say the same thing once more. */
  tone?: ToastTone;
  /** Display duration in ms; 0 = stays until closed by hand. Default: 5000. */
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
  leaving?: boolean;
}

interface TimerInfo {
  timeout: ReturnType<typeof setTimeout> | null;
  remaining: number;
  startedAt: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Access to `toast()` and `dismiss()`; requires a ToastProvider. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast requires a <ToastProvider> around the application.");
  }
  return context;
}

function ToneIcon({ tone }: { tone: ToastTone }) {
  return (
    <span className={cx(styles.icon, styles[tone])} aria-hidden="true">
      {/* The dots of ! and i are strokes of no length: a round cap alone is a
          dot as wide as the stem, and the glyph stays drawn with the stroke. */}
      <svg viewBox="0 0 10 10" width="12" height="12" aria-hidden="true">
        {tone === "success" && (
          <path d="M2.2 5.3 4.2 7.3l3.6-4.1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {tone === "danger" && (
          <path d="M3 3l4 4M7 3 3 7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        )}
        {tone === "warning" && (
          <path d="M5 2.3v3.3M5 7.7v0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        )}
        {tone === "neutral" && (
          <path d="M5 2.4v0M5 4.4v3.3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        )}
      </svg>
    </span>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  /* The default comes from the root provider where there is one; without it,
     it stays at the five seconds of before. The individual message beats
     both. */
  const defaultDuration = useToastConfig().duration ?? 5000;
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, TimerInfo>());
  const regionRef = useRef<HTMLDivElement>(null);

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
    timers.current.delete(id);
  }, []);

  /** Starts the leaving: first the choreography, then the teardown. */
  const beginLeave = useCallback(
    (id: number) => {
      const info = timers.current.get(id);
      if (info?.timeout) clearTimeout(info.timeout);
      /* Leaving through transitions (not animations), so that it does not
         compete with the entrance animation for the same properties. How long
         it takes is said by the token that the stylesheet reads as well - here
         210 stood beside 200ms in the stylesheet (library-audit 07). Without a
         duration there is nothing to wait for. */
      const region = regionRef.current;
      const duration = region === null ? 0 : durationFrom(getComputedStyle(region), "--u-duration-exit-collapse");
      if (prefersReducedMotion() || duration <= 0) {
        remove(id);
        return;
      }
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, leaving: true } : item)),
      );
      setTimeout(() => remove(id), duration);
    },
    [remove],
  );

  const schedule = useCallback(
    (id: number, ms: number) => {
      timers.current.set(id, {
        timeout: setTimeout(() => beginLeave(id), ms),
        remaining: ms,
        startedAt: Date.now(),
      });
    },
    [beginLeave],
  );

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++;
      setItems((current) => [...current, { id, ...options }]);
      const duration = options.duration ?? defaultDuration;
      if (duration > 0) {
        schedule(id, duration);
      }
      return id;
    },
    [schedule, defaultDuration],
  );

  /** As long as the mouse rests on the message, the countdown stands still. */
  const pause = useCallback((id: number) => {
    const info = timers.current.get(id);
    if (!info?.timeout) return;
    clearTimeout(info.timeout);
    info.timeout = null;
    info.remaining = Math.max(0, info.remaining - (Date.now() - info.startedAt));
  }, []);

  const resume = useCallback(
    (id: number) => {
      const info = timers.current.get(id);
      if (!info || info.timeout) return;
      if (info.remaining <= 0) {
        beginLeave(id);
        return;
      }
      schedule(id, info.remaining);
    },
    [beginLeave, schedule],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((info) => {
        if (info.timeout) clearTimeout(info.timeout);
      });
      map.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast, dismiss: beginLeave }), [toast, beginLeave]);
  const wording = useWording();
  const portalTarget = usePortalTarget();

  const message = (item: ToastItem) => {
    const tone = item.tone ?? "neutral";
    return (
      <div
        key={item.id}
        className={cx(styles.itemWrap, item.leaving && styles.itemWrapLeaving)}
        style={{ order: item.id }}
      >
        <div className={styles.itemInner}>
          <div
            className={styles.toast}
            onPointerEnter={() => pause(item.id)}
            onPointerLeave={() => resume(item.id)}
          >
            <ToneIcon tone={tone} />
            <div className={styles.text}>
              <p className={styles.title}>{item.title}</p>
              {item.description && <p className={styles.descriptionText}>{item.description}</p>}
            </div>
            <button
              type="button"
              className={styles.close}
              aria-label={wording.closeToast}
              onClick={() => beginLeave(item.id)}
            >
              <CrossGlyph size={10} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        /* Two live regions that stand before the first message arrives: a
           region that comes into the document with its text already in it is
           often not read out at all by a screen reader. The message goes into
           the region of its tone, following the same table as with `Alert`
           (library-audit 03 and its review). Both regions are
           `display: contents`, and `order` keeps on screen the order in which
           the messages arrived - whatever their tone. */
        <div ref={regionRef} className={styles.region} style={REGION_STYLE}>
          <div role="status" aria-live="polite" className={styles.live}>
            {items.filter((item) => roleFromTone[item.tone ?? "neutral"].role === "status").map(message)}
          </div>
          <div role="alert" className={styles.live}>
            {items.filter((item) => roleFromTone[item.tone ?? "neutral"].role === "alert").map(message)}
          </div>
        </div>,
        portalTarget() ?? document.body,
      )}
    </ToastContext.Provider>
  );
}
