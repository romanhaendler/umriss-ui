import { useState } from "react";
import type { CSSProperties } from "react";
import { Button, IconButton } from "../Button";
import { Input } from "../Input";
import { NumberInput } from "../NumberInput";
import { DropperGlyph } from "../../lib/glyphs";
import { useWording } from "../../lib/language";
import { hexToHsv, hexToRgb, luminance, normalizeHex, rgbToHex } from "./color";
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
  /** Given, a Clear button stands in the foot while a colour is set; it empties the field. */
  onClear?: () => void;
}

/** The panel's content. It keeps its own HSB state while it stands and hands out hex: a grey or black colour has no hue of its own, and deriving the state back from the hex would throw the hue the reader left. */
export function ColorPanel({ start, current, onColor, onDone, onCancel, onClear }: ColorPanelProps) {
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

  /* The browser's EyeDropper is not in the TS DOM lib and only some browsers have it; a refused or aborted pick rejects and changes nothing. */
  const dropper = typeof window !== "undefined" ? (window as unknown as { EyeDropper?: new () => { open(): Promise<{ sRGBHex: string }> } }).EyeDropper : undefined;
  const rgb = hexToRgb(current ?? "#000000");
  const channel = (index: number, value: number | null) => {
    if (value === null) return;
    const next = [...rgb] as [number, number, number];
    next[index] = value;
    apply(rgbToHex(next));
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
        {dropper && (
          <IconButton
            size="sm"
            aria-label={wording.colorEyedropper}
            onClick={() =>
              void new dropper()
                .open()
                .then(({ sRGBHex }) => {
                  const picked = normalizeHex(sRGBHex);
                  if (picked) apply(picked);
                })
                .catch(() => {})
            }
          >
            <DropperGlyph size={14} />
          </IconButton>
        )}
      </div>
      <div className={styles.channels}>
        {([["R", wording.colorRed], ["G", wording.colorGreen], ["B", wording.colorBlue]] as const).map(([letter, name], index) => (
          <div key={letter} className={styles.labelled}>
            <span className={styles.label} aria-hidden>
              {letter}
            </span>
            <NumberInput size="sm" aria-label={name} min={0} max={255} decimals={0} value={rgb[index]!} onValueChange={(value) => channel(index, value)} />
          </div>
        ))}
      </div>
      <div className={styles.compare} role="img" aria-label={wording.colorBeforeAfter(start ?? wording.colorNone, current ?? wording.colorNone)}>
        {([[wording.colorBefore, start], [wording.colorAfter, current]] as const).map(([word, color]) => (
          <span key={word} style={{ "--_color": color ?? "transparent", "--_ink": color ? inkOn(color) : undefined } as CSSProperties}>
            {word} {(color ?? wording.colorNone).toUpperCase()}
          </span>
        ))}
      </div>
      <div className={styles.foot}>
        {onClear && current && (
          <Button size="sm" variant="ghost" className={styles.footClear} onClick={onClear}>
            {wording.clear}
          </Button>
        )}
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
