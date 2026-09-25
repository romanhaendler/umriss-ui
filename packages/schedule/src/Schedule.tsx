/* <Schedule> - subtasks on lanes over time (CONTEXT.md, "The schedule").

   Structure of the DOM:
     .root            grid; carries the accessible name and the text context
       .corner        above the lane headers
       .dayBand       the coarse band: local days          (holds still)
       .headers       one header per ROW, real text        (scrolls with the lanes only)
       .plot          catches the pointer, and is the one tab stop whose keys
                      walk the subtasks (schedule-a11y, ADR-0030)
         canvas       data: grid, dependencies, subtasks, findings, selection
         canvas       overlay: hover and the ghost
         .ghostLabel  the ghost's times and findings, while a drag is in flight
         .grip        lead-in and lead-out grips of the selected subtask
       .corner
       .tickBand      the fine band: adaptive time ticks   (holds still)

   `data-row` on a header is the one place the layout's private word reaches
   the DOM, and it is here because an application styling beside the schedule
   has to be able to tell the three apart: `lane` is a machine's own row,
   `groupHead` the slim line of an open **Lane group**, `miniature` the one row
   a folded group becomes. The word ROW is `rows.ts`'s and says what the plot
   lays out; a **Lane** is still a machine (ADR-0025). A lane's header also
   carries `data-lane`, a group's `data-group`, and a lane a drag may not go to
   carries `data-refused` for as long as that drag runs.

   Canvas access happens only inside effects. The canvas is hidden from
   assistive technology; the root names the schedule and the headers are
   text. What the canvas shows is spoken instead: the plot is described by a
   summary and reads the **Active subtask** into a live region beside it. */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { DAY, HOUR, MINUTE, type CalendarInput } from "@umriss-ui/charts";
