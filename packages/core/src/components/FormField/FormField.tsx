import { createContext, useContext, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import styles from "./FormField.module.css";

interface FormFieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  /** A required field. Every field whose role carries it turns this into
      `aria-required` - just as it does with `aria-describedby` and
      `aria-invalid`. */
  required: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/** Used by Input, Select and Checkbox to wire up id and aria automatically. */
export function useFormField(): FormFieldContextValue | null {
  return useContext(FormFieldContext);
}

/**
 * Resets the FormField context. For the innards of panels (search field,
 * option checkboxes) that are rendered through a portal inside a FormField:
 * without a boundary they inherit its field id - a click on an option label
 * then activates the field's trigger through htmlFor and closes the panel
 * again immediately.
 */
export function FormFieldBoundary({ children }: { children: ReactNode }) {
  return <FormFieldContext.Provider value={null}>{children}</FormFieldContext.Provider>;
}

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  /** The label of the field. It is mandatory: a field without a name is a
      field without a question for a screen reader. */
  label: ReactNode;
  /** Help text below the field. Replaced by `error`. */
  hint?: ReactNode;
  /** Error message; it marks the field as invalid at the same time. */
  error?: ReactNode;
  /** Sets the required mark on the label and `aria-required` on the field -
      on Input, Select, Textarea, NumberInput, Combobox, RadioGroup and
      Checkbox. The triggers of the pickers and of the MultiSelect are
      buttons, on which `aria-required` is not a permitted attribute; there
      the mark carries it alone. It validates nothing - validation belongs to
      the caller. */
  required?: boolean;
  /** Optional: a fixed id for the input element (instead of a generated
      one). */
  fieldId?: string;
}

export function FormField({
  label,
  hint,
  error,
  required = false,
  fieldId,
  className,
  children,
  ...rest
}: FormFieldProps) {
  const generatedId = useId();
  const id = fieldId ?? generatedId;
  const messageId = `${id}-message`;
  const hasMessage = Boolean(error ?? hint);

  return (
    <div className={cx(styles.field, className)} {...rest}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>
      <FormFieldContext.Provider
        value={{ id, describedBy: hasMessage ? messageId : undefined, invalid: Boolean(error), required }}
      >
        {children}
      </FormFieldContext.Provider>
      {hasMessage && (
        <p id={messageId} className={cx(styles.message, error ? styles.error : styles.hint)}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
