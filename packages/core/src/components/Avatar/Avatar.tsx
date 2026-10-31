import { useState } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import type { RefProp } from "../../lib/refProp";
import styles from "./Avatar.module.css";

/** The size of an avatar: `sm` for a table cell, `md` for a lane's header. */
export type AvatarSize = "sm" | "md";

/** The props of `Avatar`. */
export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children">, RefProp<HTMLSpanElement> {
  /** The person's or the team's name: it names the mark for a screen reader
      and the initials are derived from it. */
  name: string;
  /** A picture. When it fails to load, the initials stand in its place. */
  src?: string;
  /** The letters shown when there is no picture.
      @default the first letters of the first and the last word of `name` */
  initials?: string;
  /** `sm` for a table cell, `md` for a lane's header. */
  size?: AvatarSize;
}

/* The first letter of the first and of the last word, upper case; one word
   gives one letter. */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letter = (word: string) => Array.from(word)[0]?.toLocaleUpperCase() ?? "";
  return words.length < 2 ? letter(words[0] ?? "") : letter(words[0]!) + letter(words[words.length - 1]!);
}

/** A mark for a person or a team: a picture, or initials. */
export function Avatar({ ref, name, src, initials, size = "md", className, ...rest }: AvatarProps) {
  /* The address that failed, not a flag: a new picture gets its own try. */
  const [failed, setFailed] = useState<string>();
  const picture = src !== undefined && src !== failed;
  /* The same name gets the same ground wherever it stands. */
  const tone = Array.from(name).reduce((sum, c) => sum + c.codePointAt(0)!, 0) % 2 === 0 ? styles.neutral : styles.accent;
  return (
    <span ref={ref} role="img" aria-label={name} className={cx(styles.avatar, styles[size], tone, className)} {...rest}>
      {picture ? (
        <img className={styles.image} src={src} alt="" onError={() => setFailed(src)} />
      ) : (
        <span aria-hidden="true">{initials ?? initialsOf(name)}</span>
      )}
    </span>
  );
}
