import { useState } from "react";
import type { CSSProperties } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import { useWording } from "../../lib/language";
import { hexToHsv, luminance, normalizeHex } from "./color";
import type { Hsv } from "./color";
import styles from "./ColorPicker.module.css";

/** Black or white, whichever reads on the colour (0.179 is the luminance where the two contrast ratios meet). */
const inkOn = (hex: string) => (luminance(hex) > 0.179 ? "#000000" : "#ffffff");

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
  const [, setHsv] = useState<Hsv>(() => hexToHsv(start ?? "#000000"));
  /* What the reader is typing into the hex field; null while they are not, and
     the field shows the current colour, whichever control set it. */
  const [hexDraft, setHexDraft] = useState<string | null>(null);

  /* Every control that hands over a whole colour comes through here; the
     square and the strip set `hsv` themselves and hand over its hex. */
  const apply = (hex: string) => {
    setHsv((prev) => hexToHsv(hex, prev));
    if (hex !== current) onColor(hex);
  };

  const type = (text: string) => {
    setHexDraft(text);
    const typed = normalizeHex(text);
    if (typed) apply(typed);
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
            value={hexDraft ?? current ?? ""}
            onChange={(event) => type(event.target.value)}
            onBlur={() => setHexDraft(null)}
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
