import { useState } from "react";
import type { CSSProperties } from "react";
import { Button, IconButton } from "../Button";
import { Input } from "../Input";
import { NumberInput } from "../NumberInput";
import { DropperGlyph } from "../../lib/glyphs";
import { useWording } from "../../lib/language";
import { contrast, hexToHsv, hexToRgb, hsvToHex, luminance, normalizeHex, rgbToHex } from "./color";
import { ColorSquare, HueStrip } from "./ColorSurfaces";
import type { Hsv } from "./color";
import type { ColorSwatch } from "./ColorPicker";
import styles from "./ColorPicker.module.css";

/** Black or white, whichever reads on the colour (0.179 is the luminance where the two contrast ratios meet). */
const inkOn = (hex: string) => (luminance(hex) > 0.179 ? "#000000" : "#ffffff");

/** `--u-color-surface` as it resolves in each scheme, read once when the panel opens so that a theme overriding the token is measured. Where the token does not resolve (no stylesheet loaded) the values it ships with stand in. */
function readSurfaces(): [string, string] {
  const read = (scheme: "light" | "dark", fallback: string) => {
    if (typeof document === "undefined") return fallback;
    const probe = document.createElement("div");
    probe.style.cssText = `position:fixed;visibility:hidden;color-scheme:${scheme};background:var(--u-color-surface)`;
    document.body.append(probe);
    const parts = /^rgb\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)\s*\)/.exec(getComputedStyle(probe).backgroundColor);
    probe.remove();
    return parts ? rgbToHex([Number(parts[1]), Number(parts[2]), Number(parts[3])]) : fallback;
  };
  return [read("light", "#ffffff"), read("dark", "#1e1e20")];
}

export interface ColorPanelProps {
  /** The colour the panel opened with; `null` for none. */
  start: string | null;
  /** The colour now; `null` while none is set. */
  current: string | null;
  /** The application's own colours; none shows no row. */
  swatches?: readonly ColorSwatch[];
  /** The surfaces the contrast is read against; `undefined` for core's two, an empty list for none. */
  contrastAgainst?: readonly ColorSwatch[];
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
export function ColorPanel({ start, current, swatches, contrastAgainst, onColor, onDone, onCancel, onClear }: ColorPanelProps) {
  const wording = useWording();
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(start ?? "#000000"));
  /* A colour set from outside moves the square and the strip too; a grey keeps the hue it had. */
  if (current && current !== hsvToHex(hsv)) setHsv(hexToHsv(current, hsv));
  /* What the reader is typing into the hex field; null while they are not, and
     the field shows the current colour, whichever control set it. */
  const [hexDraft, setHexDraft] = useState<string | null>(null);

  /* Every control that hands over a whole colour comes through here; the
     square and the strip set `hsv` themselves and hand over its hex. */
  const give = (hex: string) => {
    if (hex !== current) onColor(hex);
  };
  const apply = (hex: string) => {
    setHsv((prev) => hexToHsv(hex, prev));
    give(hex);
  };

  const [light, dark] = useState(readSurfaces)[0];
  const surfaces = contrastAgainst ?? [
    { name: wording.colorSurfaceLight, value: light },
    { name: wording.colorSurfaceDark, value: dark },
  ];
  const own = (swatches ?? []).flatMap(({ name, value }) => {
    const hex = normalizeHex(value);
    return hex ? [{ name, hex }] : [];
  });

  /* The browser's EyeDropper is not in the TS DOM lib and only some browsers have it; a refused or aborted pick rejects and changes nothing. */
  const dropper = typeof window !== "undefined" ? (window as unknown as { EyeDropper?: new () => { open(): Promise<{ sRGBHex: string }> } }).EyeDropper : undefined;
  const rgb = hexToRgb(current ?? "#000000");
  const channel = (index: number, value: number | null) => {
    if (value === null) return;
    const next = [...rgb] as [number, number, number];
    next[index] = value;
    apply(rgbToHex(next));
  };

  /* The square and the strip hand over the new HSB state; its hex goes out where it differs. */
  const move = (next: Hsv) => {
    setHsv(next);
    give(hsvToHex(next));
  };

  /* While typing only a whole six-digit value applies: `#256` on the way to
     `#2563eb` is also a colour. A shorthand applies when the field commits. */
  const type = (text: string) => {
    setHexDraft(text);
    if (/^#?[0-9a-f]{6}$/i.test(text.trim())) apply(normalizeHex(text)!);
  };
  const commit = () => {
    const typed = hexDraft && normalizeHex(hexDraft);
    if (typed) apply(typed);
    setHexDraft(null);
  };

  return (
    <>
      <ColorSquare hsv={hsv} onChange={move} />
      <HueStrip hsv={hsv} onChange={move} />
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
            onBlur={commit}
            onKeyDown={(event) => event.key === "Enter" && commit()}
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
      {current && surfaces.length > 0 && (
        <div className={styles.contrasts}>
          {surfaces.map(({ name, value }) => {
            const ratio = contrast(current, value);
            const pass = ratio >= 3;
            return (
              <span key={name} className={styles.contrast}>
                <span className={styles.chip} style={{ "--_surface": value, "--_color": current } as CSSProperties} aria-hidden />
                <span className={styles.surface}>{name}</span>
                <span className={styles.ratio}>{ratio.toFixed(1)}:1</span>
                <span className={pass ? styles.pass : styles.fail}>{pass ? wording.colorPass : wording.colorFail}</span>
              </span>
            );
          })}
        </div>
      )}
      {own.length > 0 && (
        <div role="group" aria-label={wording.colorSwatches} className={styles.swatches}>
          {own.map(({ name, hex }) => (
            <button key={name + hex} type="button" title={name} aria-label={name} aria-pressed={hex === current} className={styles.choice} style={{ "--_color": hex } as CSSProperties} onClick={() => apply(hex)} />
          ))}
        </div>
      )}
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
