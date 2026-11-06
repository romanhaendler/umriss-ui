import { fieldBlur } from "../../lib/fieldBlur";
import { useShapeWarning } from "../../lib/useShapeWarning";
import { useId, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { Popover } from "../Popover";
import { useFormField } from "../FormField";
import { useFieldValue, withoutFieldProps } from "../../lib/useFieldValue";
import { FormPost, posted, type FormPostProps } from "../../lib/FormPost";
import { RangeTrigger } from "../DatePicker/RangeTrigger";
import type { RefProp } from "../../lib/refProp";
import { useControlSize } from "../../lib/controlSize";
import { useWording } from "../../lib/language";
import { AngleGlyph } from "../../lib/glyphs";
import { ColorPanel } from "./ColorPanel";
import { normalizeHex } from "./color";
import styles from "./ColorPicker.module.css";
import triggerStyles from "../DatePicker/DatePicker.module.css";

/** A named colour: an entry of `swatches`, or a surface in `contrastAgainst`. */
export interface ColorSwatch {
  name: string;
  /** A hex colour, `#2563eb` or `2563EB`. */
  value: string;
}

/** The props of `ColorPicker`: the field's value contract (ADR-0081) with a hex colour for the value. */
export interface ColorPickerProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, "onChange" | "defaultValue">, RefProp<HTMLButtonElement>, FormPostProps<string> {
  /** The colour as a hex string - `#2563eb`, `2563EB` and `#26e` are read; `null` means none. Anything else warns in development and reads as `null`. It leaves as lowercase `#rrggbb`. */
  value?: string | null;
  /** Uncontrolled: the colour to start at.
      @default null */
  defaultValue?: string | null;
  /** Runs on every settled step - a hex value as soon as it is a whole colour - and once more with the colour the panel opened with when Cancel or Escape put it back. */
  onValueChange?: (value: string | null) => void;
  /** What stands in the empty field. */
  placeholder?: string;
  /** Locks the field and the panel. */
  disabled?: boolean;
  /** Marks the field as invalid. `FormField` sets it itself as soon as it
      carries an `error` - by hand only necessary without `FormField`. */
  invalid?: boolean;
  /** `sm` for a toolbar and dense forms, `md` otherwise.
      @default the size of a `ControlSizeProvider` around it, else `"md"` */
  size?: "sm" | "md";
  /** The width in characters - room for the value; the field adds its own
      padding, swatch and chevron. Given, the field is that wide wherever it
      stands, and never wider than its place. Without it the field fills its
      place, and where the place asks - in a toolbar or a row - it is as wide
      as a hex value. */
  chars?: number;
  /** The application's own colours as one-click choices in the panel, named for a screen reader and on hover; the one matching the colour is pressed.
      @default no default */
  swatches?: readonly ColorSwatch[];
  /** The surfaces the panel measures the colour against, each with its contrast ratio and Pass or Fail at 3:1 (WCAG 1.4.11 - for marks and lines, not text). An empty list hides the readout.
      @default core's light and dark surface */
  contrastAgainst?: readonly ColorSwatch[];
}

/** A colour field: a trigger with the colour's swatch and hex value, and a panel that holds the hex field, the colour as it was when the panel opened beside the colour now, Cancel and Done. */
export function ColorPicker(props: ColorPickerProps) {
  const { ref, placeholder, disabled = false, invalid, size: ownSize, chars, className, name, formValue, swatches, contrastAgainst, ...fieldRest } = props;
  // The field's own props are read from `props` by `useFieldValue`; none of them reaches the element.
  const rest = withoutFieldProps(fieldRest);
  const [valueGiven, onChange, , formRef] = useFieldValue<string | null>("ColorPicker", props, null);
  const value = valueGiven == null ? null : normalizeHex(valueGiven);
  useShapeWarning("ColorPicker", "value", valueGiven != null && value === null, "a hex colour such as #2563eb, or null");
  const size = useControlSize(ownSize);
  const field = useFormField();
  const wording = useWording();
  const isInvalid = invalid ?? field?.invalid ?? false;

  const [open, setOpen] = useState(false);
  /* The colour the panel opened with, and whether the panel was cancelled: a
     step that arrives after a cancel (a field committing as it unmounts) must
     not paint over the colour put back. */
  const [start, setStart] = useState<string | null>(null);
  const cancelled = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  const openPanel = () => {
    cancelled.current = false;
    setStart(value);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };
  const cancel = () => {
    cancelled.current = true;
    if (value !== start) onChange(start);
    close();
  };

  return (
    <>
      <FormPost entries={[[name, posted(value, (color) => color, formValue)]]} disabled={disabled} />
      <RangeTrigger
        rootRef={ref}
        formRef={formRef}
        root={{
          ...rest,
          onKeyDown: (event) => {
            rest.onKeyDown?.(event);
            if (event.defaultPrevented || event.key !== "ArrowDown") return;
            event.preventDefault();
            if (!open) openPanel();
          },
        }}
        className={className}
        wrapRef={wrapRef}
        triggerRef={triggerRef}
        panel={{ id: panelId, open, onToggle: () => (open ? close() : openPanel()) }}
        field={field}
        state={{ disabled, invalid: isInvalid, clearable: false, size }}
        hasValue={!!value}
        display={
          value && (
            <>
              <span className={styles.swatch} style={{ "--_color": value } as CSSProperties} aria-hidden />
              {value.toUpperCase()}
            </>
          )
        }
        icon={<AngleGlyph className={`${triggerStyles.icon} ${styles.chevron}`} />}
        placeholder={placeholder ?? wording.colorPlaceholder}
        onClear={() => {}}
        ariaLabel={wording.clear}
        chars={chars}
        natural={9}
      />
      <Popover
        onBlur={(event) => fieldBlur(event, rest.onBlur, wrapRef)}
        open={open}
        onOpenChange={(isOpen, reason) => {
          if (isOpen) return;
          if (reason === "escape") cancel();
          else close();
        }}
        anchorRef={triggerRef}
        insideRefs={[wrapRef]}
        role="dialog"
        aria-label={wording.colorPanel}
        id={panelId}
        className={styles.panel}
        closeOnTabOut
      >
        <ColorPanel
          start={start}
          current={value}
          swatches={swatches}
          contrastAgainst={contrastAgainst}
          onColor={(hex) => {
            if (!cancelled.current) onChange(hex);
          }}
          onDone={close}
          onCancel={cancel}
        />
      </Popover>
    </>
  );
}
