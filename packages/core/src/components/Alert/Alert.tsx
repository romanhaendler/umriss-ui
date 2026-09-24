/* A message that stays put.

   The point of it: the toast is fleeting and sits in the bottom right corner -
   right for "saved", wrong for "this view shows data from the twelfth" or for
   the summary of what went wrong in a form. There was nothing for that, and
   every application built its own coloured surface.

   The role follows the tone, not the caller: warning and danger interrupt the
   screen reader, the others do not. Whoever were allowed to decide that would
   decide it wrongly at some point. */

import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import styles from "./Alert.module.css";
import { useWording } from "../../lib/language";
import { CrossGlyph } from "../../lib/glyphs";
import { roleFromTone } from "../../lib/roleFromTone";

export type AlertTone = "neutral" | "accent" | "success" | "warning" | "danger";

/* `title` shadows the HTML attribute of the same name - the same omission as
   on CardHeader, so that the heading can take arbitrary nodes. */
export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** How urgent the message is. Only `warning` and `danger` interrupt the
      screen reader - the other two report politely. */
  tone?: AlertTone;
  /** Heading; without it the body text carries the message on its own. */
  title?: ReactNode;
  /** Actions below the text, e.g. "Try again". */
  actions?: ReactNode;
  /** Shows a dismiss cross and calls this. */
  onDismiss?: () => void;
  /** Label of the dismiss cross; default the wording's "Close message". */
  dismissLabel?: string;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = "neutral", title, actions, onDismiss, dismissLabel, className, children, ...rest },
  ref,
) {
  const wording = useWording();
  const { role, live } = roleFromTone[tone];

  return (
    <div
      ref={ref}
      role={role}
      aria-live={live}
      className={cx(styles.alert, styles[tone], className)}
      {...rest}
    >
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.text}>{children}</div>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {onDismiss && (
        <button type="button" aria-label={dismissLabel ?? wording.closeToast} className={styles.close} onClick={onDismiss}>
          <CrossGlyph />
        </button>
      )}
    </div>
  );
});
