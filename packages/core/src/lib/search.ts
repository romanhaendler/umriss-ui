/* The command palette's matcher: what fits a query, how well, and in which
   places. Pure functions, no React, no DOM - the same pattern as `options.ts`
   beside it.

   It matches as a subsequence, not as a substring: `dtp` finds
   `DateTimePicker`. That is the whole reason this module exists. A substring
   can be checked with `includes` in one line, but it demands that a person
   type the name the way it is written - and that is exactly what one does not
   know while searching.

   The formula below (bonuses, costs) is an INTERNAL decision. What is public
   is the order it produces, and that order is written out by name in
   tests-unit/search.test.ts. Whoever touches the numbers changes no promise -
   whoever changes the order does. */

/** A half-open run of characters in a candidate's name. */
export interface MatchSpan {
  /** Index into `name`, inclusive. */
  from: number;
  /** Index into `name`, exclusive. */
  to: number;
}

/** A candidate that matched the query - with its rank and its match spans. */
export interface Find<K> {
  kandidat: K;
  rank: number;
  /** Empty for a group-only find: there is then nothing to mark in the name,
      and marking something would be a lie. */
  finds: readonly MatchSpan[];
}

/** What the matcher needs from a candidate. Everything else belongs to the caller. */
export interface Candidate {
  name: string;
  /** Searched as well, so that "struktur" finds what lies under the heading. */
  gruppe?: string;
  /**
   * Added to the rank last. With it an application can express frequency or
   * recency; the library keeps no memory of its own.
   */
  gewicht?: number;
}

/* ------------------------------------------------------------------ */
/* The formula                                                         */
/* ------------------------------------------------------------------ */

/** A character sitting at the start of a word. The strongest of the three
    bonuses: it is what makes abbreviations like `dtp` meaningful at all. */
const GRENZE_BONUS = 10;

/** A character immediately after the previous one. Closer together is better. */
const RUN_BONUS = 8;

/** Cost per character the query did not hit. They are the reason the shorter
    name comes first when two names begin alike - in the demo, `Table` before
    `TableFilterStrip`.

    Why half a point and not a whole one: the cost is meant to decide between
    names of EQUAL quality, not to overtake a real difference in quality. With
    1 it did exactly that - noticed in the demo: `dtp` put "DateRangePicker"
    (two word starts, 15 characters) ahead of "DatePicker and DateTimePicker"
    (three word starts, 29 characters), because fourteen characters of length
    outweighed a whole word start. A name the query hits on every word start is
    the better answer, even when it is longer. The test for it names exactly
    this case. */
const COST_PER_CHARACTER = 0.5;

const IS_WORD_CHARACTER = /[\p{L}\p{N}]/u;

const isUpper = (character: string): boolean =>
  character !== character.toLowerCase() && character === character.toUpperCase();

const isLower = (character: string): boolean =>
  character !== character.toUpperCase() && character === character.toLowerCase();

/**
 * Is there a word start at this place? Three cases: the beginning of the name,
 * the place after a separator, and the change from lower case to upper case.
 * The third is the one that splits `DateTimePicker` into `Date`, `Time` and
 * `Picker` without a space standing anywhere.
 */
function isWordStart(name: string, position: number): boolean {
  if (position === 0) return true;
  const before = name[position - 1]!;
  const here = name[position]!;
  if (!IS_WORD_CHARACTER.test(before)) return true;
  return isLower(before) && isUpper(here);
}

/* ------------------------------------------------------------------ */
/* One name against one query                                          */
/* ------------------------------------------------------------------ */

/** The result for a single name - without the candidate carrying it. */
export interface NameFind {
  rank: number;
  finds: readonly MatchSpan[];
}

/**
 * Searches for the query in a name and returns rank and match spans.
 * `null` when not every character of the query occurs in the name in order -
 * and `null` for an empty query too: an empty field is not a query that
 * matches everything, but one that matches nothing.
 *
 * It is computed exhaustively, not greedily. The obvious loop, which pins each
 * query character to the first place that fits, finds in `DateTimePicker` for
 * `dtp` the first `t` in "Date" instead of the `T` of "Time" - and so gives
 * away the bonus this module exists for. Hence the small pass over all places:
 * names are short, queries shorter, and completeness costs nothing here.
 */
