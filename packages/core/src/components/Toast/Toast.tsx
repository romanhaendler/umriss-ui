import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../lib/cx";
import { durationFrom, prefersReducedMotion } from "../../lib/motion";
import { toastTargetFor, useTopmostModalDialog } from "../../lib/portalTarget";
import { roleFromTone } from "../../lib/roleFromTone";
import { motionOrigin } from "../Popover/position";
import { Spinner } from "../Spinner";
import styles from "./Toast.module.css";
import { useWording } from "../../lib/language";
import { CrossGlyph } from "../../lib/glyphs";
import { usePortalTarget, useToastConfig } from "../../lib/provider";
import type { ToastPosition } from "../../lib/provider";
import { useCardMeasure } from "./useCardMeasure";
import { keyboardFocus, useDeckOpen } from "./useDeckOpen";
import type { Place } from "./useDeckPlaces";
import { useDeckPlaces } from "./useDeckPlaces";
import { useRegionFocus } from "./useRegionFocus";
import { useCountdowns, useTimerStore } from "./useToastTimers";

/** How the message turns out; `loading` is a toast still at work. */
export type ToastTone = "neutral" | "success" | "warning" | "danger" | "loading";

/** Why a toast went: its time ran out, it was closed (or gave way to a newer
    one), or its action was taken. */
export type ToastCloseReason = "timeout" | "dismiss" | "action";

/** The one action a toast may carry, e.g. "Undo". */
export interface ToastAction {
  /** A verb for what it does - "Undo", "Show". */
  label: string;
  /** Runs, and the toast goes with the reason `action`. */
  onClick: () => void;
}

/** What a toast says and how - what `toast()` and `update()` from `useToast`
    take. */
export interface ToastOptions {
  /** What has happened – short, about one line (some 45 characters), in the
      perfect tense and not a request: "Invoice not sent". Why, and
      what to do next, belong in the description. A longer title wraps; it is
      never cut. */
  title: string;
  /** One more sentence where the title alone is too little. Nothing the
      reader MUST read: the toast goes away by itself. */
  description?: string;
  /** How the message turns out. The tone is never the only information – the
      glyph beside it and the text say the same thing once more. `loading`
      shows a spinner, has no close button and does not leave by itself: turn
      it into its outcome with `update`. */
  tone?: ToastTone;
  /** Display duration in ms; 0 = stays until closed by hand.
      @default the provider's `duration`, else `5000` */
  duration?: number;
  /** One action - "Undo". Never the only way to do what it offers: the toast
      leaves by itself, and not everybody reaches it in time. More than one
      action is a dialog. */
  action?: ToastAction;
  /** Called once when the toast goes, with the reason. */
  onClose?: (reason: ToastCloseReason) => void;
}

export interface ToastItem extends ToastOptions {
  id: number;
  /** Set while it leaves, with the place it stood at: the others close up
      over it. */
  leaving?: Place;
}

interface ToastContextValue {
  /** Shows a toast and returns its id. */
  toast: (options: ToastOptions) => number;
  /** Changes a standing toast. A new tone or a new `duration` starts its time
      afresh - so a `loading` toast turned into `success` begins to count then.
      An id that no longer stands is ignored: a toast that gave way to newer
      ones - a `loading` one too - has said so through `onClose`. */
  update: (id: number, options: Partial<ToastOptions>) => void;
  /** Closes a toast, with the reason `dismiss`. */
  dismiss: (id: number) => void;
}

const ToastContext = /* @__PURE__ */ createContext<ToastContextValue | null>(null);

