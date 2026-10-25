/* The command palette: a window above the application in which one types and
   finds.

   Functionally it is deliberately small. One list, handed in as a property;
   every candidate can carry an action. No sources, no asynchrony, no preview,
   no calculator. Everything that is missing is reach - and none of it is
   visible.

   What it can do instead is the rest: search by subsequence and rank
   (`lib/search`), mark the matched characters, hold the mark while typing, not
   take the selection away from the pointer, and look like a window rather than
   a select field.

   It does NOT stand on `Popover`. That primitive is there for an ANCHORED
   surface, and its whole substance - anchor geometry, edge clamping, flipping
   upwards - is exactly what a centred window does not need. What it does need,
   the focus trap and the topmost layer, `popover-seam` deliberately left to the
   native <dialog>.

   It does not stand on `Modal` either. That is a sheet with a head, a body, a
   foot and three sizes; to parameterise it would mean letting one component
   carry two anatomies. What is shared instead is exactly the mechanics both
   need: `useDialogChoreography`. */

import { useEffect, useId, useRef, useState } from "react";
import type { DialogHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { mergeRefs } from "../../lib/mergeRefs";
import type { RefProp } from "../../lib/refProp";
import { useDialogChoreography } from "../../lib/dialogChoreography";
import { idPart } from "../../lib/idPart";
import { useWording } from "../../lib/language";
import { announce, silence } from "../../lib/announce";
import { CrossGlyph } from "../../lib/glyphs";
import { IconButton } from "../Button";
import { Row, rowId } from "./PaletteRow";
import { usePaletteFinds } from "./usePaletteFinds";
import { usePaletteGrowth } from "./usePaletteGrowth";
import { usePaletteKeys } from "./usePaletteKeys";
import { usePaletteMark } from "./usePaletteMark";
import styles from "./CommandPalette.module.css";

/** A candidate the palette can find - the outside of the term CONTEXT.md lists
    under "Finding" as a Candidate. */
export interface CommandPaletteItem {
  /** What is reported on choosing. */
  id: string;
  /** What is searched and displayed. */
  label: string;
  /** The heading the candidate stands under. It is searched as well. */
  group?: string;
  /**
   * The part of `group` that is searched, where not all of it should be: a
   * prefix every candidate of a set shares - `core · ` before `core · Inputs` -
   * would otherwise let its few letters find the whole set.
   *
   * @default the whole `group`
   */
  searchedGroup?: string;
  /** Optional glyph on the left of the row. */
  icon?: ReactNode;
  /**
   * Added to the rank. With it frequency or recency can be expressed - the
   * library deliberately keeps no memory for that.
   */
  weight?: number;
  /**
   * More words the candidate is found by, such as synonyms - searched but never
   * shown. Only when neither `label` nor `group` matched, only for a query of
   * three characters or more, and as a contiguous run, not as a subsequence. A
   * find through them stands behind every find in a label or a group and marks
   * nothing.
   */
  keywords?: readonly string[];
}

/** The props of `CommandPalette`. */
export interface CommandPaletteProps
  extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose" | "children">,
    RefProp<HTMLDialogElement> {
  /** Controlled like the modal: opening is the caller's decision. */
  open: boolean;
  /** Reports every wish to close - Escape, an outside click, a choice. */
  onClose: () => void;
  /** The candidates that are searched. They belong to the caller: the palette
      keeps no memory and does not reorder them. */
  items: readonly CommandPaletteItem[];
  /** Reports the `id` of the chosen candidate. What happens next is the
      caller's decision - that is exactly what keeps places and commands
      together. */
  onChoose: (id: string) => void;
  /**
   * What stands there as long as nothing is typed. Without a value: nothing,
   * and the window is only the field.
   *
   * A LIST and not a switch, because the interesting question is not "all or
   * none" but "which". Whoever really wants to show everything passes
   * `restingItems={items}`; whoever wants to show the five most recently used
   * passes those - and a switch cannot do that. With long lists "all" is also
   * exactly the state this component did away with: a list that is already
   * full can only shrink.
   *
   * The rows stand in THIS order and without marks: without a query there is
   * no rank and nothing to mark. Rank and weight therefore play no part here;
   * the order belongs to the caller.
   */
  restingItems?: readonly CommandPaletteItem[];
  /**
   * The most finds that stand at once - the best by rank. A last line says how
   * many more there are, and typing on narrows them. For a long list of
   * candidates, where a single letter finds hundreds and drawing them all
   * would make every keystroke wait.
   *
   * @default every find
   */
  maxFinds?: number;
}

/** A window above the application in which one types and finds: it searches
    `items` by subsequence, ranks and marks the matches, and reports the chosen
    candidate's `id` to `onChoose`. Controlled through `open` and `onClose`. */
export function CommandPalette({
  ref,
  open,
  onClose,
  items,
  onChoose,
  restingItems,
  maxFinds,
  className,
  onCancel,
  onMouseDown,
  onKeyDown: callerKeyDown,
  onKeyDownCapture,
  ...rest
}: CommandPaletteProps) {
  const wording = useWording();
  const baseId = useId();
  const listId = `${baseId}-list`;

  /* No exit (0ms). A window that lingers while taking its leave feels heavy;
     the modal's `--u-duration-exit` is right for a sheet of paper and wrong
     here. If the entrance next to it seems too hard, the entrance gets shorter
     and the exit does not get longer. */
  const { dialogRef, onDialogClose, onDialogCancel } = useDialogChoreography(open, 0, onClose);

  const fieldRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  const [query, setQuery] = useState("");

  const { searching, groups, order, moreFinds } = usePaletteFinds(items, restingItems, query, maxFinds);
  const { activeId, setHeld, keyboardTakesOver, pointerMoves, pointerSweeps } = usePaletteMark(order);

  /* ---------------------------------------------------------------- */
  /* Opening, focus, resting state                                     */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;
    /* Every opening starts in the resting state: an empty field, no rows. That
       is what makes the growth on the first keystroke visible at all. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");
    setHeld(null);
    keyboardTakesOver();
    fieldRef.current?.focus();
  }, [open, setHeld, keyboardTakesOver]);

  /* So that the screen reader learns what the typing left, without having to
     arrow through it - on every query, even one that changed nothing, and on
     opening where a resting list stands. Through the shared announcer, whose
     region is this dialog's own: the page behind a modal is inert and its
     regions are silent (listbox-announcements). */
  /* Every find counts, the ones beyond `maxFinds` too. */
  const count = order.length + moreFinds;
  useEffect(() => {
    if (!open) {
      silence();
      return;
    }
    if (!searching && count === 0) return;
    announce(count === 0 ? wording.paletteNoFinds : wording.paletteFindCount(count), fieldRef.current);
    /* Without `wording`: a caller's inline wording is a new object on every
       render of its parent, and each would count again over the find the
       arrow keys just named. A wording that changes while the palette
       stands is heard with the next letter. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query, searching, count]);

  /* The mark stays in view. `nearest` as in the combobox: that is the only
     value which does not shift half the list on every step. */
  useEffect(() => {
    if (activeId === null) return;
    /* Searched by id and not through a selector: the ids come from the caller
       and may contain anything a string may contain - an assembled attribute
       selector would have broken on that. */
    document.getElementById(rowId(baseId, activeId))?.scrollIntoView({ block: "nearest" });
  }, [activeId, baseId]);

  const { bodyRef, bodyHeight } = usePaletteGrowth(open);

  const onKeyDown = usePaletteKeys({ order, activeId, setHeld, keyboardTakesOver, fieldRef, onChoose, onClose });

  /* ---------------------------------------------------------------- */
  /* Presentation                                                      */
  /* ---------------------------------------------------------------- */

  /* Across BOTH lists: otherwise the icon column appears or disappears on the
     first keystroke, and the rows shift sideways. */
  const withIcons =
    items.some((item) => item.icon !== undefined) ||
    (restingItems ?? []).some((item) => item.icon !== undefined);

  return (
    <dialog
      ref={mergeRefs(dialogRef, ref)}
      className={cx(styles.dialog, className)}
      aria-label={wording.palettePanel}
      {...rest}
      /* After `rest` and composed with the caller's, as in `Modal` (P3 of
         core-passthrough). The caller's `onKeyDown` listens in the capture
         phase, as in `Combobox`: the keys land on the field inside, whose
         handler would otherwise run first. */
      onKeyDownCapture={(event) => {
        onKeyDownCapture?.(event);
        callerKeyDown?.(event);
      }}
      onClose={() => {
        /* Reports only a close the browser triggered - every gesture of its own
           has already called `onClose`. */
        onDialogClose();
        /* The focus goes back where it came from - and it does so HERE, in the
           close event, and not in the cleanup of an effect. React lets all
           cleanups run before all effect bodies; a cleanup would therefore
           still call focus() while the modal dialog is open and the page behind
           it inert, and the call would come to nothing. In the browser the
           platform has already reset it at this point anyway - the call then
           hits the same element. It stands there nonetheless: it is what keeps
           the promise should this surface one day no longer be a modal
           <dialog>, and it is the only part of this jsdom can observe. */
        (previouslyFocused.current as HTMLElement | null)?.focus?.();
      }}
      onCancel={(event) => {
        onCancel?.(event);
        if (!event.defaultPrevented) onDialogCancel(event);
      }}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        if (event.defaultPrevented) return;
        // The dialog is an invisible full-screen container; everything outside
        // the pane counts as the backdrop.
        if (!(event.target as HTMLElement).closest(`.${styles.pane}`)) onClose();
      }}
    >
      <div className={styles.pane}>
        {/* The cross is always in the markup; CSS shows it under a finger only. */}
        <div className={styles.head}>
          <input
            ref={fieldRef}
            type="text"
            className={styles.field}
            value={query}
            placeholder={wording.palettePlaceholder}
            aria-label={wording.paletteField}
            role="combobox"
            aria-expanded={order.length > 0}
            aria-controls={order.length > 0 ? listId : undefined}
            aria-activedescendant={activeId === null ? undefined : rowId(baseId, activeId)}
            autoComplete="off"
            enterKeyHint="go"
            spellCheck={false}
            onChange={(event) => {
              keyboardTakesOver();
              setQuery(event.target.value);
            }}
            onKeyDown={onKeyDown}
          />
          <IconButton size="sm" aria-label={wording.close} className={styles.close} onClick={onClose}>
            <CrossGlyph />
          </IconButton>
        </div>

        {/* Grows and shrinks with the number of finds. In the resting state it
            is zero high - the window is then only the field, and that is
            exactly what makes the growth on the first keystroke visible. */}
        <div className={styles.bodyWrap} style={{ height: `${bodyHeight}px` }}>
          <div ref={bodyRef} className={styles.body}>
            {/* The list stands there only if it contains something. An empty
                listbox is not an empty state but a broken one: the role
                promises a structure that does not exist. */}
            {order.length > 0 && (
              <div
                id={listId}
                role="listbox"
                aria-label={wording.paletteList}
                className={styles.list}
              >
                {groups.map((group) => {
                  const headingId = `${baseId}-group-${idPart(group.name ?? "")}`;
                  const rows = group.finds.map((item) => (
                    <Row
                      key={item.candidate.id}
                      find={item}
                      baseId={baseId}
                      active={item.candidate.id === activeId}
                      withIcon={withIcons}
                      onSweep={pointerSweeps}
                      onMove={pointerMoves}
                      onChoose={onChoose}
                    />
                  ));
                  if (group.name === undefined) return rows;
                  return (
                    <div key={group.name} role="group" aria-labelledby={headingId}>
                      <div id={headingId} className={styles.groupHeading}>
                        {group.name}
                      </div>
                      {rows}
                    </div>
                  );
                })}
              </div>
            )}

            {moreFinds > 0 && <p className={styles.moreFinds}>{wording.paletteMoreFinds(moreFinds)}</p>}

            {searching && order.length === 0 && (
              <p className={styles.noFinds}>{wording.paletteNoFinds}</p>
            )}

            {/* The foot belongs to the body and not to the pane: without
                `restingItems` the window in the resting state is ONLY the
                field, and a foot that already stands there would take away half
                the growth movement. It appears with the first keystroke - and
                therefore still before one needs any of the three keys.

                If the resting state is full, on the other hand, there is
                already something to move and to choose, and then the key
                legend belongs with it. Hence on the rows and not on the
                query. */}
            {(searching || order.length > 0) && (
              <footer className={styles.footer}>
                <span>
                  <kbd className={styles.key}>↑</kbd>
                  <kbd className={styles.key}>↓</kbd> {wording.paletteHintMove}
                </span>
                <span>
                  <kbd className={styles.key}>↵</kbd> {wording.paletteHintChoose}
                </span>
                <span>
                  <kbd className={styles.key}>{wording.paletteKeyEsc}</kbd> {wording.paletteHintClose}
                </span>
              </footer>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