export function findInName(term: string, name: string): NameFind | null {
  const wanted = term.trim().toLowerCase();
  if (wanted === "") return null;
  if (wanted.length > name.length) return null;

  const lowerName = name.toLowerCase();

  /* best[position] = the best bonus for the query characters so far, if the last
     one considered sits at `position`. `woher` keeps its predecessor, so that the
     match spans can be traced back afterwards. */
  let best: (number | null)[] = new Array<number | null>(name.length).fill(null);
  const woher: (number | null)[][] = [];

  for (let i = 0; i < wanted.length; i++) {
    const next = new Array<number | null>(name.length).fill(null);
    const trail = new Array<number | null>(name.length).fill(null);

    for (let position = 0; position < name.length; position++) {
      if (lowerName[position] !== wanted[i]) continue;
      const startBonus = isWordStart(name, position) ? GRENZE_BONUS : 0;

      if (i === 0) {
        next[position] = startBonus;
        continue;
      }
      for (let previous = 0; previous < position; previous++) {
        const soFar = best[previous] ?? null;
        if (soFar === null) continue;
        const points = soFar + startBonus + (previous === position - 1 ? RUN_BONUS : 0);
        if (next[position] === null || points > next[position]!) {
          next[position] = points;
          trail[position] = previous;
        }
      }
    }

    best = next;
    woher.push(trail);
  }

  let end: number | null = null;
  for (let position = 0; position < name.length; position++) {
    if (best[position] === null) continue;
    if (end === null || best[position]! > best[end]!) end = position;
  }
  if (end === null) return null;

  /* Backwards through the trail: that yields the places hit, in reverse
     order. */
  const positions: number[] = [];
  let position: number | null = end;
  for (let i = wanted.length - 1; i >= 0 && position !== null; i--) {
    positions.push(position);
    position = woher[i]![position]!;
  }
  positions.reverse();

  const cost = (name.length - wanted.length) * COST_PER_CHARACTER;
  return { rank: best[end]! - cost, finds: mergeAdjacent(positions) };
}

/** Consecutive places become one span - otherwise the rendering marks every
    character on its own and flickers at the edges. */
function mergeAdjacent(positions: readonly number[]): readonly MatchSpan[] {
  const spans: MatchSpan[] = [];
  for (const position of positions) {
    const last = spans[spans.length - 1];
    if (last !== undefined && last.to === position) last.to = position + 1;
    else spans.push({ from: position, to: position + 1 });
  }
  return spans;
}

/* ------------------------------------------------------------------ */
/* One list against one query                                          */
/* ------------------------------------------------------------------ */

/**
 * The candidates that match the query, in the order they belong on screen. An
 * empty query returns nothing.
 *
 * The name is searched first and the group only as a fallback. A group-only
 * find stands behind EVERY name find, whatever the numbers say: someone typing
 * "struktur" means the component of that name rather than the one that happens
 * to be filed beneath it.
 */
export function find<K extends Candidate>(
  kandidaten: readonly K[],
  term: string,
): readonly Find<K>[] {
  const wanted = term.trim();
  if (wanted === "") return [];

  const funde: Find<K>[] = [];
  for (const kandidat of kandidaten) {
    const imNamen = findInName(wanted, kandidat.name);
    if (imNamen !== null) {
      funde.push({
        kandidat,
        rank: imNamen.rank + (kandidat.gewicht ?? 0),
        finds: imNamen.finds,
      });
      continue;
    }
    const inDerGruppe =
      kandidat.gruppe === undefined ? null : findInName(wanted, kandidat.gruppe);
    if (inDerGruppe !== null) {
      funde.push({
        kandidat,
        rank: inDerGruppe.rank + (kandidat.gewicht ?? 0),
        finds: [],
      });
    }
  }

  /* The gap between name finds and group finds lives here and not in the
     number: a weight the caller assigns should be able to turn the order
     within one sort and not mix the sorts. Array#sort is stable, so a tie
     falls back on the incoming order - without an index being carried. */
  return funde.sort((a, b) => {
    const aImNamen = a.finds.length > 0;
    const bImNamen = b.finds.length > 0;
    if (aImNamen !== bImNamen) return aImNamen ? -1 : 1;
    return b.rank - a.rank;
  });
}
