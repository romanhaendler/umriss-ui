/* The palette's candidates, the search over them, the resting state and the
   grouping of what is shown under headings - and the displayed order that the
   mark and the arrow keys run in. */

import { useMemo } from "react";
import type { ReactNode } from "react";
import { find } from "../../lib/search";
import type { Find } from "../../lib/search";
import type { CommandPaletteItem } from "./CommandPalette";

/* What the matcher needs (name, group, weight, keywords) and what the row needs (id,
   icon) - flat, and not with the caller's prop nested inside it. Otherwise
   every access would run through `find.candidate.entry.id`, and the caller
   would have smuggled fields past this point that are none of this component's
   business. The term is CANDIDATE: `Entry`, `item` and `entry` are on the
   glossary's avoidance list (CONTEXT.md, "Finding"). Only the prop is still
   called `items` - that is the outside.

   `group` is what is searched of the heading, `heading` the heading shown. */
export interface PaletteCandidate {
  name: string;
  group?: string;
  heading?: string;
  weight?: number;
  keywords?: readonly string[];
  id: string;
  icon?: ReactNode;
}

/** One heading with its finds below it. */
interface FindGroup {
  name: string | undefined;
  finds: Find<PaletteCandidate>[];
}

/** Reads the caller's prop into what the matcher and the row work with. */
function toCandidate(item: CommandPaletteItem): PaletteCandidate {
  return {
    name: item.label,
    group: item.searchedGroup ?? item.group,
    heading: item.group,
    weight: item.weight,
    keywords: item.keywords,
    id: item.id,
    icon: item.icon,
  };
}

export function usePaletteFinds(
  items: readonly CommandPaletteItem[],
  restingItems: readonly CommandPaletteItem[] | undefined,
  query: string,
  maxFinds: number | undefined,
) {
  const searching = query.trim() !== "";

  const candidates = useMemo(() => items.map(toCandidate), [items]);

  const finds = useMemo(() => find(candidates, query), [candidates, query]);

  /* The resting state carries no rank and no match spans: nothing has been
     searched for, so there is nothing to judge and nothing to mark. The rows
     stand in the caller's order. */
  const resting = useMemo<Find<PaletteCandidate>[]>(
    () =>
      (restingItems ?? []).map((item) => ({
        candidate: toCandidate(item),
        rank: 0,
        finds: [],
      })),
    [restingItems],
  );

  const shown = searching ? finds.slice(0, maxFinds) : resting;
  const moreFinds = searching ? finds.length - shown.length : 0;

  /* The finds stand by rank; they are displayed under their heading. A group
     appears where its best find stands - that way the best answer stays the
     first, and the list still has structure. */
  const groups = useMemo<FindGroup[]>(() => {
    const collected: FindGroup[] = [];
    for (const item of shown) {
      const name = item.candidate.heading;
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

  return { searching, groups, order, moreFinds };
}
