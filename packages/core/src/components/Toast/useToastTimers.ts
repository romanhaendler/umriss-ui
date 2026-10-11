/* The countdowns of the toasts: the store of running timers, and the
   start/pause/resume of them while the deck is open or closed. */
import { useCallback, useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { ToastCloseReason, ToastItem } from "./Toast";

interface TimerInfo {
  timeout: ReturnType<typeof setTimeout> | null;
  remaining: number;
  startedAt: number;
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

/** Counts each toast's duration, held while the deck is open. */
export function useCountdowns({
  timersRef,
  clearTimer,
  itemsRef,
  open,
  defaultDuration,
  beginLeave,
}: {
  timersRef: MutableRefObject<Map<number, TimerInfo>>;
  clearTimer: (id: number) => void;
  itemsRef: MutableRefObject<ToastItem[]>;
  open: boolean;
  defaultDuration: number;
  beginLeave: (id: number, reason: ToastCloseReason) => void;
}) {
  const openRef = useRef(open);

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
      timersRef.current.set(id, info);
      if (!openRef.current) run(id, info);
    },
    [clearTimer, defaultDuration, itemsRef, run, timersRef],
  );

  useEffect(() => {
    openRef.current = open;
    timersRef.current.forEach((info, id) => {
      if (open && info.timeout) {
        clearTimeout(info.timeout);
        info.timeout = null;
        info.remaining = Math.max(0, info.remaining - (Date.now() - info.startedAt));
      } else if (!open && !info.timeout) {
        if (info.remaining <= 0) beginLeave(id, "timeout");
        else run(id, info);
      }
    });
  }, [open, beginLeave, run, timersRef]);

  return startTimer;
}
