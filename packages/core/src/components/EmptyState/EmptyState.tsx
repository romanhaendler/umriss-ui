import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import styles from "./EmptyState.module.css";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** What is missing here - as a statement, not as an apology. */
  title: ReactNode;
  /** One sentence on why nothing is here and what would put something here. */
  description?: ReactNode;
  /** The way into the next action, e.g. a button. */
  action?: ReactNode;
  /** Optional symbol above the title. */
  icon?: ReactNode;
}

/** An empty surface as an invitation to act - not as a dead end. */
export function EmptyState({ title, description, action, icon, className, ...rest }: EmptyStateProps) {
  return (
    <div className={cx(styles.empty, className)} {...rest}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
