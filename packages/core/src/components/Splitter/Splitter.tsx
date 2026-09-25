import { forwardRef, useId, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { GripGlyph } from "../../lib/glyphs";
import { useWording } from "../../lib/language";
import { mergeRefs } from "../../lib/mergeRefs";
import styles from "./Splitter.module.css";

export interface SplitterProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "children"> {
  /** How the two panes stand: `horizontal` side by side, `vertical` one
      above the other - a trend above, its alarms below. Default: `horizontal` */
  orientation?: "horizontal" | "vertical";
  /** Controlled: the first pane's share of the room, in per cent. */
  value?: number;
  /** Uncontrolled: the share to start at. Default: 50 */
  defaultValue?: number;
  /** Reports every move, by pointer or key, as the first pane's share. */
  onChange?: (value: number) => void;
  /** The smallest share of the first pane, and where Enter collapses it to.
      Default: 0 */
  min?: number;
  /** The largest share of the first pane. Default: 100 */
  max?: number;
  /** How far an arrow key moves the separator, in per cent. Default: 5 */
  step?: number;
  /** The separator's name. The APG names it after the first pane ("Trend");
      without it the general term from the wording stands. */
  separatorLabel?: string;
  /** The first pane and the second, in this order. */
  children: [ReactNode, ReactNode];
}

/* Two panes and the line between them - the APG window splitter. The line is
   a focusable `role="separator"` whose value is the first pane's share in
   per cent: the arrows of its axis move it, Home and End take it to the
   bounds, and Enter collapses the first pane and brings it back to where it
   was. The pointer drags it across the whole box.

   The shares are grid tracks in `fr`, so the separator's own width is taken
   off before the rest is shared: the panes add up to the box exactly, at any
   share. */
export const Splitter = forwardRef<HTMLDivElement, SplitterProps>(function Splitter(
  {
    orientation = "horizontal",
    value: valueProp,
    defaultValue = 50,
    onChange,
    min = 0,
    max = 100,
    step = 5,
    separatorLabel,
    className,
    style,
    onKeyDown,
    children,
    ...rest
  },
  ref,
) {
  const wording = useWording();
  const firstId = useId();
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const clamp = (share: number) => Math.min(max, Math.max(min, share));
  const [own, setOwn] = useState(() => clamp(defaultValue));
  const controlled = valueProp !== undefined;
  const value = clamp(controlled ? valueProp : own);
  /* Where Enter brings a collapsed pane back to. Unset for a pane that
     started collapsed: that one opens to the middle. */
  const restoreTo = useRef<number | null>(null);
  /* The pointer held, and how far from the line's middle it took hold: the
     line keeps that point under the pointer instead of jumping to it. */
  const dragging = useRef<{ pointer: number; offset: number } | null>(null);
  const across = orientation === "horizontal";

  const commit = (next: number) => {
    const share = clamp(next);
    if (share === value) return;
    if (!controlled) setOwn(share);
    onChange?.(share);
  };

  /* On the root, so that a caller's handler runs first and can keep a key;
     only the separator's own keys count - not a nested splitter's, not a
     field's inside a pane. */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.target !== line.current) return;
    const keys: Record<string, () => number> = {
      [across ? "ArrowRight" : "ArrowDown"]: () => value + step,
      [across ? "ArrowLeft" : "ArrowUp"]: () => value - step,
      Home: () => min,
      End: () => max,
      Enter: () => {
        if (value > min) {
          restoreTo.current = value;
          return min;
        }
        return restoreTo.current ?? (min + max) / 2;
      },
    };
    const next = keys[event.key];
    if (!next) return;
    event.preventDefault();
    commit(next());
  };

  /** A coordinate along the axis, and the middle of an element on it. */
  const along = (event: PointerEvent) => (across ? event.clientX : event.clientY);
  const middleOf = (element: Element) => {
    const box = element.getBoundingClientRect();
    return across ? box.left + box.width / 2 : box.top + box.height / 2;
  };

  /* The share under the pointer, on a tenth of a per cent: a whole per cent
     is a dozen pixels on a wide screen, and a drag should not jump. The
     panes share the box less the separator's strip, and so does this. */
  const follow = (event: PointerEvent<HTMLDivElement>, offset: number) => {
    const box = root.current?.getBoundingClientRect();
    const strip = line.current?.getBoundingClientRect();
    if (!box || !strip) return;
    const [start, size, own] = across ? [box.left, box.width, strip.width] : [box.top, box.height, strip.height];
    const share = (along(event) - offset - start - own / 2) / (size - own);
    if (Number.isFinite(share)) commit(Math.round(share * 1000) / 10);
  };

  return (
    <div
      ref={mergeRefs(ref, root)}
      className={cx(styles.splitter, !across && styles.vertical, className)}
      {...rest}
      onKeyDown={handleKeyDown}
      style={{ ...style, "--_first": `${value}fr`, "--_second": `${100 - value}fr` } as CSSProperties}
    >
      {/* A pane folded to nothing is out of the tab order as well as out of
          sight: the keys would otherwise walk into content nobody sees. */}
      <div id={firstId} className={styles.pane} inert={value <= 0 || undefined}>
        {children[0]}
      </div>
      <div
        ref={line}
        role="separator"
        tabIndex={0}
        aria-label={separatorLabel ?? wording.splitter}
        aria-controls={firstId}
        aria-orientation={across ? "vertical" : "horizontal"}
        aria-valuenow={Math.round(value)}
        aria-valuemin={min}
        aria-valuemax={max}
        className={styles.separator}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault(); // no text selection while dragging
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture(event.pointerId);
          dragging.current = { pointer: event.pointerId, offset: along(event) - middleOf(event.currentTarget) };
        }}
        onPointerMove={(event) => {
          if (dragging.current?.pointer === event.pointerId) follow(event, dragging.current.offset);
        }}
        onPointerUp={(event) => {
          dragging.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          dragging.current = null;
        }}
      >
        <GripGlyph className={styles.grip} />
      </div>
      <div className={styles.pane} inert={value >= 100 || undefined}>
        {children[1]}
      </div>
    </div>
  );
});
