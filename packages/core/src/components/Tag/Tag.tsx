/* Removable label.

   One sits ready-made inside the MultiSelect - reachable only if one uses a
   MultiSelect. Here it stands for itself: filter bars, chosen values,
   assignments.

   Delimitation from the badge: the badge is a statement about a state and is
   not operable. The tag is a control.

   Operation within the group: exactly one tab stop for the whole group, arrow
   keys travel, Delete and Backspace remove. After removing, the focus travels
   to the neighbour - otherwise it falls back to the start of the page. */

import { createContext, forwardRef, useCallback, useContext, useEffect, useRef } from "react";
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { cx } from "../../lib/cx";
import styles from "./Tag.module.css";
import { useWording } from "../../lib/language";

export type TagTone = "neutral" | "accent" | "success" | "warning" | "danger";

/* The context carries no state: the tag only asks whether it stands inside a
   group. On that depends whether it reports itself as a list entry and who
   manages its tab stop – inside the group, the group does. */
const TagGroupContext = createContext<boolean>(false);

/* ------------------------------------------------------------------ */
/* TagGroup – roving tabindex across the tags                          */
/* ------------------------------------------------------------------ */

export interface TagGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Label of the group for the screen reader. */
  "aria-label": string;
}

export const TagGroup = forwardRef<HTMLDivElement, TagGroupProps>(function TagGroup(
  { className, children, onKeyDown, onFocus, ...rest },
  ref,
) {
  const groupRef = useRef<HTMLDivElement>(null);

  const tags = useCallback(
    () => Array.from(groupRef.current?.querySelectorAll<HTMLElement>("[data-tag]") ?? []),
    [],
  );

  /* Exactly one tab stop for the whole group. Without it, a bar with five
     filters would be five stops in the tab order – the reason the group
     exists at all.

     It is managed on the DOM and not through a state per tag: the group does
     not know its children, and a registration per tag would be a lot of
     machinery for one number. */
  const setTabStop = useCallback(
    (active: HTMLElement | undefined) => {
      const all = tags();
      const target = active ?? all[0];
      for (const tag of all) {
        tag.tabIndex = tag === target ? 0 : -1;
      }
    },
    [tags],
  );

  // After every pass: a newly added tag must not stand at 0.
  useEffect(() => {
    const all = tags();
    const alreadyActive = all.find((tag) => tag.tabIndex === 0);
    setTabStop(alreadyActive);
  });

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    const containing = tags().find((tag) => tag.contains(event.target));
    if (containing) setTabStop(containing);
  };

  /* The navigation reads the tags out of the DOM instead of out of a list:
     that way the order is right even when the caller re-sorts them in
     between. */
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const all = tags();
    if (all.length === 0) return;
    const index = all.findIndex((tag) => tag.contains(document.activeElement));
    if (index === -1) return;

    const moveTo = (target: HTMLElement | undefined) => {
      if (!target) return;
      event.preventDefault();
      setTabStop(target);
      target.focus();
    };

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      moveTo(all[(index + 1) % all.length]);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      moveTo(all[(index - 1 + all.length) % all.length]);
    } else if (event.key === "Home") {
      moveTo(all[0]);
    } else if (event.key === "End") {
      moveTo(all[all.length - 1]);
    }
  };

  return (
    <div
      ref={(element) => {
        groupRef.current = element;
        if (typeof ref === "function") ref(element);
        else if (ref) ref.current = element;
      }}
      role="list"
      className={cx(styles.group, className)}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      {...rest}
    >
      <TagGroupContext.Provider value={true}>{children}</TagGroupContext.Provider>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Tag                                                                 */
/* ------------------------------------------------------------------ */

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "onRemove"> {
  /** What the label stands for. The tone is never the only information: the
      text beside it says the same thing once more. */
  tone?: TagTone;
  /** The text of the label – short enough to stand on one line. */
  children: ReactNode;
  /** Makes the tag removable. Without this it is a pure label. */
  onRemove?: () => void;
  /**
   * Label of the remove key. Needed as soon as the content is not text –
   * no sentence can be formed out of a node.
   */
  removeLabel?: string;
  /** Takes the remove key away from the tag without hiding it: disabled is a
      statement about the key and not about the label. */
  disabled?: boolean;
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { tone = "neutral", children, onRemove, removeLabel, disabled = false, className, onKeyDown, ...rest },
  ref,
) {
  const inGroup = useContext(TagGroupContext);
  const wording = useWording();
  const removable = Boolean(onRemove) && !disabled;

  /* A label can only be derived from text. With anything else, "[object
     Object] entfernen" would stand there – then it is better to name the key
     alone after its function and let the caller be more precise through
     `removeLabel`. */
  const label =
    removeLabel ??
    (typeof children === "string" ? wording.removeTag(children) : wording.remove);

  /* Focus the neighbour after removing, otherwise the focus falls to the
     start of the page - the most frequent mistake with removable lists. */
  const removeWithFocus = (element: HTMLElement | null) => {
    if (!element) {
      onRemove?.();
      return;
    }
    const group = element.closest('[role="list"]');
    const tags = Array.from(group?.querySelectorAll<HTMLElement>("[data-tag]") ?? []);
    const index = tags.indexOf(element);
    const neighbour = tags[index + 1] ?? tags[index - 1];
    onRemove?.();
    if (neighbour) requestAnimationFrame(() => neighbour.focus());
  };

  /* Composed with the caller's, as the group does it: `rest` used to replace
     it, and Delete and Backspace removed nothing any more. */
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !removable) return;
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      removeWithFocus(event.currentTarget);
    }
  };

  return (
    <span
      ref={ref}
      data-tag={removable ? "" : undefined}
      role={inGroup ? "listitem" : undefined}
      /* Being switched off was only a class so far. With that, the statement
         in the accessibility tree was missing - and the contrast rule read the
         pale text as an error, because nothing stood there that marked it as
         inactive. */
      aria-disabled={disabled || undefined}
      /* Inside the group, the group manages the tab stop – here stands only
         the initial value, so that nothing blinks before the first effect. */
      tabIndex={removable ? (inGroup ? -1 : 0) : undefined}
      className={cx(
        styles.tag,
        styles[tone],
        removable && styles.removable,
        disabled && styles.disabled,
        className,
      )}
      {...rest}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.text}>{children}</span>
      {removable && (
        <button
          type="button"
          // The tag itself carries the tab stop; the key is the gesture for it
          // and would only be in the way as a second stop.
          tabIndex={-1}
          aria-label={label}
          className={styles.remove}
          onClick={(event) => {
            event.stopPropagation();
            removeWithFocus(event.currentTarget.closest("[data-tag]") as HTMLElement | null);
          }}
        >
          <svg viewBox="0 0 10 10" width="8" height="8" aria-hidden="true">
            <path
              d="M1.6 1.6l6.8 6.8M8.4 1.6L1.6 8.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
});
