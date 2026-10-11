/* The palette's keyboard handling on the field: the arrow keys move the mark
   and announce it, Enter chooses, Escape closes. */

import type { KeyboardEvent, RefObject } from "react";
import { nextIndex } from "../../lib/options";
import { useWording } from "../../lib/language";
import { announce } from "../../lib/announce";
import type { Find } from "../../lib/search";
import type { PaletteCandidate } from "./usePaletteFinds";

export function usePaletteKeys({
  order,
  activeId,
  setHeld,
  keyboardTakesOver,
  fieldRef,
  onChoose,
  onClose,
}: {
  order: readonly Find<PaletteCandidate>[];
  activeId: string | null;
  setHeld: (id: string) => void;
  keyboardTakesOver: () => void;
  fieldRef: RefObject<HTMLInputElement | null>;
  onChoose: (id: string) => void;
  onClose: () => void;
}) {
  const wording = useWording();

  const move = (direction: 1 | -1) => {
    keyboardTakesOver();
    if (order.length === 0) return;
    const current = order.findIndex((f) => f.candidate.id === activeId);
    const next = order[nextIndex(current === -1 ? 0 : current, order.length, direction)]!.candidate;
    setHeld(next.id);
    /* VoiceOver reads neither the active descendant's group nor, often, the
       row itself (listbox-announcements); a row here is never "selected" - its
       `aria-selected` is the mark. */
    announce(wording.optionActive(next.name, { group: next.group }), fieldRef.current);
  };

  return (event: KeyboardEvent<HTMLInputElement>) => {
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
}
