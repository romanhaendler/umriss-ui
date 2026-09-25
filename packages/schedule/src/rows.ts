/* The rows of a plot: a tree of lane groups and a set of folded ones, turned
   into what is actually laid out from top to bottom (ADR-0025).

   ROW is this module's word. A **Lane** is a resource; a row is what the plot
   lays out - a lane's row, an open group's slim head, or the one row a folded
   group becomes. The distinction is the whole reason the word exists here: "a
   lane is not a row" is a standing sentence of this component, and a layout
   that called them the same thing would break it by accident.

   It is in no exported name, no prop and no intent. It reaches the outside in
   exactly one place, `data-row` on a lane header, and that is deliberate and
   written down (ADR-0025): an application styling beside the schedule has to
   be able to tell the three apart.

   Every real lane resolves to a SLOT: its own row where it has one, or its
   strip inside a miniature where its group is folded. Everything that needs a
   y - a bar, a dependency's end, an overlap's band, a grip, the handle's
   answers - asks for a slot and never multiplies an index by a height again.

   Free of the DOM, the canvas and the view: ids, a height, and arithmetic.
   `laneTop` is a prefix sum over the rows and `laneAt` a binary search over
   them, and the first thing the tests ask is that a FLAT plan comes out
   exactly as `laneIndex * laneHeight` did - the picture must not move because
   the arithmetic did. */

/** A lane, as the layout needs it: its identity and the group it sits in. */
export interface LaneNode {
  readonly id: string;
  /** The group it belongs to, or none for a lane at the top level. */
  readonly parent?: string | undefined;
}

/** A group, as the layout needs it. A group holding no lane at all is dropped:
    a head with nothing under it says nothing and costs a planner a line. */
export interface GroupNode {
  readonly id: string;
  readonly parent?: string | undefined;
}

export interface RowsInput {
  /** The lanes in registration order - the order they stand in. */
  readonly lanes: readonly LaneNode[];
  /** The groups, in registration order. */
  readonly groups: readonly GroupNode[];
  /** The groups that are folded. A folded outer group hides the inner ones
      without their entries being touched, so opening it again gives back the
      view that was there. */
  readonly collapsed: ReadonlySet<string>;
  readonly laneHeight: number;
}

/** What a row is: a lane's own row, the slim head of an open group, or the one
    row a folded group became. */
export type RowKind = "lane" | "groupHead" | "miniature";

export interface Row {
  readonly kind: RowKind;
  /** The lane this row belongs to - only a `lane` row has one. */
  readonly lane: string | undefined;
  /** The group this row belongs to - a `groupHead` or a `miniature` has one. */
  readonly group: string | undefined;
  /** How deep it lies in the tree, for the indent of its header. */
  readonly depth: number;
  /** The groups it lies inside, outermost first - its own group included where
      it is one. A group's chevron controls exactly the rows that name it here,
      which is what lets `aria-controls` point at elements that exist whether
      the group is open or folded. */
  readonly within: readonly string[];
  /** How many real lanes lie under it - what a group's header says. */
  readonly lanes: number;
  readonly top: number;
  readonly height: number;
}

/** Where a real lane is drawn: its own row, or its strip within a miniature. */
export interface Slot {
  readonly top: number;
  readonly height: number;
  /** The innermost group this lane sits in - for the hairline a miniature
      draws where one inner group ends and the next begins. */
  readonly group: string | undefined;
  /** Whether this is a strip inside a folded group. What is drawn there is the
      work at a smaller scale and nothing else - no appearance, no label, no
      rail - and no grips are published for a box in one. */
  readonly miniature: boolean;
}

export interface Rows {
  readonly rows: readonly Row[];
  /** Every real lane's slot, by lane id. */
  readonly slots: ReadonlyMap<string, Slot>;
  /** The height of everything laid out - what the scroll is bounded by. */
  readonly height: number;
}

/** The height of an open group's head: a slim line carrying its name and its
    chevron, empty in the plot but for a hairline. It is not a lane and must
    not read as one. */
export const GROUP_HEAD_HEIGHT = 24;

/** How much of a miniature one strip takes, and how far its strips stand in
    from the row's edges.

    A miniature is at least as tall as a lane - a group of two folds to
    something that still reads as a row of the plan - and grows where it has to:
    a group of thirty lanes becomes a taller row rather than thirty strips of
    one pixel. `MIN_STRIP` is what a strip may never fall below. */
export const STRIP_HEIGHT = 4;
export const MIN_STRIP = 3;
const MINIATURE_INSET = 4;

