/* The line between toolbar and header in server mode: with the page ticked and
   more rows behind it, the offer to select all that match; once they are
   selected, that said and the way back. A status, so a screen reader hears it
   appear. It stands only where it has something to say, so a page that is the
   whole set never gets it. */

import { Button, useFormats, useWording } from "@umriss-ui/core";
import type { HookSnapshot } from "./registryEntries";
import styles from "./Table.module.css";

export function MatchOffer({ hook }: { hook: HookSnapshot }) {
  const wording = useWording();
  const formats = useFormats();
  const { selection, rowCount, rows } = hook.publicSnapshot;
  const matching = selection.allMatching;
  const pageTicked = rows.length > 0 && rows.every((row) => selection.isSelected(hook.rowKey(row)));
  if (!matching && !(pageTicked && rowCount > rows.length)) return null;
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