/** Access to `toast()`, `update()` and `dismiss()`; requires a ToastProvider. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast requires a <ToastProvider> around the application.");
  }
  return context;
}

function ToneGlyph({ tone }: { tone: ToastTone }) {
  if (tone === "loading") {
    /* A spinner is not a glyph (CONTEXT.md). Its own status role stays out of
       hearing: the title says what is at work. */
    return <Spinner size={16} aria-hidden="true" />;
  }
  return (
    /* The dots of ! and i are strokes of no length: a round cap alone is a dot
       as wide as the stem, and the glyph stays drawn with the stroke. */
    <svg viewBox="0 0 10 10" width="16" height="16" aria-hidden="true">
      {tone === "success" && (
        <path d="M2.2 5.3 4.2 7.3l3.6-4.1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {tone === "danger" && (
        <>
          <circle cx="5" cy="5" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 3v1.9M5 7v0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      {tone === "warning" && (
        <path d="M5 1.2 9.2 8.6H.8ZM5 4.1v1.4M5 7.1v0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {tone === "neutral" && (
        <>
          <circle cx="5" cy="5" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 3v0M5 5v2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/** Holds the toasts and draws them; `useToast` works only below it. Put it
    once at the root of the application. Duration, position and limit come from
    `UmrissProvider`'s `toast` where one stands around it. */
export function ToastProvider({ children }: { children: ReactNode }) {
  /* The defaults come from the root provider where there is one. The
     individual message beats it where it says a duration. */
  const config = useToastConfig();
  const defaultDuration = config.duration ?? 5000;
  const limit = Math.max(1, config.limit ?? 3);
  const position: ToastPosition = config.position ?? "bottom-end";
  const [edge, along] = position.split("-") as ["top" | "bottom", "start" | "center" | "end"];

  const [items, setItems] = useState<ToastItem[]>([]);
  /* The truth lives in the ref, so that the callbacks read the toasts as they
     stand now and call `onClose` outside a state updater (which StrictMode
     runs twice). The state is only its picture. */
  const itemsRef = useRef<ToastItem[]>([]);
  const commit = useCallback((next: ToastItem[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const nextId = useRef(1);
  const { timersRef, leavesRef, clearTimer } = useTimerStore();
  const regionRef = useRef<HTMLDivElement>(null);

  const { open, setHovered, setFocused, setPinned } = useDeckOpen(regionRef, items);
  const { heights, measureRef, forget } = useCardMeasure();
  const { lastPlaceRef, places, count, byRank, frontHeight, regionHeight } = useDeckPlaces(items, open, heights);
  const anyStanding = items.some((item) => !item.leaving);
  const { byKeys, setByKeys, returnFocusRef, leaveRegion } = useRegionFocus(regionRef, anyStanding);

  const remove = useCallback(
    (id: number) => {
      lastPlaceRef.current.delete(id);
      forget(id);
      const rest = itemsRef.current.filter((item) => item.id !== id);
      commit(rest);
      /* An empty deck has nothing to be open about - and a pointer over a
         region that shrank away sends no leave until it moves. */
      if (!rest.some((item) => !item.leaving)) {
        setHovered(false);
        setPinned(false);
      }
    },
    [commit, forget, lastPlaceRef, setHovered, setPinned],
  );

  /** Starts the leaving: first the choreography, then the teardown. */
  const beginLeave = useCallback(
    (id: number, reason: ToastCloseReason) => {
      const item = itemsRef.current.find((entry) => entry.id === id);
      if (!item || item.leaving) return;
      clearTimer(id);
      item.onClose?.(reason);
      /* A keyboard focus on the leaving card would fall to the body with it.
         It stays in the deck while another toast stands, and goes back where
         it came from otherwise. */
      const region = regionRef.current;
      const active = document.activeElement;
      if (region && active instanceof HTMLElement && region.querySelector(`[data-toast="${id}"]`)?.contains(active) && keyboardFocus(active, region)) {
        if (itemsRef.current.some((entry) => entry.id !== id && !entry.leaving)) region.focus();
        else leaveRegion();
      }
      /* Leaving runs through transitions, not animations, so it does not
         compete with the entrance animation. Its length is the token the
         stylesheet reads; without one there is nothing to wait for. */
      const duration = region === null ? 0 : durationFrom(getComputedStyle(region), "--u-duration-exit-collapse");
      if (prefersReducedMotion() || duration <= 0) {
        remove(id);
        return;
      }
      const place = lastPlaceRef.current.get(id) ?? { offset: 0, behind: false, scale: 1, hidden: false, zIndex: 0 };
      commit(itemsRef.current.map((entry) => (entry.id === id ? { ...entry, leaving: { ...place, zIndex: 0 } } : entry)));
      const teardown = setTimeout(() => {
        leavesRef.current.delete(teardown);
        remove(id);
      }, duration);
      leavesRef.current.add(teardown);
    },
    [clearTimer, commit, remove, leaveRegion, lastPlaceRef, leavesRef, regionRef],
  );

  const startTimer = useCountdowns({ timersRef, clearTimer, itemsRef, open, defaultDuration, beginLeave });

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++;
      commit([...itemsRef.current, { ...options, id }]);
      const standing = itemsRef.current.filter((item) => !item.leaving);
      /* Over the limit the oldest gives way - as if closed. A queue would
         bring old news late. */
      standing.slice(0, Math.max(0, standing.length - limit)).forEach((item) => beginLeave(item.id, "dismiss"));
      startTimer(id);
      return id;
    },
    [beginLeave, commit, limit, startTimer],
  );

  const update = useCallback(
    (id: number, options: Partial<ToastOptions>) => {
      const item = itemsRef.current.find((entry) => entry.id === id);
      if (!item || item.leaving) return;
      commit(itemsRef.current.map((entry) => (entry.id === id ? { ...entry, ...options, id } : entry)));
      const newTone = options.tone !== undefined && options.tone !== (item.tone ?? "neutral");
      if (newTone || options.duration !== undefined) startTimer(id);
    },
    [commit, startTimer],
  );

  const dismiss = useCallback((id: number) => beginLeave(id, "dismiss"), [beginLeave]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    setPinned(false);
    leaveRegion();
  };
  /* The deck opens for the keyboard's focus, not for the focus a click
     leaves on a button: a closed toast would otherwise hold it open. */
  const onFocus = (event: FocusEvent<HTMLDivElement>) => setFocused(keyboardFocus(event.target, event.currentTarget));
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    setByKeys(false);
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setFocused(false);
    setPinned(false);
    /* Left by other means than Escape: nothing to give back any more. */
    returnFocusRef.current = null;
  };
  /* A finger's touch ends in a pointerleave at once; it opens by the count. */
  const onPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") setHovered(true);
  };
  const onPointerLeave = () => setHovered(false);

  const value = useMemo(() => ({ toast, update, dismiss }), [toast, update, dismiss]);
  const wording = useWording();
  const portalTarget = usePortalTarget();
  /* Dialog, then the setting, then the body (`toastTargetFor`). It reads the
     DOM, so it runs in the effect; until then nothing is portalled. With
     every change of the toasts too, not only of the dialog: a configured
     target may enter the document later, and the next toast has to find it. */
  const dialog = useTopmostModalDialog();
  const [target, setTarget] = useState<Element | null>(null);
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTarget(toastTargetFor(dialog, portalTarget));
  }, [dialog, portalTarget, items]);

  const pinOpen = () => {
    setPinned(true);
    regionRef.current?.focus();
  };

  const message = (item: ToastItem) => {
    const tone = item.tone ?? "neutral";
    const showCount = byRank[0]?.id === item.id && !open && count > 1;
    const place = item.leaving ?? places.get(item.id);
    const cardStyle = {
      "--_y": `${edge === "bottom" ? -(place?.offset ?? 0) : (place?.offset ?? 0)}px`,
      "--_scale": place?.scale ?? 1,
      "--_front": place?.behind ? `${frontHeight}px` : undefined,
      zIndex: place?.zIndex ?? 0,
    } as CSSProperties;
    return (
      <div
        key={item.id}
        className={cx(
          styles.card,
          place?.behind && styles.behind,
          place?.hidden && styles.hidden,
          item.leaving && styles.leaving,
        )}
        style={cardStyle}
      >
        <div className={cx(styles.toast, styles[tone])}>
          <div ref={measureRef} data-toast={item.id} className={styles.content}>
            <div className={styles.text}>
              <p className={styles.title}>
                <span className={styles.glyph}>
                  <ToneGlyph tone={tone} />
                </span>
                {item.title}
              </p>
              {item.description && <p className={styles.description}>{item.description}</p>}
              {item.action && (
                <button
                  type="button"
                  className={styles.action}
                  onClick={() => {
                    item.action?.onClick();
                    beginLeave(item.id, "action");
                  }}
                >
                  {item.action.label}
                </button>
              )}
            </div>
            {(showCount || tone !== "loading") && (
              <div className={styles.tools}>
                {showCount && (
                  /* Out of the tab order: a focus on it would open the deck and
                     take the count away under the focus - which is also why a press
                     does not focus it. The keyboard opens the deck by entering it,
                     or by Alt+T. */
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(event) => event.preventDefault()}
                    className={styles.count}
                    aria-label={wording.toastDeckCount(count)}
                    onClick={pinOpen}
                  >
                    1 / {count}
                  </button>
                )}
                {tone !== "loading" && (
                  <button
                    type="button"
                    className={styles.close}
                    aria-label={wording.closeToast}
                    onClick={() => beginLeave(item.id, "dismiss")}
                  >
                    <CrossGlyph size={10} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const regionStyle = {
    "--_origin": motionOrigin(edge === "bottom" ? "top" : "bottom", along),
    height: regionHeight,
  } as CSSProperties;

  return (
    <ToastContext value={value}>
      {children}
      {target && createPortal(
        /* Two live regions that stand before the first message arrives: a
           region that enters the document with its text is often not read out.
           The message goes into the region of its tone, by the same table as
           `Alert`. Both are `display: contents`; the cards lie absolutely in
           the outer region, ordered by arrival whatever their tone. */
        <div
          ref={regionRef}
          className={styles.region}
          data-edge={edge}
          data-along={along}
          data-keys={byKeys ? "" : undefined}
          style={regionStyle}
          {...(anyStanding ? { role: "region", "aria-label": wording.toastRegion, tabIndex: -1 } : {})}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
        >
          <div role="status" aria-live="polite" className={styles.live}>
            {items.filter((item) => roleFromTone[item.tone ?? "neutral"].role === "status").map(message)}
          </div>
          <div role="alert" className={styles.live}>
            {items.filter((item) => roleFromTone[item.tone ?? "neutral"].role === "alert").map(message)}
          </div>
        </div>,
        target,
      )}
    </ToastContext>
  );
}
