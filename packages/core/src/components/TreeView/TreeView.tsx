/* The tree as a control.

   What a node *says* belongs to the caller - symbols, counters, second lines
   stay possible. What makes it a node belongs to the tree: the row, the
   indentation, the chevron, the tick and the information for the screen
   reader. The table keeps it exactly this way with its cells.

   The accessibility layer is flat (ADR-0004): a sequence of `treeitem`s, each
   with its own level, its own position and its own sibling count. Nesting and
   virtualisation rule each other out, and the numbers therefore come from the
   flattening and never from what happens to stand in the document.

   The active node is communicated through the focus, not through
   `aria-selected`: `aria-selected` would again be the conflation of "where am
   I" and "what have I chosen" that ADR-0003 resolves. The tick speaks through
   `aria-checked` on the node itself; the visible checkbox is decoration while
   doing so and hidden from the screen reader, so that nothing is announced
   twice. */

import { useEffect, useId, useRef } from "react";
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { AngleGlyph } from "../../lib/glyphs";
import { Checkbox } from "../Checkbox";
import { Spinner } from "../Spinner";
import { useWording } from "../../lib/language";
import { idPart } from "../../lib/idPart";
import type { FlatteningEntry, Key } from "./treeModel";
import type { Tree } from "./useTree";
import styles from "./TreeView.module.css";

/** After this pause typeahead starts over. */
const TYPEAHEAD_PAUSE = 600;

export interface TreeViewProps<K, S extends Key = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The tree from `useTree`. It is the whole state: flattening, active node,
      checks, anchor. The view holds nothing beside it. */
  tree: Tree<K, S>;
  /** Required: the tree is a structure of its own and needs a name. */
  ariaLabel: string;
  /** Show ticks. Without them a tree remains that knows only an active node -
      and no space is kept free for them. */
  checkable?: boolean;
  /** What the node says. */
  children: (entry: FlatteningEntry<K, S>) => ReactNode;
}

