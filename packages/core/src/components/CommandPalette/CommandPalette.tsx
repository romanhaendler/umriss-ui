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

import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { DialogHTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { mergeRefs } from "../../lib/mergeRefs";
import { useDialogChoreography } from "../../lib/dialogChoreography";
import { idPart } from "../../lib/idPart";
import { nextIndex } from "../../lib/options";
import { useWording } from "../../lib/language";
import { find } from "../../lib/search";
import type { Find, MatchSpan } from "../../lib/search";
import { VisuallyHidden } from "../VisuallyHidden";
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
  /** Optional glyph on the left of the row. */
  icon?: ReactNode;
  /**
   * Added to the rank. With it frequency or recency can be expressed - the
   * library deliberately keeps no memory for that.
   */
  weight?: number;
}

export interface CommandPaletteProps
  extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose" | "children"> {
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
}

/** Translates the caller's prop into what the matcher and the row work with. */
function toCandidate(item: CommandPaletteItem): PaletteCandidate {
  return {
    name: item.label,
    gruppe: item.group,
    gewicht: item.weight,
    id: item.id,
    icon: item.icon,
  };
}

/* What the matcher needs (name, gruppe, gewicht) and what the row needs (id,
   icon) - flat, and not with the caller's prop nested inside it. Otherwise
   every access would run through `find.kandidat.eintrag.id`, and the caller
   would have smuggled fields past this point that are none of this component's
   business. The term is CANDIDATE: `Eintrag`, `item` and `entry` are on the
   glossary's avoidance list (CONTEXT.md, "Finding"). Only the prop is still
   called `items` - that is the outside.

   `gruppe` and `gewicht` keep their spelling because `lib/search` reads them
   under those names: the matcher's `Candidate` is its contract, not this
   component's. */
interface PaletteCandidate {
  name: string;
  gruppe?: string;
  gewicht?: number;
  id: string;
  icon?: ReactNode;
}

/** One heading with its finds below it. */
interface FindGroup {
  name: string | undefined;
  finds: Find<PaletteCandidate>[];
}

