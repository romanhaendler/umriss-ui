/* One row of the palette's list, the id it carries, and the drawing of the
   matched characters in its name. */

import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import { idPart } from "../../lib/idPart";
import type { Find, MatchSpan } from "../../lib/search";
import type { PaletteCandidate } from "./usePaletteFinds";
import styles from "./CommandPalette.module.css";

/** The id of a row. A single IDREF and therefore readable raw as well - but one
    rule for all ids built from the caller's values is easier to keep than two. */
export const rowId = (baseId: string, id: string) => `${baseId}-${idPart(id)}`;

export function Row({
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
  const { candidate } = item;
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
      {candidate.heading !== undefined && <span className={styles.group}>{candidate.heading}</span>}
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