import { AngleGlyph, VisuallyHidden, useFormats, useWording } from "@umriss-ui/core";
import { ScheduleContext } from "./context";
import { ScheduleScene, type PlacingItem, type ScheduleInteraction, type ScheduleTooltipTarget } from "./scene";
import { DEFAULT_LANE_HEIGHT } from "./sceneView";
import { ScheduleReadout, ScheduleTooltipContent } from "./ScheduleTooltip";
import type { Intent, IntentKind, Subtask, DependencyAttachment, DependencyEnds, DependencyRoute } from "./model";
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
  /** Width of the lane headers in pixels - at most 40 % of the schedule, so
      that on a phone the plot keeps the larger part. */
  headerWidth?: number;
  /** A working calendar: the intervals in which time counts. Nights and
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
  /** Whether a subtask may go to a lane. Without it every lane is open; it
      narrows `"lane"`, it does not enable it.

      Asked once per lane when a drag takes hold, and asked again at the drop.
      The lanes it turns down are marked from the first frame of the drag - a
      planner sees the refusal before meeting it - and over one of them the
      ghost stays on the last lane that was allowed, the cursor says no and a
      line ties the ghost to the pointer. A refused lane costs the lane and
      nothing else: a drop after it still reports the move in time.

      It is asked for work dragged in from outside as well, with the key and
      task the application declared in `placing`. */
  canMoveTo?: (subtask: Subtask, lane: string) => boolean;
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
      subtask that was clicked - null where the click was on a dependency or on
      nothing. It is called again when another subtask of the same task is
      clicked. */
  onSelectedTaskChange?: (task: string | null, subtask: string | null) => void;
  /** The **Lane group**s that are folded, controlled. Leave it out and the
      schedule keeps them itself, starting from `defaultCollapsedGroups`.

      Folding changes the view and not the plan, which is why it is no intent:
      a caller that applies every intent it receives must never find a fold
      among them (ADR-0025). A folded outer group hides the inner ones without
      their entries leaving the list, so unfolding it gives back the view that
      was there. */
  collapsedGroups?: readonly string[];
  /** Which groups are folded when the schedule mounts, where the schedule
      keeps the state itself. Ignored while `collapsedGroups` is given. */
  defaultCollapsedGroups?: readonly string[];
  /** Called with the whole list when the planner folds or unfolds a group. */
  onCollapsedGroupsChange?: (groups: readonly string[]) => void;
  /** The visible time span after the planner panned or zoomed, as two
      wall-clock instants - for keeping a second schedule or a chart in step. A
      span handed in through `initialDomain` is not reported back. */
  onDomainChange?: (domain: readonly [number, number]) => void;
  /** What the application is dragging in from outside while it drags it - its
      key, task, the length of its main time, its lead-in and lead-out. The
      browser hands the dragged data over only on the drop, so the ghost before
      it can only come from here: set it on your own `dragstart`, clear it on
      `dragend`. Without `"place"` in `intents` no drop is accepted. */
  placing?: PlacingItem | null;
  /** How the dependencies are drawn: a `"curve"` that leaves and arrives
      forwards, a `"straight"` line, or `"orthogonal"` segments. A dependency may
      say otherwise for itself. */
  route?: DependencyRoute;
  /** Where a dependency's ends sit on their bars: the `"centre"` of both, or the
      `"nearest"` edge - which is the shortest line between two stops. Within
      one lane both mean the middle. A dependency may say otherwise for itself.

      It changes the picture and never a finding: whether a dependency is violated
      follows from its `leaves` and `arrives` alone. */
  attach?: DependencyAttachment;
  /** Whether a dependency's two ends carry a dot (`"dot"`, the default) or the
      line stands alone (`"none"`). The dot says where the line is anchored - a
      help while a plan is being read, and noise in a plan full of short moves.
      A dependency may say otherwise for itself. */
  ends?: DependencyEnds;
  /** What stands written in a bar: a function from a subtask to a line of
      text, or nothing for bars without text. The text is cut off with an
      ellipsis where the bar is too narrow for it and left out where even that
      would say nothing; a bar that began before the view keeps its text at the
      view's edge. */
  label?: (subtask: Subtask) => string;
  /** The tooltip on a hovered subtask or dependency: its order, its times, its
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
  /** `Lane`, `Dependencies` and `Subtasks`, in the order they are to stand and
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
    canMoveTo,
    onInteraction,
    selectedTask,
    onSelectedTaskChange,
    collapsedGroups,
    defaultCollapsedGroups,
    onCollapsedGroupsChange,
    onDomainChange,
    placing,
    route = "curve",
    attach = "centre",
    ends = "dot",
    label,
    tooltip,
    now,
    className,
    style,
    children,
  } = props;

  const [scene] = useState(() => new ScheduleScene());
  /* One id per schedule, so that two on a page do not both claim
     `#…-group-presses` for their chevron's `aria-controls`. */
  const plotId = useId();
  const summaryId = `${plotId}-summary`;
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
      { laneHeight, calendar, zoomLimits: { min: limitMin, max: limitMax }, snap: raster, intents, now: nowAt, route, attach, ends },
      fresh ? [domainFrom, domainTo] : null,
    );
  }, [scene, domainFrom, domainTo, laneHeight, calendar, limitMin, limitMax, snapKind, snapStep, snapOffset, intents, nowAt, route, attach, ends]);

  useEffect(() => {
    scene.setHandlers({ onIntent, canMoveTo, onInteraction, onSelectedTaskChange, onCollapsedGroupsChange, onDomainChange });
  }, [scene, onIntent, canMoveTo, onInteraction, onSelectedTaskChange, onCollapsedGroupsChange, onDomainChange]);

  /* The default is taken once, at the mount: after that the state is the
     scene's, and a caller who wants to move it uses `collapsedGroups`. */
  const firstDefault = useRef(defaultCollapsedGroups);
  useEffect(() => {
    const first = firstDefault.current;
    if (first !== undefined) scene.setDefaultCollapsedGroups(first);
  }, [scene]);

  useEffect(() => {
    scene.setCollapsedGroups(collapsedGroups);
  }, [scene, collapsedGroups]);

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
       registered as not passive, which React does not do. On the root and not
       the plot, so that the wheel over a lane's name scrolls the lanes too. */
    const onWheel = (event: WheelEvent) => scene.wheel(event);
    root.addEventListener("wheel", onWheel, { passive: false });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && scene.cancelEdit()) event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.removeEventListener("wheel", onWheel);
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
  const spoken = snapshot.spoken;
  const summary = snapshot.summary;
  const instant = (at: number) => `${formats.dateShort(new Date(at))} ${formats.time(new Date(at), false)}`;
  /* What a group's chevron controls: every row that lies inside it - its heads
     and lanes while it is open, its one miniature row while it is folded. The
     ids therefore point at elements that exist either way, which is what a
     disclosure has to promise. */
  /* By the row's own key and NOT by its kind: a group's head and its folded
     miniature are the same row in two states, and a key that changed with the
     state would unmount the chevron on every fold - which takes the keyboard
     focus away from the hand that just pressed it. */
  /* Encoded, because an id may hold no space and a lane's may: `aria-controls`
     is a list split at spaces. */
  const rowId = (header: { key: string }) => `${plotId}-row-${encodeURIComponent(header.key)}`;
  const controlledBy = useMemo(() => {
    const byGroup = new Map<string, string[]>();
    for (const header of snapshot.headers) {
      for (const group of header.within) {
        if (header.kind === "groupHead" && group === header.group) continue;
        byGroup.set(group, [...(byGroup.get(group) ?? []), rowId(header)]);
      }
    }
    return byGroup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot.headers, plotId]);
  const refused = useMemo(() => new Set(ghost?.refusedLanes ?? []), [ghost?.refusedLanes]);

  /* The ghost's label stands above its bar, and under it in the topmost lane:
     the plot clips what leaves it, and a label a planner cannot read is worse
     than one on the other side. Measured like the tooltip, for the same
     reason. */
  const ghostRef = useRef<HTMLSpanElement | null>(null);
  const [ghostAt, setGhostAt] = useState({ x: 0, y: 0, at: "" });
  const ghostKey = ghost === null ? "" : `${ghost.x}:${ghost.y}:${ghost.from}:${ghost.to}:${ghost.overlap}:${ghost.violated}:${ghost.refused}:${ghost.blocked}`;
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
        style={{ height: `${height}px`, gridTemplateColumns: `min(${headerWidth}px, 40%) minmax(0, 1fr)`, ...style }}
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
            {snapshot.headers.map((header) => (
              <div
                key={header.key}
                id={rowId(header)}
                className={styles.header}
                style={{ height: `${header.height}px`, paddingLeft: `calc(var(--u-space-3) + ${header.depth} * var(--u-space-3))` }}
                data-lane={header.lane}
                data-group={header.group}
                data-row={header.kind}
                /* A header's ROW is the box its contents may not leave. Not
                   the column: a header below the fold is scrolled to, not
                   lost. What this catches is a label, a count or a chevron
                   that outgrew its own row - a group's head is slim, and a
                   slim row is where that happens first. */
                data-schedule-clip={`header ${header.kind}`}
                /* The header says it too, for the whole run of a drag: the
                   plot marks the lane, the header marks its name - and an
                   application styling beside the schedule reads the same
                   attribute. */
                data-refused={header.lane !== undefined && refused.has(header.lane) ? "" : undefined}
              >
                {header.kind !== "lane" && header.group !== undefined && (
                  <button
                    type="button"
                    className={styles.chevron}
                    data-schedule-overlay="fold control"
                    aria-expanded={header.collapsed === false}
                    aria-controls={(controlledBy.get(header.group) ?? [rowId(header)]).join(" ")}
                    aria-label={`${header.collapsed === true ? wording.scheduleUnfoldGroup : wording.scheduleFoldGroup}: ${typeof header.label === "string" ? header.label : header.group}`}
                    onClick={() => scene.toggleGroup(header.group!)}
                  >
                    <AngleGlyph size={9} data-open={header.collapsed === false ? "" : undefined} />
                  </button>
                )}
                <span className={styles.headerLabel} data-schedule-overlay="header label">
                  {header.label}
                </span>
                {header.kind !== "lane" && (
                  <span className={styles.headerCount} data-schedule-overlay="lane count" data-lane-count={header.lanes}>
                    {wording.scheduleLaneCount(header.lanes)}
                  </span>
                )}
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
          /* One tab stop for the whole plot, with the application role: in
             browse mode a screen reader keeps the arrow keys for itself
             (ADR-0030's reasoning holds here unchanged). */
          tabIndex={0}
          role="application"
          aria-roledescription={wording.scheduleRoleDescription}
          aria-label={ariaLabel}
          aria-describedby={summaryId}
          onKeyDown={(event) => {
            if (scene.key(event.nativeEvent)) event.preventDefault();
          }}
          onFocus={(event) => scene.focus(focusVisible(event.currentTarget))}
          onBlur={() => scene.blur()}
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
          {label !== undefined &&
            snapshot.bars.map((bar) => (
              <span
                key={bar.subtask.id}
                className={styles.barLabel}
                data-bar-label={bar.subtask.id}
                data-schedule-overlay="bar label"
                /* A label is its bar: two of them intersect exactly when two
                   bars do, and that is an overlap - a finding, drawn on
                   purpose (CONTEXT.md, **Overlap**). */
                data-schedule-may-cover=""
                data-on={bar.dark ? "dark" : "light"}
                style={{ left: `${bar.x}px`, top: `${bar.y}px`, width: `${bar.width}px`, height: `${bar.height}px` }}
              >
                <span className={styles.barLabelText}>{label(bar.subtask)}</span>
              </span>
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
              data-findings={[ghost.overlap ? "overlap" : "", ghost.violated ? "violated-dependency" : ""].filter(Boolean).join(" ")}
              data-refused={ghost.refused ? "" : undefined}
              data-blocked={ghost.blocked ? "" : undefined}
              style={{
                left: `${ghostAt.x}px`,
                top: `${ghostAt.y}px`,
                visibility: ghostAt.at === ghostKey ? undefined : "hidden",
              }}
            >
              {wording.scheduleGhostTimes(formats.time(new Date(ghost.from), false), formats.time(new Date(ghost.to), false))}
              {ghost.refused && <span className={styles.refusal}>{wording.scheduleLaneRefused}</span>}
              {ghost.blocked && <span className={styles.refusal}>{wording.scheduleBlockedTime}</span>}
              {ghost.overlap && <span className={styles.finding}>{wording.scheduleOverlap}</span>}
              {ghost.violated && <span className={styles.finding}>{wording.scheduleViolatedDependency}</span>}
            </span>
          )}
          {/* The ring is drawn inside the plot, not around it: the plot meets
              the root's clipped edge on the right, where an outer ring would be
              cut away. */}
          <span className={styles.focusRing} aria-hidden="true" />
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
        {/* Beside the plot and out of the grid's flow (absolutely placed). */}
        <VisuallyHidden aria-live="polite">
          {spoken !== null && (
            <ScheduleReadout
              key={spoken.count}
              target={spoken.target}
              lane={spoken.lane === null ? null : (scene.data.lanes.find((lane) => lane.id === spoken.lane)?.label ?? spoken.lane)}
            />
          )}
        </VisuallyHidden>
        <VisuallyHidden id={summaryId}>
          {`${wording.scheduleSummary({ ...summary, from: instant(summary.from), to: instant(summary.to) })} ${wording.scheduleKeyHelp}`}
        </VisuallyHidden>
      </div>
      {children}
    </ScheduleContext.Provider>
  );
});

/** Did the focus come by keyboard? A click focuses the plot too, and must not
    start the walk. Where the selector is unknown, it is taken as yes. */
function focusVisible(el: HTMLElement): boolean {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}
