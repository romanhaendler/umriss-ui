import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../lib/cx";
import { durationFrom, prefersReducedMotion } from "../../lib/motion";
import { roleFromTone } from "../../lib/roleFromTone";
import { motionOrigin } from "../Popover/position";
import { Spinner } from "../Spinner";
import styles from "./Toast.module.css";
import { useWording } from "../../lib/language";
import { CrossGlyph } from "../../lib/glyphs";
import { usePortalTarget, useToastConfig } from "../../lib/provider";
import type { ToastPosition } from "../../lib/provider";

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
  /** Display duration in ms; 0 = stays until closed by hand. Default: 5000. */
  duration?: number;
  /** One action - "Undo". Never the only way to do what it offers: the toast
      leaves by itself, and not everybody reaches it in time. More than one
      action is a dialog. */
  action?: ToastAction;
  /** Called once when the toast goes, with the reason. */
  onClose?: (reason: ToastCloseReason) => void;
}

interface Place {
  /** Distance from the region's edge, in px. */
  offset: number;
  /** Behind the front card of a closed deck: cut to its height, smaller. */
  behind: boolean;
  scale: number;
  /** Further back than BEHIND in a closed deck. */
  hidden: boolean;
  zIndex: number;
}

interface ToastItem extends ToastOptions {
  id: number;
  /** Set while it leaves, with the place it stood at: the others close up
      over it. */
  leaving?: Place;
}