export const CommandPalette = forwardRef<HTMLDialogElement, CommandPaletteProps>(function CommandPalette(
  {
    open,
    onClose,
    items,
    onChoose,
    restingItems,
    className,
    onCancel,
    onMouseDown,
    onKeyDown: callerKeyDown,
    onKeyDownCapture,
    ...rest
  },
  ref,
) {
  const wording = useWording();
  const baseId = useId();
  const listId = `${baseId}-list`;

  /* No exit (0ms). A window that lingers while taking its leave feels heavy;
     the modal's `--u-duration-exit` is right for a sheet of paper and wrong
     here. If the entrance next to it seems too hard, the entrance gets shorter
     and the exit does not get longer. */
  const { dialogRef, beimSchliessen, beimAbbrechen } = useDialogChoreography(open, 0, onClose);

  const fieldRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  const [query, setQuery] = useState("");
  /* What is held is the id and not the index: while typing the list shrinks,
     and afterwards an index points at something else. That is exactly the
     promise that the mark stays on what one had already found. */
  const [held, setHeld] = useState<string | null>(null);

  /* ---------------------------------------------------------------- */
  /* Finding                                                           */
  /* ---------------------------------------------------------------- */

  const searching = query.trim() !== "";

  const candidates = useMemo(() => items.map(toCandidate), [items]);

  const finds = useMemo(() => find(candidates, query), [candidates, query]);

  /* The resting state carries no rank and no match spans: nothing has been
     searched for, so there is nothing to judge and nothing to mark. The rows
     stand in the caller's order. */
  const resting = useMemo<Find<PaletteCandidate>[]>(
    () =>
      (restingItems ?? []).map((item) => ({
        kandidat: toCandidate(item),
        rank: 0,
        finds: [],
      })),
    [restingItems],
  );

  const shown = searching ? finds : resting;

  /* The finds stand by rank; they are displayed under their heading. A group
     appears where its best find stands - that way the best answer stays the
     first, and the list still has structure. */
  const groups = useMemo<FindGroup[]>(() => {
    const collected: FindGroup[] = [];
    for (const item of shown) {
      const name = item.kandidat.gruppe;
      let group = collected.find((g) => g.name === name);
      if (group === undefined) {
        group = { name, finds: [] };
        collected.push(group);
      }
      group.finds.push(item);
    }
    return collected;
  }, [shown]);

  /* The order in which the arrow keys run is the DISPLAYED one and not that of
     the rank - otherwise the mark visibly jumps about. Headings do not appear
     in it, so that "down" always lands on something choosable. */
  const order = useMemo(() => groups.flatMap((g) => g.finds), [groups]);

  /* Derived rather than stored: if the held candidate drops out of the list,
     the mark stands on the first and never on nothing. */
  const activeId =
    held !== null && order.some((f) => f.kandidat.id === held)
      ? held
      : (order[0]?.kandidat.id ?? null);

  /* ---------------------------------------------------------------- */
  /* Pointer against keyboard                                          */
  /* ---------------------------------------------------------------- */

  /* The bug this prevents: one types, the list gets shorter, another row slides
     under the resting mouse, one presses Enter - and lands somewhere other than
     where the arrow keys had shown. It has no name while it is happening, and
     it is the difference between a palette that works and one that feels
     right. Today's palette in the demo escapes it only because it has no
     pointer behaviour at all - and that is what this component takes off its
     hands.

     The rule: the mark has an owner. The keyboard takes it on every arrow key
     and on every change of the query. The pointer takes it only on
     `pointermove`, that is, when it has really moved - and expressly NOT on
     `pointerenter`, because that fires even when the row is repainted under a
     motionless pointer.

     A reader who has never experienced the bug takes this for a superfluous
     safeguard and deletes it. That is why it is written out here in full and
     not as "because of the pointer". */
  const pointerHoldsTheMark = useRef(false);

  const keyboardTakesOver = useCallback(() => {
    pointerHoldsTheMark.current = false;
  }, []);

  /** A real movement. It takes the mark and sets it in one go. */
  const pointerMoves = useCallback((id: string) => {
    pointerHoldsTheMark.current = true;
    setHeld(id);
  }, []);

  /** Mere sweeping over. It counts only if the pointer already has the mark. */
  const pointerSweeps = useCallback((id: string) => {
    if (pointerHoldsTheMark.current) setHeld(id);
  }, []);

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
    pointerHoldsTheMark.current = false;
    fieldRef.current?.focus();
  }, [open]);

  /* The mark stays in view. `nearest` as in the combobox: that is the only
     value which does not shift half the list on every step. */
  useEffect(() => {
    if (activeId === null) return;
    /* Searched by id and not through a selector: the ids come from the caller
       and may contain anything a string may contain - an assembled attribute
       selector would have broken on that. */
    document.getElementById(rowId(baseId, activeId))?.scrollIntoView({ block: "nearest" });
  }, [activeId, baseId]);

  /* ---------------------------------------------------------------- */
  /* Growing                                                          */
  /* ---------------------------------------------------------------- */

  /* The height is measured and set as a number, so that `transition` can travel
     towards it. A keyframe animation would be wrong here: it starts again from
     the beginning on every keystroke, and `tab`, `tabe`, `tabel` then reads as
     three jerks instead of one settling. A transition aims from the current
     value.

     It is measured through a ResizeObserver and not in a layout effect with
     `[open, query, ...]` as dependencies. The reason is an order one cannot
     see: `showModal()` runs in the choreography's passive effect, whereas a
     layout effect runs before it - so it would measure a dialog that is still
     `display: none` and would get zero.

     As long as the resting state was always empty, zero happened to be the
     right answer, and the bug stayed invisible. With `restingItems` the window
     opened and remained a strip: the rows stood in the tree and had no height.
     The observer hangs on what really counts - the size of the content - and
     thereby manages without that knowledge too. */
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyHeight, setBodyHeight] = useState(0);

  useEffect(() => {
    const body = bodyRef.current;
    if (!open || body === null) return;
    /* This stands after the choreography: the dialog is already open here, so
       the first measurement is usable. The observer takes over everything else -
       typing, fonts loaded later, longer labels. */
    setBodyHeight(body.offsetHeight);
    const observer = new ResizeObserver(() => setBodyHeight(body.offsetHeight));
    observer.observe(body);
    return () => observer.disconnect();
  }, [open]);

  /* ---------------------------------------------------------------- */
  /* Keyboard                                                          */
  /* ---------------------------------------------------------------- */

  const move = (direction: 1 | -1) => {
    keyboardTakesOver();
    if (order.length === 0) return;
    const current = order.findIndex((f) => f.kandidat.id === activeId);
    const next = nextIndex(current === -1 ? 0 : current, order.length, direction);
    setHeld(order[next]!.kandidat.id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // An input method's own keys (Enter ends the composition) are not ours.
    if (event.nativeEvent.isComposing || event.defaultPrevented) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (activeId !== null) onChoose(activeId);
      return;
    }
    if (event.key === "Escape") {
      /* Here too and not only through `cancel`: what this prevents is the
         second way, not the first - whoever cancels shall close exactly
         once. */
      event.preventDefault();
      onClose();
    }
  };

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
        beimSchliessen();
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
        if (!event.defaultPrevented) beimAbbrechen(event);
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
          spellCheck={false}
          onChange={(event) => {
            keyboardTakesOver();
            setQuery(event.target.value);
          }}
          onKeyDown={onKeyDown}
        />

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
                      key={item.kandidat.id}
                      find={item}
                      baseId={baseId}
                      active={item.kandidat.id === activeId}
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

        {/* So that the screen reader learns that the typing has shortened the
            list, without having to arrow through it. */}
        <VisuallyHidden role="status" aria-live="polite">
          {searching ? wording.paletteFindCount(order.length) : ""}
        </VisuallyHidden>
      </div>
    </dialog>
  );
});

