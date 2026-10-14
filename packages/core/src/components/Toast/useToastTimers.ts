/* The countdowns of the toasts: the store of running timers, and the
   start/pause/resume of them while the deck is open or the toasts are held
   back. */
import { useCallback, useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { ToastCloseReason, ToastItem } from "./Toast";

interface TimerInfo {
  timeout: ReturnType<typeof setTimeout> | null;
  remaining: number;
  startedAt: number;
}

/** Whether a toast goes away on its own: it has a time, and is not still at work. */
export function leavesByItself(item: ToastItem, defaultDuration: number) {
  return (item.duration ?? defaultDuration) > 0 && item.tone !== "loading";
}

/** The running timers and the teardowns of leaving toasts, all cancelled with
    the provider. */
export function useTimerStore() {
  const timersRef = useRef(new Map<number, TimerInfo>());
  const leavesRef = useRef(new Set<ReturnType<typeof setTimeout>>());

  const clearTimer = useCallback((id: number) => {
    const info = timersRef.current.get(id);
    if (info?.timeout) clearTimeout(info.timeout);
    timersRef.current.delete(id);
  }, []);

  useEffect(() => {
    const map = timersRef.current;
    const teardowns = leavesRef.current;
    return () => {
      map.forEach((info) => {
        if (info.timeout) clearTimeout(info.timeout);
      });
      map.clear();
      teardowns.forEach(clearTimeout);
      teardowns.clear();
    };
  }, []);

  return { timersRef, leavesRef, clearTimer };
}

/** Counts each toast's duration, standing still while `still` is true (the
    deck is open, or the toasts are held back). */
export function useCountdowns({
  timersRef,
  clearTimer,
  itemsRef,
  still,
  defaultDuration,
  beginLeave,
}: {
  timersRef: MutableRefObject<Map<number, TimerInfo>>;
  clearTimer: (id: number) => void;
  itemsRef: MutableRefObject<ToastItem[]>;
  still: boolean;
  defaultDuration: number;
  beginLeave: (id: number, reason: ToastCloseReason) => void;
}) {
  const stillRef = useRef(still);

  const run = useCallback(
    (id: number, info: TimerInfo) => {
      info.startedAt = Date.now();
      info.timeout = setTimeout(() => beginLeave(id, "timeout"), info.remaining);
    },
    [beginLeave],
  );

  /** Counts a toast's duration from now - or from when the countdowns run
      again, with all of it. */
  const startTimer = useCallback(
    (id: number) => {
      clearTimer(id);
      const item = itemsRef.current.find((entry) => entry.id === id);
      if (!item || !leavesByItself(item, defaultDuration)) return;
      const ms = item.duration ?? defaultDuration;
      const info: TimerInfo = { timeout: null, remaining: ms, startedAt: 0 };
      timersRef.current.set(id, info);
      if (!stillRef.current) run(id, info);
    },
    [clearTimer, defaultDuration, itemsRef, run, timersRef],
  );

  useEffect(() => {
    stillRef.current = still;
    timersRef.current.forEach((info, id) => {
      if (still && info.timeout) {
        clearTimeout(info.timeout);
        info.timeout = null;
        info.remaining = Math.max(0, info.remaining - (Date.now() - info.startedAt));
      } else if (!still && !info.timeout) {
        if (info.remaining <= 0) beginLeave(id, "timeout");
        else run(id, info);
      }
    });
  }, [still, beginLeave, run, timersRef]);

  return startTimer;
}
