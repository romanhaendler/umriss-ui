/* <Schedule> - subtasks on lanes over time (CONTEXT.md, "The schedule").

   Structure of the DOM:
     .root            grid; carries the accessible name and the text context
       .corner        above the lane headers
       .dayBand       the coarse band: local days          (holds still)
       .headers       the lane headers, real text          (scrolls with the lanes only)
       .plot          catches the pointer
         canvas       data: grid, transports, subtasks, findings, selection
         canvas       overlay: hover and the ghost
         .ghostLabel  the ghost's times and findings, while a drag is in flight
         .grip        setup and teardown grips of the selected subtask
       .corner
       .tickBand      the fine band: adaptive time ticks   (holds still)

   Canvas access happens only inside effects. The canvas is hidden from
   assistive technology; the root names the schedule and the lane headers are
   text. */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { DAY, HOUR, type CalendarInput } from "@umriss-ui/charts";
import { useFormats, useWording } from "@umriss-ui/core";
import { ScheduleContext } from "./context";
import { ScheduleScene, type ScheduleInteraction, type ScheduleTooltipTarget } from "./scene";
import { ScheduleTooltipContent } from "./ScheduleTooltip";
import type { Intent, IntentKind } from "./model";
import type { ZoomLimits } from "./timeAxis";
import styles from "./Schedule.module.css";

export interface ScheduleProps {
  /** What the schedule shows, for a screen reader: "Plan of week 38". */
  ariaLabel: string;
  /** The time in view when the schedule mounts, as two wall-clock instants.
      Pan and zoom take it from there; a new pair of values puts it back. */
  initialDomain: readonly [number, number];
  /** Height in CSS pixels, both bands included. The width is the host's. */
  height?: number;
  /** Height of one lane in pixels. */
  laneHeight?: number;
  /** Width of the lane headers in pixels. */
  headerWidth?: number;
  /** An operating calendar: the intervals in which time counts. Nights and
      weekends outside them are cut out of the axis. Default: the wall clock. */
  calendar?: CalendarInput;
  /** The narrowest and widest time span zoom may reach, in milliseconds.
      Default: one hour to 28 days. */
  zoomLimits?: ZoomLimits;
  /** The raster a drag lands on: `"ticks"` - the fine band's current step -,
      a step in milliseconds, or `false` for none. It shapes the ghost and the
      intent, never the data. */
  snap?: "ticks" | number | false;
  /** The intents the caller handles. Each one enables its interaction; none
      leaves a read-only schedule (ADR-0023). */
  intents?: readonly IntentKind[];
  /** Called once per intent when a drag ends. The data changes only if the
      caller changes it. */
  onIntent?: (intent: Intent) => void;
  /** Click, context menu and hover, with what the pointer is on and where.
      While it is set, a right-click opens no browser menu. */
  onInteraction?: (interaction: ScheduleInteraction) => void;
  /** The selected task, controlled. Leave it out and the schedule keeps the
      selection itself. */
  selectedTask?: string | null;
  /** Called when a click selects a task or clears the selection. */
  onSelectedTaskChange?: (task: string | null) => void;
  /** The tooltip on a hovered subtask or transport: its order, its times, its
      parts and its findings. `false` switches it off; a function receives
      what the pointer rests on and returns content of the application's own. */
  tooltip?: false | ((target: ScheduleTooltipTarget) => ReactNode);
  /** A line marking the present across the lanes: `true` follows the clock by
      the minute, an instant fixes it there. Off by default. */
  now?: boolean | number;
  /** Goes to the root element. */
  className?: string;
  /** Goes to the root element. */
  style?: CSSProperties;
  /** `Lane`, `Transports` and `Subtasks`, in the order they are to stand and
      be drawn. */
  children?: ReactNode;
}

const NO_INTENTS: readonly IntentKind[] = [];
const DEFAULT_LIMITS = { min: HOUR, max: 28 * DAY };
const WALL_CLOCK: CalendarInput = [];
/** Half the width of a time label, and a little more. */
const LABEL_MARGIN = 20;

