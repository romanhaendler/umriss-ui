/* The line between toolbar and header in server mode: with the page ticked and
   more rows behind it, the offer to select all that match; once they are
   selected, that said and the way back. A status, so a screen reader hears it
   appear. It stands only where it has something to say, so a page that is the
   whole set never gets it - unless `reserve` holds its place: a fitted page is
   cut to the room under the toolbar, and a line that came with a tick would
   take a row from it. */

import { Button, useFormats, useWording } from "@umriss-ui/core";
import type { HookSnapshot } from "./registryEntries";
import { cx } from "./cx";
import styles from "./Table.module.css";

export function MatchOffer({ hook, reserve }: { hook: HookSnapshot; reserve: boolean }) {
  const wording = useWording();
  const formats = useFormats();
  const { selection, rowCount, rows } = hook.publicSnapshot;
  const matching = selection.allMatching;
  const pageTicked = rows.length > 0 && rows.every((row) => selection.isSelected(hook.rowKey(row)));
  if (!matching && !(pageTicked && rowCount > rows.length)) {
    return reserve ? <div role="status" className={cx(styles.matchOffer, styles.matchReserved)} /> : null;
  }
  const left = rowCount - selection.except.size;
  return (
    <div role="status" data-select-matching className={styles.matchOffer}>
      {matching ? (
        <>
          {wording.allMatchingSelected(left, formats.count(left))}
          <Button size="sm" variant="ghost" onClick={selection.clear}>
            {wording.clearSelection}
          </Button>
        </>
      ) : (
        <>
          {wording.selectedOnPage(rows.length, formats.count(rows.length))}
          <Button size="sm" variant="ghost" onClick={selection.selectMatching}>
            {wording.selectAllMatching(rowCount, formats.count(rowCount))}
          </Button>
        </>
      )}
    </div>
  );
}