export function layOutRows(input: RowsInput): Rows {
  const { lanes, groups, collapsed, laneHeight } = input;

  /* A group exists only where it was declared; a `parent` naming nothing is a
     caller's slip and leaves its lane at the top level rather than vanishing. */
  const known = new Map(groups.map((g) => [g.id, g] as const));
  const parentOf = (id: string | undefined): string | undefined => (id !== undefined && known.has(id) ? id : undefined);

  /* The lanes each group holds, however deep - and therefore which groups hold
     any at all. */
  const held = new Map<string, string[]>();
  const chainOf = (lane: LaneNode): string[] => {
    const chain: string[] = [];
    let at = parentOf(lane.parent);
    const seen = new Set<string>();
    while (at !== undefined && !seen.has(at)) {
      seen.add(at);
      chain.unshift(at);
      at = parentOf(known.get(at)!.parent);
    }
    return chain;
  };
  const chains = new Map<string, string[]>();
  for (const lane of lanes) {
    const chain = chainOf(lane);
    chains.set(lane.id, chain);
    for (const g of chain) {
      const list = held.get(g) ?? [];
      list.push(lane.id);
      held.set(g, list);
    }
  }

  /* Walking the lanes in registration order is what lays the plot out: a group
     opens at its first lane and closes when a lane outside it arrives. That
     keeps the lanes in the order they were declared, whatever their group -
     which is the order a reader declared them in and the only one they can
     predict. */
  const rows: Row[] = [];
  const slots = new Map<string, Slot>();
  /* The groups currently open above the lane being placed, outermost first. */
  let open: string[] = [];
  /* The miniature being filled, where the lane lies inside a folded group. */
  let folding: { group: string; row: number; lanes: string[] } | null = null;
  let y = 0;

  const push = (row: Omit<Row, "top">): number => {
    rows.push({ ...row, top: y });
    y += row.height;
    return rows.length - 1;
  };

  /** The outermost folded group of a chain, or none where the chain is open. */
  const foldedIn = (chain: readonly string[]): string | undefined => chain.find((g) => collapsed.has(g));

  const closeFold = (): void => {
    if (folding === null) return;
    const { row, lanes: inside } = folding;
    const at = rows[row]!;
    const height = Math.max(at.height, inside.length * STRIP_HEIGHT + 2 * MINIATURE_INSET);
    rows[row] = { ...at, height };
    /* Every row after it moves down by what the miniature grew. */
    y += height - at.height;
    const room = height - 2 * MINIATURE_INSET;
    const strip = Math.max(MIN_STRIP, Math.floor(room / inside.length));
    inside.forEach((id, i) => {
      const chain = chains.get(id) ?? [];
      slots.set(id, {
        top: at.top + MINIATURE_INSET + i * strip,
        height: strip,
        miniature: true,
        group: chain[chain.length - 1],
      });
    });
    folding = null;
  };

  for (const lane of lanes) {
    const chain = (chains.get(lane.id) ?? []).filter((g) => (held.get(g) ?? []).length > 0);
    const folded = foldedIn(chain);

    /* A lane inside the miniature being filled joins it and asks for nothing
       else. */
    if (folding !== null && folded === folding.group) {
      folding.lanes.push(lane.id);
      continue;
    }
    closeFold();

    /* Close every group this lane is no longer in, and open every one it is
       newly in - both in tree order. */
    const shared = chain.filter((g, i) => open[i] === g).length;
    open = open.slice(0, shared);
    for (const g of chain.slice(shared)) {
      open.push(g);
      if (g === folded) break;
      push({
        kind: "groupHead",
        lane: undefined,
        group: g,
        depth: open.length - 1,
        within: [...open],
        lanes: (held.get(g) ?? []).length,
        height: GROUP_HEAD_HEIGHT,
      });
    }

    if (folded !== undefined) {
      const depth = chain.indexOf(folded);
      const row = push({
        kind: "miniature",
        lane: undefined,
        group: folded,
        depth,
        within: chain.slice(0, depth + 1),
        lanes: (held.get(folded) ?? []).length,
        height: laneHeight,
      });
      folding = { group: folded, row, lanes: [lane.id] };
      continue;
    }

    push({ kind: "lane", lane: lane.id, group: chain[chain.length - 1], depth: chain.length, within: chain, lanes: 1, height: laneHeight });
    slots.set(lane.id, {
      top: rows[rows.length - 1]!.top,
      height: laneHeight,
      miniature: false,
      group: chain[chain.length - 1],
    });
  }
  closeFold();

  return { rows, slots, height: y };
}

/** What is folded while a gesture holds some groups open.

    A drag that rests over a folded group opens it FOR THE GESTURE: the rows
    are laid out again, the ghost goes on, and at the end of the gesture the
    transient set is dropped and the group closes. The caller's list is never
    touched and no change is reported, because the application did not fold
    anything - a planner reached into a drawer and let it shut (ADR-0025).

    Pure, so that the one thing worth being sure of can be checked without a
    pointer: the caller's list goes in unchanged and comes out unchanged. */
export function effectiveCollapsed(
  collapsed: ReadonlySet<string>,
  openForGesture: ReadonlySet<string>,
): ReadonlySet<string> {
  if (openForGesture.size === 0) return collapsed;
  const out = new Set<string>();
  for (const group of collapsed) if (!openForGesture.has(group)) out.add(group);
  return out;
}

/** The row a y lies in, or null outside every row. A binary search over the
    prefix sums the layout already produced. */
export function rowAt(rows: Rows, y: number): Row | null {
  if (y < 0 || y >= rows.height) return null;
  let low = 0;
  let high = rows.rows.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const row = rows.rows[mid]!;
    if (y < row.top) high = mid - 1;
    else if (y >= row.top + row.height) low = mid + 1;
    else return row;
  }
  return null;
}

/** Where a lane is drawn, or null for a lane this plot does not have. */
export function slotOf(rows: Rows, lane: string): Slot | null {
  return rows.slots.get(lane) ?? null;
}

/** The lane a y lies on, or null where it lies on a group's head, in a folded
    group's inset, or off the rows altogether.

    A miniature answers with the lane of the strip under the pointer: a strip
    is that lane, at a smaller scale. */
export function laneAtY(rows: Rows, y: number): string | null {
  const row = rowAt(rows, y);
  if (row === null) return null;
  if (row.kind === "lane") return row.lane ?? null;
  if (row.kind === "groupHead") return null;
  for (const [id, slot] of rows.slots) {
    if (slot.miniature && y >= slot.top && y < slot.top + slot.height) return id;
  }
  return null;
}
