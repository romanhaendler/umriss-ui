/* The dock: a strip of tools that lies above exactly one surface and carries the
   actions for it.

   It belongs to its host and never to the screen. Two charts side by side have
   two docks, and neither claims to act on the other. What it adopts from the
   model is the translucent material, the capsule and the orientation that
   follows the edge. What it expressly does NOT adopt is the magnification under
   the pointer, the large colourful glyphs and the free floating.

   It does NOT stand on `Popover`. That primitive is there for an anchored
   surface with anchor geometry, edge clamping and flipping; a dock hangs on no
   anchor, it lies at an edge.

   It is also not a table toolbar (`Toolbar` in @umriss-ui/table). That is a
   strip IN the flow above a table - it takes room instead of covering, and it
   does not move. A component that did both would carry two anatomies. The
   difference stands as a term in CONTEXT.md, so that a later reader does not
   merge them.

   TWO DECISIONS LOOK LIKE OMISSIONS HERE. Both have an ADR, and this is the
   place that sends the reader there:

   - The dock never holds a coordinate. Whoever finds the zone calculation and no
     code that writes a position takes direct manipulation to have been
     forgotten. It was rejected - ADR-0013.
   - The change of orientation is animated by hand (FLIP) where a reader expects
     a CSS transition. A transition CANNOT do it: between `row` and `column`
     there is no in-between - ADR-0014.

   The library remembers nothing: the resting place and the mode belong to the
   caller, and the dock invents no mode nobody has set. */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { HTMLAttributes, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { GripGlyph } from "../../lib/glyphs";
import { durationFrom, prefersReducedMotion } from "../../lib/motion";
import { nextIndex } from "../../lib/options";
import { useWording } from "../../lib/language";
import { Tooltip } from "../Tooltip";
import { VisuallyHidden } from "../VisuallyHidden";
import {
  isUpright,
  stripLength,
  nearestFittingPlace,
  fits,
  placeAtPointer,
  placeForKey,
  DEFAULT_PLACE,
  type Place,
  type Rect,
  type StripMetrics,
} from "./place";
import styles from "./Dock.module.css";

/** The outside of the resting place. */
export type DockPlace = Place;

/** A tool: something one TAKES. That distinguishes it from the candidate of the
    command palette, which one FINDS (CONTEXT.md, "Reaching for a tool"). */
export interface DockTool {
  /** What is reported on taking. */
  id: string;
  /** The name. It reaches the eye through the tooltip and the screen reader
      through the accessible name - it never stands written, because a standing
      dock has no room for text. */
  label: string;
  /** The glyph. Drawn according to `packages/core/docs/glyphs.md`: only `currentColor`. */
  icon: ReactNode;
  /** Shows the tool but does not let it be taken. It stays standing in the
      strip: a dock whose tools come and go grows and shrinks under the hand
      reaching for them. */
  disabled?: boolean;
}

export interface DockProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /**
   * The tools - a property and expressly not children.
   *
   * Children would read more flexibly and would cost exactly the one number
   * that is needed: the dock must know how many tools it has in order to answer
   * whether it would have room at a side edge at all - and to answer that
   * before it is there.
   */
  tools: readonly DockTool[];
  /** Controlled: the dock reports and waits, it does not move itself. */
  place?: DockPlace;
  /** Uncontrolled: the resting place it starts with. */
  defaultPlace?: DockPlace;
  /** Reports the desired resting place. Controlled, the dock moves only once
      `place` follows; uncontrolled it is merely a message. */
  onPlaceChange?: (place: DockPlace) => void;
  /**
   * The mode - the tool the dock stands in. At most one, and without a value
   * NONE is marked: a dock whose tools simply fire has no mode. None is
   * invented either, and none is preset to the first tool - that would be a
   * statement about the state of the application which this component cannot
   * make.
   */
  mode?: string;
  /**
   * Reported is only what is a CHANGE, and only as long as there is a mode at
   * all: without `mode` there is no change of mode to report, and the taking
   * itself reports `onUse`.
   */
  onModeChange?: (id: string) => void;
  /** A tool was taken. */
  onUse?: (id: string) => void;
  /** The accessible name of the dock. Without a value the wording entry. */
  label?: string;
}

