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
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { DAY, HOUR, MINUTE, type CalendarInput } from "@umriss-ui/charts";
import { useFormats, useWording } from "@umriss-ui/core";
import { ScheduleContext } from "./context";
import { ScheduleScene, type PlacingItem, type ScheduleInteraction, type ScheduleTooltipTarget } from "./scene";
import { DEFAULT_LANE_HEIGHT } from "./sceneView";
import { ScheduleTooltipContent } from "./ScheduleTooltip";
import type { Intent, IntentKind } from "./model";
import type { ZoomLimits } from "./timeAxis";
import type { SnapRaster } from "./snap";
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
  /** The raster a drag lands on: `"ticks"` - the fine band's current step -, a
      step in milliseconds from local midnight, a step with an offset (shifts at
      06:00, 14:00 and 22:00 are eight hours offset by six), or `false` for none.
      It shapes the ghost and the intent, never the data. */
  snap?: "ticks" | number | SnapRaster | false;
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
  /** Called when a click selects a task or clears the selection, with the
      subtask that was clicked - null where the click was on a transport or on
      nothing. It is called again when another subtask of the same task is
      clicked. */
  onSelectedTaskChange?: (task: string | null, subtask: string | null) => void;
  /** The visible time span after the planner panned or zoomed, as two
      wall-clock instants - for keeping a second schedule or a chart in step. A
      span handed in through `initialDomain` is not reported back. */
  onDomainChange?: (domain: readonly [number, number]) => void;
  /** What the application is dragging in from outside while it drags it - its
      key, task, the length of its main time, its setup and teardown. The
      browser hands the dragged data over only on the drop, so the ghost before
      it can only come from here: set it on your own `dragstart`, clear it on
      `dragend`. Without `"place"` in `intents` no drop is accepted. */
  placing?: PlacingItem | null;
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

/** What a schedule offers a caller imperatively: the arithmetic between a
    point on the screen and a time on a lane. Everything else is props. */
export interface ScheduleHandle {
  /** The time and the lane at a client point, or null outside the plot. */
  positionAt: (clientX: number, clientY: number) => { time: number; lane: string | null } | null;
  /** The client point of a time - on the middle of a lane where one is named -
      or null while the schedule is not on screen. */
  clientPointOf: (time: number, lane?: string) => { x: number; y: number } | null;
  /** The visible span, as two wall-clock instants. */
  visibleDomain: () => readonly [number, number];
}

