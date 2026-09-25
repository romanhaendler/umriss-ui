import { forwardRef, useEffect, useRef, useState } from "react";
import type { DragEvent, InputHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { CrossGlyph } from "../../lib/glyphs";
import { useFormats, useWording } from "../../lib/language";
import type { Formats } from "../../lib/language";
import { mergeRefs } from "../../lib/mergeRefs";
import { useFormField } from "../FormField";
import { accepts } from "./accept";
import styles from "./FileInput.module.css";

export interface FileInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "size"> {
  /** Controlled: the chosen files. Uncontrolled, the input keeps its own and
      starts empty. */
  value?: readonly File[];
  /** Reports the files after a choice, a drop or a removal - only those
      `accept` takes, and one where the input takes one. */
  onChange?: (files: File[]) => void;
  /** Marks the input as invalid. `FormField` sets it itself as soon as it
      carries an `error` - by hand only necessary without `FormField`. */
  invalid?: boolean;
}

/** A size as a reader says it: kilobytes up to a megabyte, then megabytes
    with one decimal; never "0 kB" for a file that has content. */
const sizeOf = (bytes: number, formats: Formats) =>
  bytes < 1_000_000
    ? `${formats.number(Math.max(bytes > 0 ? 1 : 0, Math.round(bytes / 1000)), 0)} kB`
    : `${formats.number(bytes / 1_000_000, 1)} MB`;

/* The native file input (`type="file"`) behind a key, inside a zone that
   takes a drop. The input lies over the key, transparent: a click on the
   key is a click on the input, and Space, Enter, a label, a form's `name` and
   `register()` come from the platform. A drop does not pass the platform's
   picker, so `accept` and `multiple` are applied to it here; what survives
   is written back into the input where the browser allows it, so a form
   sends what the list shows. Nothing is uploaded - that is the application's.

   The construction of the other native fields: the class on the zone, ref
   and rest on the input. */
export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(function FileInput(
  { value, onChange, invalid, accept, multiple = false, disabled = false, className, id, ...rest },
  ref,
) {
  const wording = useWording();
  const formats = useFormats();
  const field = useFormField();
  const input = useRef<HTMLInputElement>(null);
  const [own, setOwn] = useState<readonly File[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const controlled = value !== undefined;
  const files = controlled ? value : own;
  const isInvalid = invalid ?? field?.invalid ?? false;

  /* The input holds what the list shows. `DataTransfer` is how a script
     builds a file list; where it is missing, an emptied list at least empties
     the input. */
  useEffect(() => {
    const element = input.current;
    if (!element) return;
    if (typeof DataTransfer === "function") {
      const transfer = new DataTransfer();
      for (const file of files) transfer.items.add(file);
      element.files = transfer.files;
    } else if (files.length === 0) element.value = "";
  }, [files]);

  const commit = (next: File[]) => {
    if (!controlled) setOwn(next);
    onChange?.(next);
  };

  const take = (offered: File[]) => {
    const taken = offered.filter((file) => accepts(file, accept));
    setRejected(offered.filter((file) => !taken.includes(file)).map((file) => file.name));
    commit(multiple ? taken : taken.slice(0, 1));
  };

  const carriesFiles = (event: DragEvent) => !disabled && Array.from(event.dataTransfer?.types ?? []).includes("Files");

  const keyText = multiple ? wording.chooseFiles : wording.chooseFile;

  return (
    <div
      className={cx(styles.zone, dragging && styles.dragging, isInvalid && styles.invalidZone, className)}
      data-dragging={dragging ? "" : undefined}
      onDragEnter={(event) => {
        if (!carriesFiles(event)) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => {
        if (!carriesFiles(event)) return;
        event.preventDefault(); // this is what makes the zone a drop target
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault(); // the browser would open the file instead
        setDragging(false);
        if (!disabled) take(Array.from(event.dataTransfer?.files ?? []));
      }}
    >
      <span className={styles.key}>
        <input
          ref={mergeRefs(ref, input)}
          type="file"
          id={id ?? field?.id}
          aria-label={field ? undefined : keyText}
          aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
          aria-required={field?.required || undefined}
          aria-invalid={isInvalid || undefined}
          className={cx(styles.input, isInvalid && styles.invalid)}
          {...rest}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(event) => take(Array.from(event.target.files ?? []))}
        />
        <span className={styles.face} aria-hidden="true">
          {keyText}
        </span>
      </span>
      <span className={styles.hint}>{multiple ? wording.dropFiles : wording.dropFile}</span>
      {files.length > 0 && (
        <ul className={styles.list}>
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className={styles.file}>
              <span className={styles.name}>{file.name}</span>
              <span className={styles.size}>{sizeOf(file.size, formats)}</span>
              <button
                type="button"
                className={styles.remove}
                aria-label={wording.removeFile(file.name)}
                disabled={disabled}
                onClick={() => {
                  setRejected([]);
                  commit(files.filter((_, i) => i !== index));
                }}
              >
                <CrossGlyph />
              </button>
            </li>
          ))}
        </ul>
      )}
      {rejected.map((name) => (
        <p key={name} className={styles.rejected}>
          {wording.fileNotAccepted(name)}
        </p>
      ))}
    </div>
  );
});
