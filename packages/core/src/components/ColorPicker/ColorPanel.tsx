import { useState } from "react";
import type { CSSProperties } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import { useWording } from "../../lib/language";
import { hexToHsv, hexToRgb, normalizeHex } from "./color";
import type { Hsv } from "./color";
import styles from "./ColorPicker.module.css";

/** Black or white, whichever reads on the colour (WCAG relative luminance; 0.179 is where the two ratios meet). */
function inkOn(hex: string): string {
  const [r, g, b] = hexToRgb(hex).map((x) => {
    const s = x / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? "#000000" : "#ffffff";
}

export interface ColorPanelProps {
  /** The colour the panel opened with; `null` for none. */
  start: string | null;
  /** The colour now; `null` while none is set. */
  current: string | null;
  /** Every settled step. */
  onColor: (hex: string) => void;
  /** Done: keeps the colour and closes. */
  onDone: () => void;
  /** Cancel: puts `start` back and closes. */
  onCancel: () => void;
}

/** The panel's content. It keeps its own HSB state while it stands and hands out hex: a grey or black colour has no hue of its own, and deriving the state back from the hex would throw the hue the reader left. */
export function ColorPanel({ start, current, onColor, onDone, onCancel }: ColorPanelProps) {
  const wording = useWording();
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(start ?? "#000000"));
  const [hexText, setHexText] = useState(start ?? "");

  const type = (text: string) => {
    setHexText(text);
    const typed = normalizeHex(text);
    if (!typed) return;
    setHsv(hexToHsv(typed, hsv));
    if (typed !== current) onColor(typed);
  };

  return (
    <>
      <div className={styles.row}>
        <div className={styles.labelled}>
          <span className={styles.label} aria-hidden>
            {wording.colorHex}
          </span>
          <Input
            size="sm"
            className={styles.hex}
            aria-label={wording.colorHex}
            autoComplete="off"
            spellCheck={false}
            value={hexText}
            onChange={(event) => type(event.target.value)}
            onBlur={() => setHexText(current ?? "")}
          />
        </div>
      </div>
      <div className={styles.compare} role="img" aria-label={wording.colorBeforeAfter(start ?? wording.colorNone, current ?? wording.colorNone)}>
        {([[wording.colorBefore, start], [wording.colorAfter, current]] as const).map(([word, color]) => (
          <span key={word} style={{ "--_color": color ?? "transparent", "--_ink": color ? inkOn(color) : undefined } as CSSProperties}>
            {word} {(color ?? wording.colorNone).toUpperCase()}
          </span>
        ))}
      </div>
      <div className={styles.foot}>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          {wording.cancel}
        </Button>
        <Button size="sm" variant="primary" onClick={onDone}>
          {wording.colorDone}
        </Button>
      </div>
    </>
  );
}