export const Schedule = forwardRef<ScheduleHandle, ScheduleProps>(function Schedule(props, ref): ReactNode {
  const {
    ariaLabel,
    initialDomain,
    height = 400,
    laneHeight = DEFAULT_LANE_HEIGHT,
    headerWidth = 160,
    calendar = WALL_CLOCK,
    zoomLimits,
    snap = "ticks",
    intents = NO_INTENTS,
    onIntent,
    onInteraction,
    selectedTask,
    onSelectedTaskChange,
    onDomainChange,
    placing,
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
  /* A raster written inline is a new object on every render; its two numbers
     are what counts. */
  const snapStep = typeof snap === "object" ? snap.step : null;
  const snapOffset = typeof snap === "object" ? snap.offset : null;
  const snapKind = typeof snap === "object" ? null : snap;

  /* `now={true}` follows the clock: read at mount, then once a minute. A
     schedule that switches `now` on later shows the clock of its mount until
     the next minute - no second render just for that. */
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    if (now !== true) return;
    const timer = setInterval(() => setClock(Date.now()), MINUTE);
    return () => clearInterval(timer);
  }, [now]);
  const nowAt = now === true ? clock : typeof now === "number" ? now : null;

  useLayoutEffect(() => {
    const key = `${domainFrom}|${domainTo}`;
    const fresh = lastDomain.current !== key;
    lastDomain.current = key;
    const raster = snapKind ?? { step: snapStep ?? 0, offset: snapOffset ?? 0 };
    scene.setOptions(
      { laneHeight, calendar, zoomLimits: { min: limitMin, max: limitMax }, snap: raster, intents, now: nowAt },
      fresh ? [domainFrom, domainTo] : null,
    );
  }, [scene, domainFrom, domainTo, laneHeight, calendar, limitMin, limitMax, snapKind, snapStep, snapOffset, intents, nowAt]);

  useEffect(() => {
    scene.setHandlers({ onIntent, onInteraction, onSelectedTaskChange, onDomainChange });
  }, [scene, onIntent, onInteraction, onSelectedTaskChange, onDomainChange]);

  useImperativeHandle(
    ref,
    () => ({
      positionAt: (clientX, clientY) => scene.positionAt(clientX, clientY),
      clientPointOf: (time, lane) => scene.clientPointOf(time, lane),
      visibleDomain: () => scene.visibleDomain(),
    }),
    [scene],
  );

  useEffect(() => {
    scene.setControlledTask(selectedTask);
  }, [scene, selectedTask]);

  useEffect(() => {
    scene.setPlacing(placing ?? null);
  }, [scene, placing]);

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

  /* The ghost's label stands above its bar, and under it in the topmost lane:
     the plot clips what leaves it, and a label a planner cannot read is worse
     than one on the other side. Measured like the tooltip, for the same
     reason. */
  const ghostRef = useRef<HTMLSpanElement | null>(null);
  const [ghostAt, setGhostAt] = useState({ x: 0, y: 0, at: "" });
  const ghostKey = ghost === null ? "" : `${ghost.x}:${ghost.y}:${ghost.from}:${ghost.to}:${ghost.overlap}:${ghost.late}`;
  useLayoutEffect(() => {
    const element = ghostRef.current;
    if (ghost === null || element === null) return;
    const gap = 4;
    const above = ghost.y - element.offsetHeight - gap;
    const below = ghost.y + ghost.height + gap;
    const next = {
      x: Math.max(2, Math.min(ghost.x, snapshot.width - element.offsetWidth - 2)),
      y: above >= 2 ? above : Math.min(below, snapshot.height - element.offsetHeight - 2),
      at: ghostKey,
    };
    setGhostAt((current) => (current.x === next.x && current.y === next.y && current.at === next.at ? current : next));
  }, [ghost, ghostKey, snapshot.width, snapshot.height]);

  /* The tooltip is placed from its measured size, not from a guess: beside the
     pointer where there is room, on the other side where there is not, and
     clamped into the plot either way - the plot clips what leaves it. */
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const [tooltipAt, setTooltipAt] = useState({ x: 0, y: 0, at: "" });
  const point = snapshot.tooltip;
  /* The pointer and the target together: while the placing belongs to another
     point, the tooltip is not shown - a tooltip placed a frame later would
     flash in the corner of the plot first. */
  const pointKey = point === null ? "" : `${point.x}:${point.y}:${point.target.kind}`;
  useLayoutEffect(() => {
    const element = tooltipRef.current;
    if (point === null || element === null) return;
    const gap = 12;
    const place = (at: number, size: number, extent: number) => {
      const after = at + gap;
      const before = at - gap - size;
      const chosen = after + size <= extent - 4 || before < 4 ? after : before;
      return Math.max(4, Math.min(chosen, extent - size - 4));
    };
    const next = {
      x: place(point.x, element.offsetWidth, snapshot.width),
      y: place(point.y, element.offsetHeight, snapshot.height),
      at: pointKey,
    };
    setTooltipAt((current) => (current.x === next.x && current.y === next.y && current.at === next.at ? current : next));
  }, [point, pointKey, snapshot.width, snapshot.height]);

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
        <div className={styles.dayBand} aria-hidden="true" data-schedule-days="" data-schedule-clip="day band">
          {snapshot.days.map((day) => {
            /* The label stands at the visible start of its day: a day that began
               before the view still says which day it is. */
            const hidden = Math.max(0, -day.x);
            const visible = Math.min(day.x + day.width, snapshot.width) - Math.max(day.x, 0);
            return (
              <span key={day.start} className={styles.day} style={{ left: `${day.x}px`, width: `${day.width}px` }}>
                <span className={styles.dayLabel} data-schedule-overlay="day label" style={{ marginLeft: `${hidden}px` }}>
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
          data-schedule-clip="plot"
          style={{ cursor: snapshot.cursor }}
          onPointerDown={(event) => scene.pointerDown(event.nativeEvent)}
          onPointerMove={(event) => scene.pointerMove(event.nativeEvent)}
          onPointerUp={(event) => scene.pointerUp(event.nativeEvent)}
          onPointerCancel={(event) => scene.pointerCancel(event.nativeEvent)}
          onPointerLeave={() => scene.pointerLeave()}
          onContextMenu={(event) => scene.contextMenu(event.nativeEvent)}
          onDragOver={(event) => scene.dragOver(event.nativeEvent)}
          onDrop={(event) => scene.drop(event.nativeEvent)}
          onDragLeave={(event) => {
            /* Only when the drag really left the plot - crossing one of its own
               children fires a leave too. */
            const next = event.nativeEvent.relatedTarget;
            if (!(next instanceof Node) || !event.currentTarget.contains(next)) scene.dragLeave();
          }}
        >
          <canvas ref={dataRef} className={styles.layer} aria-hidden="true" />
          <canvas ref={overlayRef} className={styles.layer} aria-hidden="true" />
          {snapshot.grips.map((grip) => (
            <span
              key={grip.kind}
              data-grip={grip.kind}
              data-schedule-overlay={`${grip.kind} grip`}
              aria-hidden="true"
              className={styles.grip}
              style={{ left: `${grip.x}px`, top: `${grip.y}px`, height: `${grip.height}px` }}
            />
          ))}
          {tooltip !== false && snapshot.tooltip !== null && (
            <span
              ref={tooltipRef}
              role="tooltip"
              className={styles.tooltip}
              data-schedule-tooltip=""
              data-schedule-overlay="tooltip"
              style={{
                left: `${tooltipAt.x}px`,
                top: `${tooltipAt.y}px`,
                visibility: tooltipAt.at === pointKey ? undefined : "hidden",
              }}
            >
              {typeof tooltip === "function" ? tooltip(snapshot.tooltip.target) : <ScheduleTooltipContent target={snapshot.tooltip.target} />}
            </span>
          )}
          {ghost !== null && (
            <span
              ref={ghostRef}
              className={styles.ghostLabel}
              data-ghost=""
              data-schedule-overlay="ghost label"
              data-findings={[ghost.overlap ? "overlap" : "", ghost.late ? "late-transport" : ""].filter(Boolean).join(" ")}
              style={{
                left: `${ghostAt.x}px`,
                top: `${ghostAt.y}px`,
                visibility: ghostAt.at === ghostKey ? undefined : "hidden",
              }}
            >
              {wording.scheduleGhostTimes(formats.time(new Date(ghost.from), false), formats.time(new Date(ghost.to), false))}
              {ghost.overlap && <span className={styles.finding}>{wording.scheduleOverlap}</span>}
              {ghost.late && <span className={styles.finding}>{wording.scheduleLateTransport}</span>}
            </span>
          )}
        </div>
        <div className={styles.corner} />
        <div className={styles.tickBand} aria-hidden="true" data-schedule-ticks="" data-schedule-clip="time band">
          {snapshot.now !== null && <span className={styles.now} data-now="" data-schedule-overlay="now mark" style={{ left: `${snapshot.now}px` }} />}
          {snapshot.ticks.map((tick) => (
            <span key={tick.wallClock} className={styles.tick} style={{ left: `${tick.x}px` }}>
              {/* A label that would be cut by the band's edge is left out; its
                  line stays. */}
              {tick.x >= LABEL_MARGIN && tick.x <= snapshot.width - LABEL_MARGIN && (
                <span className={styles.tickLabel} data-schedule-overlay="time label">
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
});