interface TimerInfo {
  timeout: ReturnType<typeof setTimeout> | null;
  remaining: number;
  startedAt: number;
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

const ToastContext = createContext<ToastContextValue | null>(null);

/** Access to `toast()`, `update()` and `dismiss()`; requires a ToastProvider. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast requires a <ToastProvider> around the application.");
  }
  return context;
}

/* The deck. Closed, the newest toast stands in front and at most two stand
   behind it, each PEEK further back and a little smaller, cut to the front
   one's height. Open, they stand one after the other, GAP apart. Every card
   lies absolutely in the region and is moved by a transform, so that opening
   and closing are one transition - the heights that takes are measured once
   per card, on its content, which is never cut (toast-refinement 01). */
const PEEK = 14;
const GAP = 8;
const SHRINK = 0.04;
const BEHIND = 2;


/** A focus the deck opens for: on the region itself (Alt+T, the count), or
    one the browser shows as keyboard focus. Where `:focus-visible` is not
    understood (an older browser, jsdom), every focus counts - a deck open too
    often is better than one the keyboard cannot open. */
function keyboardFocus(element: Element, region: Element): boolean {
  if (element === region) return true;
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
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
  const timers = useRef(new Map<number, TimerInfo>());
  /* The teardowns of leaving toasts, cancelled with the provider. */
  const leaves = useRef(new Set<ReturnType<typeof setTimeout>>());
  const regionRef = useRef<HTMLDivElement>(null);


  /* The deck opens under the pointer, with the focus inside it, or pinned by
     its count (a finger has no hover). While it is open every countdown
     stands still. */
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  /* Alt+T puts the focus on the region by a key, but Chrome shows no
     `:focus-visible` for a scripted focus after a click: the ring is drawn
     for this focus by hand. */
  const [byKeys, setByKeys] = useState(false);
  const open = hovered || focused || pinned;
  const openRef = useRef(open);

  /* Where each card stood at the last picture, for the one that leaves. */
  const lastPlace = useRef(new Map<number, Place>());
  /* The observed content element of each card. */
  const observed = useRef(new Map<number, HTMLElement>());
  const observer = useRef<ResizeObserver | null>(null);
  const [heights, setHeights] = useState<Record<number, number>>({});

  /** Where Alt+T took the focus from, to give it back. */
  const returnFocus = useRef<HTMLElement | null>(null);
  const leaveRegion = useCallback(() => {
    const back = returnFocus.current;
    returnFocus.current = null;
    if (back?.isConnected) back.focus();
    else (document.activeElement as HTMLElement | null)?.blur();
  }, []);

  const remove = useCallback(
    (id: number) => {
      lastPlace.current.delete(id);
      const element = observed.current.get(id);
      if (element) observer.current?.unobserve(element);
      observed.current.delete(id);
      setHeights((current) => Object.fromEntries(Object.entries(current).filter(([key]) => Number(key) !== id)));
      const rest = itemsRef.current.filter((item) => item.id !== id);
      commit(rest);
      /* An empty deck has nothing to be open about - and a pointer over a
         region that shrank away sends no leave until it moves. */
      if (!rest.some((item) => !item.leaving)) {
        setHovered(false);
        setPinned(false);
      }
    },
    [commit],
  );

  const clearTimer = useCallback((id: number) => {
    const info = timers.current.get(id);
    if (info?.timeout) clearTimeout(info.timeout);
    timers.current.delete(id);
  }, []);

  /** Starts the leaving: first the choreography, then the teardown. */
  const beginLeave = useCallback(
    (id: number, reason: ToastCloseReason) => {
      const item = itemsRef.current.find((entry) => entry.id === id);
      if (!item || item.leaving) return;
      clearTimer(id);
      item.onClose?.(reason);
      /* A keyboard focus on the leaving card would fall to the body with it -
         without a blur, and with the reader's place lost. It stays in the
         deck while another toast stands, and goes back where it came from
         otherwise. */
      const region = regionRef.current;
      const active = document.activeElement;
      if (region && active instanceof HTMLElement && region.querySelector(`[data-toast="${id}"]`)?.contains(active) && keyboardFocus(active, region)) {
        if (itemsRef.current.some((entry) => entry.id !== id && !entry.leaving)) region.focus();
        else leaveRegion();
      }
      /* Leaving through transitions (not animations), so that it does not
         compete with the entrance animation for the same properties. How long
         it takes is said by the token that the stylesheet reads as well
         (library-audit 07). Without a duration there is nothing to wait for. */
      const duration = region === null ? 0 : durationFrom(getComputedStyle(region), "--u-duration-exit-collapse");
      if (prefersReducedMotion() || duration <= 0) {
        remove(id);
        return;
      }
      const place = lastPlace.current.get(id) ?? { offset: 0, behind: false, scale: 1, hidden: false, zIndex: 0 };
      commit(itemsRef.current.map((entry) => (entry.id === id ? { ...entry, leaving: { ...place, zIndex: 0 } } : entry)));
      const teardown = setTimeout(() => {
        leaves.current.delete(teardown);
        remove(id);
      }, duration);
      leaves.current.add(teardown);
    },
    [clearTimer, commit, remove, leaveRegion],
  );

  const run = useCallback(
    (id: number, info: TimerInfo) => {
      info.startedAt = Date.now();
      info.timeout = setTimeout(() => beginLeave(id, "timeout"), info.remaining);
    },
    [beginLeave],
  );

  /** Counts a toast's duration from now - held while the deck is open. */
  const startTimer = useCallback(
    (id: number) => {
      clearTimer(id);
      const item = itemsRef.current.find((entry) => entry.id === id);
      if (!item || item.tone === "loading") return;
      const ms = item.duration ?? defaultDuration;
      if (ms <= 0) return;
      const info: TimerInfo = { timeout: null, remaining: ms, startedAt: 0 };
      timers.current.set(id, info);
      if (!openRef.current) run(id, info);
    },
    [clearTimer, defaultDuration, run],
  );

  useEffect(() => {
    openRef.current = open;
    timers.current.forEach((info, id) => {
      if (open && info.timeout) {
        clearTimeout(info.timeout);
        info.timeout = null;
        info.remaining = Math.max(0, info.remaining - (Date.now() - info.startedAt));
      } else if (!open && !info.timeout) {
        if (info.remaining <= 0) beginLeave(id, "timeout");
        else run(id, info);
      }
    });
  }, [open, beginLeave, run]);

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

  useEffect(() => {
    const map = timers.current;
    const teardowns = leaves.current;
    return () => {
      map.forEach((info) => {
        if (info.timeout) clearTimeout(info.timeout);
      });
      map.clear();
      teardowns.forEach(clearTimeout);
      teardowns.clear();
    };
  }, []);

  /* ---- Measuring: each card's content, which the deck never cuts. ---- */
  const measure = useCallback((id: number, height: number) => {
    setHeights((current) => (current[id] === height ? current : { ...current, [id]: height }));
  }, []);
  /** One stable ref for every card's content; the card says which it is. A
      card that moves to the other live region mounts anew, and the element it
      leaves behind is let go. */
  const measureRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element) return;
      const id = Number(element.dataset.toast);
      const before = observed.current.get(id);
      if (before === element) return;
      if (before) observer.current?.unobserve(before);
      observed.current.set(id, element);
      measure(id, element.offsetHeight);
      if (typeof ResizeObserver === "undefined") return;
      /* The border box, unrounded and untransformed: offsetHeight rounds,
         and eight pixels of gap became 7.6. */
      observer.current ??= new ResizeObserver((entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          measure(Number(target.dataset.toast), entry.borderBoxSize?.[0]?.blockSize ?? target.offsetHeight);
        }
      });
      observer.current.observe(element);
    },
    [measure],
  );
  useEffect(() => () => observer.current?.disconnect(), []);

  /* ---- Alt+T, and where the focus goes back to. ---- */
  const anyStanding = items.some((item) => !item.leaving);
  useEffect(() => {
    if (!anyStanding) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      /* `code`, not `key`: on a Mac, Alt+T types "†". */
      if (!event.altKey || event.ctrlKey || event.metaKey || event.code !== "KeyT") return;
      event.preventDefault();
      const active = document.activeElement;
      if (!regionRef.current?.contains(active)) {
        returnFocus.current = active instanceof HTMLElement ? active : null;
      }
      regionRef.current?.focus();
      setByKeys(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [anyStanding]);

  /* A pinned deck closes on a press anywhere else - and gives up the focus it
     was given, or it would stay open by that. */
  useEffect(() => {
    if (!pinned) return;
    const onDown = (event: globalThis.PointerEvent) => {
      const region = regionRef.current;
      if (!region || region.contains(event.target as Node)) return;
      setPinned(false);
      if (region.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [pinned]);

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
    returnFocus.current = null;
  };
  /* An element that leaves the document takes the focus with it and sends no
     blur: after every change the focus is read again. */
  useEffect(() => {
    const region = regionRef.current;
    const active = document.activeElement;
    setFocused(!!region && active instanceof HTMLElement && region.contains(active) && keyboardFocus(active, region));
  }, [items]);
  /* A finger's touch ends in a pointerleave at once; it opens by the count. */
  const onPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") setHovered(true);
  };
  const onPointerLeave = () => setHovered(false);

  /* ---- The places. ---- */
  const standing = items.filter((item) => !item.leaving);
  const count = standing.length;
  const byRank = [...standing].reverse();
  const frontHeight = byRank[0] ? (heights[byRank[0].id] ?? 0) : 0;
  const places = new Map<number, Place>();
  let reach = 0;
  byRank.forEach((item, rank) => {
    const behind = !open && rank > 0;
    places.set(item.id, {
      offset: open ? reach : rank * PEEK,
      behind,
      scale: behind ? 1 - rank * SHRINK : 1,
      hidden: !open && rank > BEHIND,
      zIndex: count - rank,
    });
    reach += (heights[item.id] ?? 0) + GAP;
  });
  useLayoutEffect(() => {
    lastPlace.current = places;
  });
  const regionHeight = count === 0 ? 0 : open ? reach - GAP : frontHeight + PEEK * Math.min(count - 1, BEHIND);

  const value = useMemo(() => ({ toast, update, dismiss }), [toast, update, dismiss]);
  const wording = useWording();
  const portalTarget = usePortalTarget();

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
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        /* Two live regions that stand before the first message arrives: a
           region that comes into the document with its text already in it is
           often not read out at all by a screen reader. The message goes into
           the region of its tone, following the same table as with `Alert`
           (library-audit 03 and its review). Both regions are
           `display: contents`; the cards lie absolutely in the outer region,
           ordered by arrival whatever their tone. */
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
        portalTarget() ?? document.body,
      )}
    </ToastContext.Provider>
  );
}