export function TreeView<K, S extends Key = string>({
  tree,
  ariaLabel,
  checkable = false,
  children,
  className,
  onKeyDown,
  onFocus,
  onBlur,
  onScroll,
  ...rest
}: TreeViewProps<K, S>): ReactNode {
  const wording = useWording();
  /* Namespace of the box ids: two trees with the same keys would otherwise
     hand out the same id, and a click on the label of the second one would
     hit the box of the first (library-audit 04). */
  const idBase = useId();
  const rowWindow = tree.virtual;
  /* Virtualised, the root is at the same time the scroll area, and then its
     ref carries the window arithmetic - the table keeps it this way too.
     Otherwise its own. One ref, no assigning inside a ref callback. */
  const ownRef = useRef<HTMLDivElement | null>(null);
  const rootRef = rowWindow?.scrollRef ?? ownRef;
  /* The focus follows the active node only where it already lies inside the
     tree - otherwise a state change from outside would tear the focus away. */
  const hasFocus = useRef(false);
  /** The last seen reading of the reveal counter. */
  const revealed = useRef(0);
  /* The typeahead buffer - the only piece of state in this file, and
     deliberately as small as possible: one string and one timer. Everything
     with a decision in it stands in typeaheadTarget, where it can be checked
     without waiting. */
  const buffer = useRef("");
  const bufferTimer = useRef<number | null>(null);

  /* Bringing into view and focusing are two things, and only the second hangs
     on the focus - except on an explicit request.

     The active node is a key and not an element: if it lies outside the
     window, there is nothing to focus until the window has followed - and
     follow it must even when the tree does not have the focus at all, for
     instance because the active node was set from outside. The effect runs a
     second time after the window has followed and focuses then. */
  useEffect(() => {
    const root = rootRef.current;
    if (root === null || tree.active === null) return;
    if (rowWindow !== undefined) {
      const index = tree.flattening.findIndex((e) => e.key === tree.active);
      if (index >= 0 && (index < rowWindow.from || index >= rowWindow.to)) {
        rowWindow.showRow(index);
        return;
      }
    }
    // An explicit request "show me this node" is the opposite of an
    // incidental state change and may take the focus.
    const requested = tree.revealCount !== revealed.current;
    revealed.current = tree.revealCount;
    if (!hasFocus.current && !requested) return;
    const target = root.querySelector<HTMLElement>(
      `[data-key="${CSS.escape(String(tree.active))}"]`,
    );
    if (target !== null && target !== document.activeElement) target.focus();
  }, [tree.active, tree.flattening, tree.revealCount, rowWindow, rootRef]);

  useEffect(
    () => () => {
      if (bufferTimer.current !== null) window.clearTimeout(bufferTimer.current);
    },
    [],
  );

  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    /* The recommended model of the practice guideline, not the alternative
       one: the alternative reassigns the space key, and here that already
       checks. */
    if (checkable && e.key === "a" && (e.ctrlKey || e.metaKey)) {
      tree.toggleAll();
      e.preventDefault();
      return;
    }
    if (checkable && e.shiftKey && e.key === " " && tree.active !== null) {
      tree.checkTo(tree.active);
      e.preventDefault();
      return;
    }
    if (checkable && e.shiftKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      // Only this one gesture: moveAndCheck moves by itself. Calling move()
      // first would mean computing twice from the same stale snapshot - and
      // reporting the active node twice.
      tree.moveAndCheck(e.key === "ArrowDown" ? "down" : "up");
      e.preventDefault();
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        tree.move("down");
        break;
      case "ArrowUp":
        tree.move("up");
        break;
      case "ArrowRight":
        tree.move("in");
        break;
      case "ArrowLeft":
        tree.move("out");
        break;
      case "Home":
        tree.move("start");
        break;
      case "End":
        tree.move("end");
        break;
      case "Enter":
        if (tree.active !== null) tree.activate(tree.active);
        break;
      case " ":
        if (checkable && tree.active !== null) tree.toggleCheck(tree.active);
        break;
      default: {
        /* Typeahead: one printable character without a modifier. The space
           key is excepted - it checks, and a label that begins with a space
           does not exist. */
        if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey || e.key === " ") return;
        if (bufferTimer.current !== null) window.clearTimeout(bufferTimer.current);
        buffer.current += e.key;
        bufferTimer.current = window.setTimeout(() => {
          buffer.current = "";
          bufferTimer.current = null;
        }, TYPEAHEAD_PAUSE);
        tree.typeahead(buffer.current);
        break;
      }
    }
    e.preventDefault();
  };

  /* Exactly one tab stop for the whole tree. Without an active node the first
     entry carries it, so that the tree stays reachable at all. */
  const rendered =
    rowWindow === undefined
      ? tree.flattening
      : tree.flattening.slice(rowWindow.from, rowWindow.to);
  const tabStop =
    tree.active !== null && rendered.some((e) => e.key === tree.active)
      ? tree.active
      : rendered[0]?.key;

  return (
    <div
      ref={rootRef}
      role="tree"
      aria-label={ariaLabel}
      className={cx(styles.tree, rowWindow !== undefined && styles.scrolls, className)}
      {...rest}
      /* After `rest` and composed with the caller's, as `onKeyDown` already
         was: a caller's `onFocus` or `onBlur` used to replace the tracking the
         focus-follows-the-active-node rule hangs on, and an `onScroll` the
         row window. */
      onKeyDown={onKey}
      onScroll={(e) => {
        onScroll?.(e);
        rowWindow?.onScroll();
      }}
      onFocus={(e) => {
        onFocus?.(e);
        hasFocus.current = true;
      }}
      onBlur={(e) => {
        onBlur?.(e);
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hasFocus.current = false;
      }}
    >
      {rowWindow !== undefined && rowWindow.fillerBefore > 0 ? (
        <div aria-hidden="true" style={{ height: rowWindow.fillerBefore }} />
      ) : null}
      {rendered.map((entry) => {
        const expandable = entry.branch && !entry.empty;
        return (
          <div
            key={String(entry.key)}
            role="treeitem"
            data-key={String(entry.key)}
            data-row=""
            aria-level={entry.level + 1}
            aria-posinset={entry.position}
            aria-setsize={entry.siblings}
            aria-expanded={expandable ? entry.expanded : undefined}
            aria-checked={
              checkable ? (entry.indeterminate ? "mixed" : entry.checked) : undefined
            }
            /* Disabled is a statement about the checkbox. The node stays
               navigable and activatable (ADR-0005); what is announced is that
               its checked state is not available. */
            aria-disabled={checkable && entry.disabled ? true : undefined}
            tabIndex={entry.key === tabStop ? 0 : -1}
            className={cx(
              styles.row,
              entry.active && styles.active,
              entry.pathOnly && styles.pathOnly,
              checkable && entry.disabled && styles.disabled,
            )}
            style={{ "--tree-level": entry.level } as React.CSSProperties}
            onClick={() => tree.activate(entry.key)}
          >
            {expandable ? (
              <span
                aria-hidden="true"
                className={cx(styles.chevron, entry.expanded && styles.chevronOpen)}
                onClick={(e) => {
                  e.stopPropagation();
                  tree.toggleExpanded(entry.key);
                }}
              >
                <AngleGlyph />
              </span>
            ) : entry.empty ? (
              <span aria-hidden="true" className={styles.emptyDot} />
            ) : (
              <span aria-hidden="true" className={styles.placeholder} />
            )}

            {checkable ? (
              /* The span only keeps the click away from the row, so that
                 checking does not activate at the same time (ADR-0003).
                 Toggling happens exclusively through the box's onChange.

                 Doing both was a defect: the box lies inside a label, so a
                 click ran through both paths and toggled twice - in the
                 browser nothing happened at all. */
              <span className={styles.check} onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  id={`${idBase}-check-${idPart(String(entry.key))}`}
                  checked={entry.checked}
                  indeterminate={entry.indeterminate}
                  disabled={entry.disabled || entry.unloaded}
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={() => tree.toggleCheck(entry.key)}
                />
              </span>
            ) : null}

            <span className={styles.content}>{children(entry)}</span>
            {/* Open and still unloaded: something is yet to come. The state is
                derived and not owned – as soon as the caller adds the children
                and `unloaded` falls away, it disappears by itself. */}
            {entry.unloaded && entry.expanded ? (
              <Spinner size={12} className={styles.loading} />
            ) : null}
          </div>
        );
      })}
      {rowWindow !== undefined && rowWindow.fillerAfter > 0 ? (
        <div aria-hidden="true" style={{ height: rowWindow.fillerAfter }} />
      ) : null}
      {tree.flattening.length === 0 && tree.search.trim() !== "" ? (
        <p className={styles.noMatches}>{wording.treeNoMatches}</p>
      ) : null}
    </div>
  );
}
