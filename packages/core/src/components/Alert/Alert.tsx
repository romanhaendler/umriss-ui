/* A message that stays put in the page, where a toast would carry it away.
   The role follows the tone, not the caller: warning and danger interrupt the
   screen reader, the others do not. */

import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import type { RefProp } from "../../lib/refProp";
import styles from "./Alert.module.css";
import { useWording } from "../../lib/language";
import { CrossGlyph } from "../../lib/glyphs";
import { roleFromTone } from "../../lib/roleFromTone";

/** How urgent an alert is; it also decides whether a screen reader is
    interrupted. */
export type AlertTone = "neutral" | "accent" | "success" | "warning" | "danger";

/* `title` shadows the HTML attribute of the same name - the same omission as
   on CardHeader, so that the heading can take arbitrary nodes. */
/** The props of `Alert`: a div's attributes, with `title` taking a heading
    node instead of the HTML attribute. */
export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title">, RefProp<HTMLDivElement> {
  /** How urgent the message is. Only `warning` and `danger` interrupt the
      screen reader - the other two report politely. */
  tone?: AlertTone;
  /** Heading; without it the body text carries the message on its own. */
  title?: ReactNode;
  /** Actions below the text, e.g. "Try again". */
  actions?: ReactNode;
  /** Shows a dismiss cross and calls this. */
  onDismiss?: () => void;
  /** Label of the dismiss cross.
      @default the wording's "Close message" */
  dismissLabel?: string;
}

/** A message that stays put in the page - for what a toast would carry away
    too soon. Warning and danger interrupt the screen reader, the other tones
    report politely. */
export function Alert({ ref, tone = "neutral", title, actions, onDismiss, dismissLabel, className, children, ...rest }: AlertProps) {
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
}
