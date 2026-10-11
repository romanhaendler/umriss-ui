/* The palette's mark - which candidate is active - and who owns it, the
   keyboard or the pointer. */

import { useCallback, useRef, useState } from "react";
import type { Find } from "../../lib/search";
import type { PaletteCandidate } from "./usePaletteFinds";

export function usePaletteMark(order: readonly Find<PaletteCandidate>[]) {
  /* What is held is the id and not the index: while typing the list shrinks,
     and afterwards an index points at something else. That is exactly the
     promise that the mark stays on what one had already found. */
  const [held, setHeld] = useState<string | null>(null);

  /* Derived rather than stored: if the held candidate drops out of the list,
     the mark stands on the first and never on nothing. */
  const activeId =
    held !== null && order.some((f) => f.candidate.id === held)
      ? held
      : (order[0]?.candidate.id ?? null);

  /* ---------------------------------------------------------------- */
  /* Pointer against keyboard                                          */
  /* ---------------------------------------------------------------- */

  /* Prevents this: one types, the list gets shorter, another row slides
     under the resting mouse, one presses Enter - and lands somewhere other than
     where the arrow keys had shown.

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

  return { activeId, setHeld, keyboardTakesOver, pointerMoves, pointerSweeps };
}