/* ------------------------------------------------------------------ */
/* One row                                                             */
/* ------------------------------------------------------------------ */

/** The id of a row. A single IDREF and therefore readable raw as well - but one
    rule for all ids built from the caller's values is easier to keep than two
    (library-audit 04). */
const rowId = (baseId: string, id: string) => `${baseId}-${idPart(id)}`;

function Row({
  find: item,
  baseId,
  active,
  withIcon,
  onSweep,
  onMove,
  onChoose,
}: {
  find: Find<PaletteCandidate>;
  baseId: string;
  active: boolean;
  withIcon: boolean;
  onSweep: (id: string) => void;
  onMove: (id: string) => void;
  onChoose: (id: string) => void;
}) {
  const { kandidat: candidate } = item;
  return (
    <div
      id={rowId(baseId, candidate.id)}
      role="option"
      aria-selected={active}
      className={cx(styles.row, active && styles.rowActive)}
      onPointerEnter={() => onSweep(candidate.id)}
      onPointerMove={() => onMove(candidate.id)}
      onMouseDown={(event) => {
        // mousedown instead of click: the focus shall not leave the field first.
        event.preventDefault();
        // Only the main button chooses - whoever wants the context menu has not chosen.
        if (event.button !== 0) return;
        onChoose(candidate.id);
      }}
    >
      {withIcon && (
        <span className={styles.icon} aria-hidden="true">
          {candidate.icon}
        </span>
      )}
      <span className={styles.name}>{highlight(candidate.name, item.finds)}</span>
      {candidate.gruppe !== undefined && <span className={styles.group}>{candidate.gruppe}</span>}
    </div>
  );
}

/** Draws the matched characters in the accent. Without that a find which no
    substring explains looks like chance instead of like a reason. */
function highlight(name: string, spans: readonly MatchSpan[]): ReactNode {
  if (spans.length === 0) return name;
  const parts: ReactNode[] = [];
  let cursor = 0;
  spans.forEach((span, i) => {
    if (span.from > cursor) parts.push(name.slice(cursor, span.from));
    parts.push(
      <span className={styles.mark} key={i}>
        {name.slice(span.from, span.to)}
      </span>,
    );
    cursor = span.to;
  });
  if (cursor < name.length) parts.push(name.slice(cursor));
  return parts;
}