export function Schedule(props: ScheduleProps): ReactNode {
  const {
    ariaLabel,
    initialDomain,
    height = 400,
    laneHeight = 44,
    headerWidth = 160,
    calendar = WALL_CLOCK,
    zoomLimits,
    snap = "ticks",
    intents = NO_INTENTS,
    onIntent,
    onInteraction,
    selectedTask,
    onSelectedTaskChange,
    tooltip,
    now,
    className,
    style,
    children,
  } = props;

  const [scene] = useState(() => new ScheduleScene());
  const rootRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<HTMLDivElement | null>(null);
  const dataRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const formats = useFormats();
  const wording = useWording();

  const [domainFrom, domainTo] = initialDomain;
  const limitMin = zoomLimits?.min ?? DEFAULT_LIMITS.min;
  const limitMax = zoomLimits?.max ?? DEFAULT_LIMITS.max;
  const lastDomain = useRef<string | null>(null);

  /* `now={true}` follows the clock: read at mount, then once a minute. */
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    if (now !== true) return;
    setClock(Date.now());
    const timer = setInterval(() => setClock(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, [now]);
  const nowAt = now === true ? clock : typeof now === "number" ? now : null;

  useLayoutEffect(() => {
    const key = `${domainFrom}|${domainTo}`;
    const fresh = lastDomain.current !== key;
    lastDomain.current = key;
    scene.setOptions(
      { laneHeight, calendar, zoomLimits: { min: limitMin, max: limitMax }, snap, intents, now: nowAt },
      fresh ? [domainFrom, domainTo] : null,
    );
  }, [scene, domainFrom, domainTo, laneHeight, calendar, limitMin, limitMax, snap, intents, nowAt]);

  useEffect(() => {
    scene.setHandlers({ onIntent, onInteraction, onSelectedTaskChange });
  }, [scene, onIntent, onInteraction, onSelectedTaskChange]);

  useEffect(() => {
    scene.setControlledTask(selectedTask);
  }, [scene, selectedTask]);

  useEffect(() => {
    const root = rootRef.current;
    const plot = plotRef.current;
    const data = dataRef.current;
    const overlay = overlayRef.current;
    if (!root || !plot || !data || !overlay) return;
    scene.bind(root, plot, data, overlay);
    const rect = plot.getBoundingClientRect();
    scene.resize(rect.width, rect.height);
    const observer = new ResizeObserver((entries) => {
      const box = entries[entries.length - 1]?.contentRect;
      if (box !== undefined) scene.resize(box.width, box.height);
    });
    observer.observe(plot);
    /* The wheel zooms, pans and scrolls the lanes, and the page must not scroll
       with it while it does: a listener that can prevent the default has to be
       registered as not passive, which React does not do. */
    const onWheel = (event: WheelEvent) => scene.wheel(event);
    plot.addEventListener("wheel", onWheel, { passive: false });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && scene.cancelEdit()) event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      plot.removeEventListener("wheel", onWheel);
      observer.disconnect();
      scene.unbind();
    };
  }, [scene]);

  const snapshot = useSyncExternalStore(scene.subscribe, scene.getSnapshot, scene.getServerSnapshot);

  const dayLabel = (start: number, width: number): string => {
    const date = new Date(start);
    if (width >= 200) return formats.dateLong(date);
    if (width >= 84) return formats.date(date);
    if (width >= 44) return formats.dateShort(date);
    return "";
  };

  const ghost = snapshot.ghost;

  return (
    <ScheduleContext.Provider value={scene}>
      <div
        ref={rootRef}
        role="figure"
        aria-label={ariaLabel}
        className={className ? `${styles.root} ${className}` : styles.root}
        style={{ height: `${height}px`, gridTemplateColumns: `${headerWidth}px minmax(0, 1fr)`, ...style }}
      >
        <div className={styles.corner} />
        <div className={styles.dayBand} aria-hidden="true" data-schedule-days="">
          {snapshot.days.map((day) => {
            /* The label stands at the visible start of its day: a day that began
               before the view still says which day it is. */
            const hidden = Math.max(0, -day.x);
            const visible = Math.min(day.x + day.width, snapshot.width) - Math.max(day.x, 0);
            return (
              <span key={day.start} className={styles.day} style={{ left: `${day.x}px`, width: `${day.width}px` }}>
                <span className={styles.dayLabel} style={{ marginLeft: `${hidden}px` }}>
                  {dayLabel(day.start, visible)}
                </span>
              </span>
            );
          })}
        </div>
        <div className={styles.headers} data-schedule-headers="">
          <div className={styles.headerRun} style={{ transform: `translateY(${-snapshot.scrollY}px)` }}>
            {snapshot.lanes.map((lane) => (
              <div key={lane.id} className={styles.header} style={{ height: `${snapshot.laneHeight}px` }} data-lane={lane.id}>
                {lane.label}
              </div>
            ))}
          </div>
        </div>
        <div
          ref={plotRef}
          className={styles.plot}
          data-schedule-plot=""
          style={{ cursor: snapshot.cursor }}
          onPointerDown={(event) => scene.pointerDown(event.nativeEvent)}
          onPointerMove={(event) => scene.pointerMove(event.nativeEvent)}
          onPointerUp={(event) => scene.pointerUp(event.nativeEvent)}
          onPointerCancel={(event) => scene.pointerCancel(event.nativeEvent)}
          onPointerLeave={() => scene.pointerLeave()}
          onContextMenu={(event) => scene.contextMenu(event.nativeEvent)}
        >
          <canvas ref={dataRef} className={styles.layer} aria-hidden="true" />
          <canvas ref={overlayRef} className={styles.layer} aria-hidden="true" />
          {snapshot.grips.map((grip) => (
            <span
              key={grip.kind}
              data-grip={grip.kind}
              aria-hidden="true"
              className={styles.grip}
              style={{ left: `${grip.x}px`, top: `${grip.y}px`, height: `${grip.height}px` }}
            />
          ))}
          {tooltip !== false && snapshot.tooltip !== null && (
            <span
              role="tooltip"
              className={styles.tooltip}
              data-schedule-tooltip=""
              style={{
                left: `${snapshot.tooltip.x}px`,
                top: `${snapshot.tooltip.y}px`,
                /* Beside the pointer, on the side with more room. */
                transform: `translate(${snapshot.tooltip.x > snapshot.width * 0.6 ? "calc(-100% - 12px)" : "12px"}, ${
                  snapshot.tooltip.y > snapshot.height * 0.55 ? "calc(-100% - 12px)" : "12px"
                })`,
              }}
            >
              {typeof tooltip === "function" ? tooltip(snapshot.tooltip.target) : <ScheduleTooltipContent target={snapshot.tooltip.target} />}
            </span>
          )}
          {ghost !== null && (
            <span
              className={styles.ghostLabel}
              data-ghost=""
              data-findings={[ghost.overlap ? "overlap" : "", ghost.late ? "late-transport" : ""].filter(Boolean).join(" ")}
              style={{ left: `${ghost.x}px`, top: `${ghost.y}px` }}
            >
              {wording.scheduleGhostTimes(formats.time(new Date(ghost.from), false), formats.time(new Date(ghost.to), false))}
              {ghost.overlap && <span className={styles.finding}>{wording.scheduleOverlap}</span>}
              {ghost.late && <span className={styles.finding}>{wording.scheduleLateTransport}</span>}
            </span>
          )}
        </div>
        <div className={styles.corner} />
        <div className={styles.tickBand} aria-hidden="true" data-schedule-ticks="">
          {snapshot.now !== null && <span className={styles.now} data-now="" style={{ left: `${snapshot.now}px` }} />}
          {snapshot.ticks.map((tick) => (
            <span key={tick.wallClock} className={styles.tick} style={{ left: `${tick.x}px` }}>
              {/* A label that would be cut by the band's edge is left out; its
                  line stays. */}
              {tick.x >= LABEL_MARGIN && tick.x <= snapshot.width - LABEL_MARGIN && (
                <span className={styles.tickLabel}>
                  {snapshot.step >= DAY ? formats.dateShort(new Date(tick.wallClock)) : formats.time(new Date(tick.wallClock), false)}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
      {children}
    </ScheduleContext.Provider>
  );
}