interface Snapshot {
  place: Place;
  root: DOMRect;
  strip: DOMRect;
  children: DOMRect[];
}

/** The children the transition moves: the grip slot and the tools. */
function childrenOf(strip: HTMLElement): HTMLElement[] {
  return Array.from(strip.children) as HTMLElement[];
}

function numberFrom(style: CSSStyleDeclaration, name: string): number {
  const raw = Number.parseFloat(style.getPropertyValue(name));
  return Number.isFinite(raw) ? raw : 0;
}

export const Dock = forwardRef<HTMLDivElement, DockProps>(function Dock(
  {
    tools,
    place,
    defaultPlace = DEFAULT_PLACE,
    onPlaceChange,
    mode,
    onModeChange,
    onUse,
    label,
    className,
    ...rest
  },
  ref,
) {
  const wording = useWording();
  const rootRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

  const [ownPlace, setOwnPlace] = useState<Place>(defaultPlace);
  const controlled = place !== undefined;
  const currentPlace = place ?? ownPlace;

  /* The current place as a ref: the pointer handling lies in listeners that stay
     standing for the duration of a drag, and those must not point at the state
     of the render in which they were registered. */
  const placeRef = useRef(currentPlace);
  placeRef.current = currentPlace;

  /* The refusal carries its outline with it. To measure it while drawing would
     mean reading the layout in every render - and precisely in those renders
     that come about during a drag. */
  const [refused, setRefused] = useState<{
    place: Place;
    width: string;
    height: string;
  } | null>(null);
  const [message, setMessage] = useState("");
  const refusalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (refusalTimer.current !== null) clearTimeout(refusalTimer.current);
    },
    [],
  );

  /* ---------------------------------------------------------------- */
  /* Measuring                                                         */
  /* ---------------------------------------------------------------- */

  /* What is measured is what the CSS has really produced, and not what a second
     version of the tokens claims in JavaScript. `place.ts` takes these values as
     parameters for exactly that reason. */
  const measureMetrics = useCallback((): StripMetrics | null => {
    const strip = stripRef.current;
    if (strip === null) return null;
    const children = childrenOf(strip);
    const gripSlot = children[0];
    if (gripSlot === undefined) return null;
    const stripBox = strip.getBoundingClientRect();
    /* Without an extent there is nothing to measure, and a calculation on zeroes
       would be worse than none: it would answer the question about the place
       with invented numbers. Whoever gets no metrics leaves the question unasked
       and moves the dock. */
    if (stripBox.width === 0 && stripBox.height === 0) return null;
    const style = getComputedStyle(strip);
    /* Which axis runs along is decided ONCE; after that `along` and `across`
       measure without ever asking the question again. */
    const upright = isUpright(placeRef.current);
    const along = (box: DOMRect) => (upright ? box.height : box.width);
    const across = (box: DOMRect) => (upright ? box.width : box.height);
    const gripBox = gripSlot.getBoundingClientRect();
    const toolBox = children[1]?.getBoundingClientRect();
    return {
      tool: toolBox === undefined ? 0 : along(toolBox),
      grip: along(gripBox),
      gap: numberFrom(style, upright ? "row-gap" : "column-gap"),
      padding: numberFrom(style, upright ? "padding-top" : "padding-left"),
      /* The thickness is calculated and not measured on the strip: its shape is
         in motion during a transition, that of a tool field never. Across,
         exactly one field stands between the two paddings - grip and tool are
         equally wide there. */
      thickness: (toolBox === undefined ? across(gripBox) : across(toolBox)) +
        2 * numberFrom(style, upright ? "padding-left" : "padding-top"),
      /* The margin is read from the token and not calculated back from the
         position of the strip: it is the same at all four edges, and the
         position knows it only at the one the dock currently lies at. */
      margin: numberFrom(style, "--u-dock-margin"),
    };
  }, []);

  const hostRect = useCallback((): Rect | null => {
    const root = rootRef.current;
    if (root === null) return null;
    const box = root.getBoundingClientRect();
    return { left: box.left, top: box.top, width: box.width, height: box.height };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Preparing the transition (FLIP, ticket 04)                        */
  /* ---------------------------------------------------------------- */

  const last = useRef<Snapshot | null>(null);
  const running = useRef<Animation[]>([]);

  const measureAll = useCallback((forPlace: Place): Snapshot | null => {
    const strip = stripRef.current;
    const root = rootRef.current;
    if (strip === null || root === null) return null;
    return {
      place: forPlace,
      root: root.getBoundingClientRect(),
      strip: strip.getBoundingClientRect(),
      children: childrenOf(strip).map((child) => child.getBoundingClientRect()),
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Setting the place                                                 */
  /* ---------------------------------------------------------------- */

  const clearRefusal = useCallback(() => {
    if (refusalTimer.current !== null) {
      clearTimeout(refusalTimer.current);
      refusalTimer.current = null;
    }
    setRefused(null);
  }, []);

  const setPlace = useCallback(
    (target: Place) => {
      if (target === placeRef.current) return;
      /* The visible state BEFORE the change. It is taken here and not in the
         layout effect: there the new place has long been rendered. And it is
         taken fresh rather than read from the last snapshot, so that a change
         arriving in the middle of a running animation continues from where the
         dock currently LOOKS - three changes during one drag thereby yield one
         movement and not three strung together. */
      last.current = measureAll(placeRef.current);
      clearRefusal();
      if (!controlled) setOwnPlace(target);
      placeRef.current = target;
      onPlaceChange?.(target);
      setMessage(wording.dockPlaced(wording.dockPlace(target)));
    },
    [controlled, clearRefusal, measureAll, onPlaceChange, wording],
  );

  /** A refusal: the place stays where it is, and that is seen and heard.
      Silence would be the alternative and is worse - a zone that does nothing
      and says nothing reads as a broken control. */
  const refuse = useCallback(
    (target: Place, metrics: StripMetrics, count: number, withTimer: boolean) => {
      const length = stripLength(count, metrics);
      setRefused({
        place: target,
        width: `${isUpright(target) ? metrics.thickness : length}px`,
        height: `${isUpright(target) ? length : metrics.thickness}px`,
      });
      setMessage(wording.dockNoPlace(wording.dockPlace(target)));
      if (refusalTimer.current !== null) clearTimeout(refusalTimer.current);
      /* With the pointer the refusal ends as soon as it leaves the zone; a key
         has no "leaves", so it needs an end. How long stands there as a token -
         and falls to zero under `prefers-reduced-motion` together with the other
         durations, where the refusal then does not appear at all. It is still
         heard. */
      const style = stripRef.current === null ? null : getComputedStyle(stripRef.current);
      const duration = style === null ? 0 : durationFrom(style, "--u-dock-refusal-duration");
      refusalTimer.current =
        withTimer && duration > 0
          ? setTimeout(() => {
              refusalTimer.current = null;
              setRefused(null);
            }, duration)
          : null;
    },
    [wording],
  );

  /** The one way along which both gestures choose a place. */
  const choosePlace = useCallback(
    (target: Place, host: Rect | null, metrics: StripMetrics | null, withTimer: boolean) => {
      if (target === placeRef.current) return;
      if (host !== null && metrics !== null && !fits(target, tools.length, host, metrics)) {
        refuse(target, metrics, tools.length, withTimer);
        return;
      }
      setPlace(target);
    },
    [refuse, setPlace, tools.length],
  );

  /* ---------------------------------------------------------------- */
  /* The pointer (ticket 03)                                           */
  /* ---------------------------------------------------------------- */

  /* The drag in progress, so that unmounting ends it: its Escape listener sits
     on the window and would otherwise outlive the dock. */
  const endDrag = useRef<(() => void) | null>(null);
  useEffect(() => () => endDrag.current?.(), []);

  const onGripPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const grip = event.currentTarget;
    if (event.button !== 0) return;
    event.preventDefault();
    const pointer = event.pointerId;
    grip.setPointerCapture(pointer);
    grip.dataset.dragging = "";

    /* Measured once and not per frame: the host does not move during a drag, and
       reading the layout on every `pointermove` is exactly the calculation
       ADR-0013 makes superfluous through snapping. */
    const host = hostRect();
    const metrics = measureMetrics();
    /* The travel comes from the token and from nothing else. A fallback value
       here would be a second version of `--u-dock-grip-travel` - and tokens.css
       names exactly that value as the knob to turn when the gesture feels
       lifeless. Two places at which one must turn are one too many. If the token
       cannot be read, the grip simply does not follow; the dock is moved
       nonetheless. */
    const travel = numberFrom(getComputedStyle(grip), "--u-dock-grip-travel");
    const start = placeRef.current;
    let fromX = event.clientX;
    let fromY = event.clientY;

    const dragGrip = (x: number, y: number) => {
      const clamp = (value: number) => Math.max(-travel, Math.min(travel, value));
      grip.style.transform = `translate(${clamp(x - fromX)}px, ${clamp(y - fromY)}px)`;
    };

    const moved = (e: globalThis.PointerEvent) => {
      if (e.pointerId !== pointer) return;
      const previous = placeRef.current;
      if (host !== null) {
        const target = placeAtPointer({ x: e.clientX, y: e.clientY }, host);
        if (target === placeRef.current) clearRefusal();
        else choosePlace(target, host, metrics, false);
      }
      /* If the dock snaps, the grip's travel starts afresh: otherwise it would
         hang at the stop after the jump and would not move any more. */
      if (placeRef.current !== previous) {
        fromX = e.clientX;
        fromY = e.clientY;
      }
      dragGrip(e.clientX, e.clientY);
    };

    const cleanUp = () => {
      endDrag.current = null;
      /* First unsubscribe, then release - as at the table's column grip in
         @umriss-ui/table: on `pointercancel` the pointer is already free and
         `releasePointerCapture` would throw. */
      grip.removeEventListener("pointermove", moved);
      grip.removeEventListener("pointerup", ended);
      grip.removeEventListener("pointercancel", ended);
      window.removeEventListener("keydown", onKeyDuringDrag, true);
      if (grip.hasPointerCapture(pointer)) grip.releasePointerCapture(pointer);
      delete grip.dataset.dragging;
      grip.style.transform = "";
      clearRefusal();
    };

    /* Losing the pointer counts as letting go and not as cancelling: the dock
       stands at a valid place, and to take that back afterwards would be a
       movement nobody triggered. */
    const ended = (e: globalThis.PointerEvent) => {
      if (e.pointerId !== pointer) return;
      cleanUp();
    };

    /* Escape restores the place the drag started with. There is nothing further
       to take back: a resting place is a name, and nothing else has moved
       (ADR-0013). */
    const onKeyDuringDrag = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setPlace(start);
      cleanUp();
    };

    grip.addEventListener("pointermove", moved);
    grip.addEventListener("pointerup", ended);
    grip.addEventListener("pointercancel", ended);
    window.addEventListener("keydown", onKeyDuringDrag, true);
    endDrag.current = cleanUp;
  };

  /* ---------------------------------------------------------------- */
  /* The keyboard at the grip (ticket 03)                              */
  /* ---------------------------------------------------------------- */

  const onGripKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const target = placeForKey(event.key);
    if (target === undefined) return;
    event.preventDefault();
    choosePlace(target, hostRect(), measureMetrics(), true);
  };

  /* ---------------------------------------------------------------- */
  /* The roving tab stop across the tools (ticket 02)                  */
  /* ---------------------------------------------------------------- */

  const usable = tools.filter((tool) => tool.disabled !== true);
  const [tabHolder, setTabHolder] = useState<string | null>(null);
  /* Searched through `data-tool` and a comparison, not through an assembled
     attribute selector: the `id` comes from the caller and may contain anything
     a string may contain. And not through an own ref on the button: the
     `Tooltip` clones its child and sets its ref in doing so - a second one
     beside it would not survive that. */
  const buttonFor = (id: string) =>
    Array.from(stripRef.current?.querySelectorAll<HTMLButtonElement>("[data-tool]") ?? [])
      .find((button) => button.dataset.tool === id);
  /* Derived rather than stored: if the tool with the tab stop drops out of the
     list or is disabled, the stop stands on the first usable one and never on
     nothing. */
  const stop =
    tabHolder !== null && usable.some((t) => t.id === tabHolder)
      ? tabHolder
      : (usable[0]?.id ?? null);

  const onToolKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const backward = event.key === "ArrowLeft" || event.key === "ArrowUp";
    const toStart = event.key === "Home";
    const toEnd = event.key === "End";
    if (!forward && !backward && !toStart && !toEnd) return;
    if (usable.length === 0) return;
    event.preventDefault();
    /* Both axes run, in every orientation. A dock that when lying listens only
       to left/right lets half the keys go nowhere - and which half that is
       changes with the transition.

       Where the navigation currently stands is told by the button the key fell
       on - not by the state. The state lags one pass behind when the focus was
       set from outside, and the arrows would then run on from the wrong
       place. */
    const current = usable.findIndex(
      (t) => t.id === event.currentTarget.dataset.tool,
    );
    const target = toStart
      ? 0
      : toEnd
        ? usable.length - 1
        : nextIndex(current === -1 ? 0 : current, usable.length, forward ? 1 : -1);
    const tool = usable[target];
    if (tool === undefined) return;
    setTabHolder(tool.id);
    buttonFor(tool.id)?.focus();
  };

  const take = (tool: DockTool) => {
    setTabHolder(tool.id);
    onUse?.(tool.id);
    if (mode !== undefined && mode !== tool.id) onModeChange?.(tool.id);
  };

  /* ---------------------------------------------------------------- */
  /* The transition (ticket 04)                                       */
  /* ---------------------------------------------------------------- */

  useLayoutEffect(() => {
    const old = last.current;
    /* Only if the place has changed. A repaint for another reason - a refusal,
       another tab stop - measures nothing here: it is measured once per change
       of place and not per frame. */
    if (old !== null && old.place === currentPlace) return;

    /* FIRST cancel, THEN measure - and that order is the whole difference
       between a transition and a shambles.

       A running animation pulls at the position AND the shape of the strip.
       Whoever measures while it runs does not measure the resting position of
       the new place but an intermediate frame of the old path. The reverse paths
       of the tools would then be calculated against a layout that never exists -
       and on a fast drag, where every change meets the previous one in the
       middle of its movement, the tools visibly left their capsule.

       Cancelling takes the animation back (`fill` stands at `none`), the element
       thereby stands in its real resting position, and the next measurement is
       the right one. Nobody gets to see that: we are in a layout effect, so
       before the paint.

       Where the dock currently LOOKED is already held there - `setPlace` takes
       it down before anything changes. */
    cancelRunning();
    const next = measureAll(currentPlace);
    last.current = next;
    if (old === null || next === null) return;
    if (prefersReducedMotion()) return;
    turn(old, next);
  });

  /** Takes back what is currently running. */
  function cancelRunning() {
    for (const animation of running.current) animation.cancel();
    running.current = [];
  }

  function turn(old: Snapshot, next: Snapshot) {
    const strip = stripRef.current;
    if (strip === null) return;
    /* Without Web Animations there is no transition to show - the dock is then
       simply at the new place, just as with reduced motion. That is the base
       line the correctness stands on; the animation is never the place where the
       layout is decided (ADR-0014). */
    if (typeof strip.animate !== "function") return;

    const style = getComputedStyle(strip);
    const duration = durationFrom(style, "--u-duration-medium");
    if (duration <= 0) return;
    const options: KeyframeAnimationOptions = {
      duration,
      easing: style.getPropertyValue("--u-ease-out").trim() || "ease-out",
    };

    /* The strip travels towards its position AND its shape, and it does so in
       pixels rather than through the edges of its resting place: during the
       movement the one edge must not be nailed down while the other follows from
       the width, otherwise the path of the children would be right in no
       intermediate frame. `right`, `bottom` and the automatic margins therefore
       stand still for the duration. One duration for everything that moves - the
       shape of the strip, the path of every tool and the journey to the other
       edge - because two durations read as two events and this is one. */
    const asFrame = (snapshot: Snapshot) => ({
      left: `${snapshot.strip.left - snapshot.root.left}px`,
      top: `${snapshot.strip.top - snapshot.root.top}px`,
      width: `${snapshot.strip.width}px`,
      height: `${snapshot.strip.height}px`,
      right: "auto",
      bottom: "auto",
      marginLeft: "0px",
      marginRight: "0px",
      marginTop: "0px",
      marginBottom: "0px",
    });
    running.current.push(strip.animate([asFrame(old), asFrame(next)], options));

    /* Every child travels its own path - minus the path of its parent, because
       the two `transform`s lie on top of each other. Nothing turns in doing so:
       the glyphs stand upright the whole time. A `rotate(90deg)` would be the
       obvious shortcut and leaves the dock lying on its side until it rights
       itself at the end (ADR-0014). */
    const children = childrenOf(strip);
    const dx = old.strip.left - next.strip.left;
    const dy = old.strip.top - next.strip.top;
    children.forEach((child, i) => {
      const a = old.children[i];
      const n = next.children[i];
      if (a === undefined || n === undefined) return;
      const kx = a.left - n.left - dx;
      const ky = a.top - n.top - dy;
      if (Math.abs(kx) < 0.5 && Math.abs(ky) < 0.5) return;
      running.current.push(
        child.animate(
          [{ transform: `translate(${kx}px, ${ky}px)` }, { transform: "none" }],
          options,
        ),
      );
    });
  }

  /* ---------------------------------------------------------------- */
  /* The host becomes smaller (ticket 05)                              */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const root = rootRef.current;
    if (root === null || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const host = hostRect();
      const metrics = measureMetrics();
      if (host === null || metrics === null) return;
      if (fits(placeRef.current, tools.length, host, metrics)) return;
      /* It does not stay where it does not fit, and it does not stick out. If not
         a single place fits, the host is too small in every orientation - then
         there is nothing to fall back to. */
      const wayOut = nearestFittingPlace(placeRef.current, tools.length, host, metrics);
      if (wayOut !== undefined) setPlace(wayOut);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [measureMetrics, setPlace, tools.length, hostRect]);

  /* ---------------------------------------------------------------- */
  /* Presentation                                                      */
  /* ---------------------------------------------------------------- */

  return (
    <div ref={rootRef} className={cx(styles.root, className)} {...rest}>
      <div
        ref={stripRef}
        data-place={currentPlace}
        className={styles.strip}
        role="group"
        aria-label={label ?? wording.dockTools}
      >
        <span className={styles.gripSlot}>
          <button
            type="button"
            className={styles.grip}
            aria-label={wording.dockGrip}
            onPointerDown={onGripPointerDown}
            onKeyDown={onGripKey}
          >
            <GripGlyph />
          </button>
        </span>

        {tools.map((tool) => {
          const inMode = mode !== undefined && mode === tool.id;
          return (
            <Tooltip key={tool.id} content={tool.label}>
              <button
                type="button"
                data-tool={tool.id}
                className={cx(styles.tool, inMode && styles.inMode)}
                aria-label={tool.label}
                /* Only the tool of the mode carries `aria-pressed`, and the
                   others do NOT carry it at all - not even as `false`.
                   `aria-pressed="false"` says "this is a switch that is
                   currently off", and this component does not know that: which
                   tools are modes is the caller's decision. In the demo it is
                   two out of five; the other three simply fire, and to announce
                   them as switched-off switches would be a claim about them. */
                aria-pressed={inMode ? true : undefined}
                disabled={tool.disabled}
                tabIndex={tool.id === stop ? 0 : -1}
                onClick={() => take(tool)}
                onKeyDown={onToolKey}
                onFocus={() => setTabHolder(tool.id)}
              >
                {tool.icon}
              </button>
            </Tooltip>
          );
        })}
      </div>

      {refused !== null && (
        <div
          data-place={refused.place}
          data-refusal=""
          className={styles.refusal}
          style={{ width: refused.width, height: refused.height }}
          aria-hidden="true"
        />
      )}

      {/* The status line answers the KEYBOARD. The pointer sees where the dock
          has jumped to and that a zone refuses; whoever uses the four arrows on
          the grip otherwise gets no feedback at all - neither on the change nor
          on the refusal. Ticket 05 requires only that a refusal does not stay
          silent; announcing the change as well costs nothing and makes the same
          gesture complete for both groups. */}
      <VisuallyHidden role="status" aria-live="polite">
        {message}
      </VisuallyHidden>
    </div>
  );
});
