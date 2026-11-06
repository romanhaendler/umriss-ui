import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useWording } from "../../lib/language";
import { hsvToHex } from "./color";
import type { Hsv } from "./color";
import styles from "./ColorSurfaces.module.css";

/** The hue at full saturation and brightness. */
const pureOf = ({ h }: Hsv) => hsvToHex({ h, s: 1, v: 1 });
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** Pointer down captures the pointer, every move while captured reports the point as fractions of the box. */
function dragOn(report: (x: number, y: number) => void) {
  const at = (event: PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    report(clamp((event.clientX - box.left) / box.width, 0, 1), clamp((event.clientY - box.top) / box.height, 0, 1));
  };
  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      at(event);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) at(event);
    },
  };
}

export interface ColorSurfaceProps {
  hsv: Hsv;
  /** Every settled step, as the new HSB state. */
  onChange: (hsv: Hsv) => void;
}

/** Saturation (left to right) and brightness (bottom to top) of the hue: two gradients over its pure colour. */
export function ColorSquare({ hsv, onChange }: ColorSurfaceProps) {
  const wording = useWording();
  const saturation = Math.round(hsv.s * 100);
  const brightness = Math.round(hsv.v * 100);
  const key = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 0.1 : 0.01;
    const move = { ArrowRight: [step, 0], ArrowLeft: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[event.key];
    if (!move) return;
    event.preventDefault();
    onChange({ ...hsv, s: clamp(hsv.s + move[0]!, 0, 1), v: clamp(hsv.v + move[1]!, 0, 1) });
  };
  return (
    <div
      className={styles.square}
      role="slider"
      tabIndex={0}
      aria-label={wording.colorSquare}
      aria-roledescription={wording.colorSquareRole}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={brightness}
      aria-valuetext={wording.colorSquareValue(saturation, brightness)}
      style={{ "--_pure": pureOf(hsv), "--_color": hsvToHex(hsv), "--_x": `${hsv.s * 100}%`, "--_y": `${(1 - hsv.v) * 100}%` } as CSSProperties}
      onKeyDown={key}
      {...dragOn((x, y) => onChange({ ...hsv, s: x, v: 1 - y }))}
    >
      <span className={styles.handle} aria-hidden />
    </div>
  );
}

/** The full spectrum under the square; the handle takes the hue's pure colour, never the colour's brightness. */
export function HueStrip({ hsv, onChange }: ColorSurfaceProps) {
  const wording = useWording();
  const degrees = Math.round(hsv.h);
  const key = (event: KeyboardEvent) => {
    const to = { Home: 0, End: 360 }[event.key];
    const by = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 15, PageDown: -15 }[event.key];
    if (to === undefined && by === undefined) return;
    event.preventDefault();
    onChange({ ...hsv, h: clamp(to ?? hsv.h + by!, 0, 360) });
  };
  return (
    <div
      className={styles.hue}
      role="slider"
      tabIndex={0}
      aria-label={wording.colorHue}
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={degrees}
      aria-valuetext={wording.colorHueValue(degrees)}
      style={{ "--_color": pureOf(hsv), "--_x": `${(hsv.h / 360) * 100}%` } as CSSProperties}
      onKeyDown={key}
      {...dragOn((x) => onChange({ ...hsv, h: x * 360 }))}
    >
      <span className={styles.track} />
      <span className={styles.handle} aria-hidden />
    </div>
  );
}
