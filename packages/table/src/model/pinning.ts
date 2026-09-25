/* Pinned columns (table-column-pinning, N1).

   A column pinned to the start stands in a block before every other one, a
   column pinned to the end in a block after them; both blocks stay in view
   while the rest scrolls sideways under them. Pinning reorders nothing in the
   column order itself: unpinned, a column is back where the order puts it.

   What a column declares (`pin`, and the row header of a `stickyRowHeader`
   table) is the default; what the user chooses replaces it whole - the same
   rule as the grouping, so that the view carries a deviation and nothing
   else. */

export type Pin = "start" | "end";

/** The pinned columns by id; a column not named is not pinned. */
export type Pins = Readonly<Record<string, Pin>>;

/** The columns in the order they stand: the start block, the unpinned ones,
    the end block - each in the order it had. */
export function inPinOrder<T extends { id: string }>(columns: readonly T[], pins: Pins): T[] {
  return [
    ...columns.filter((c) => pins[c.id] === "start"),
    ...columns.filter((c) => pins[c.id] === undefined),
    ...columns.filter((c) => pins[c.id] === "end"),
  ];
}

/** What the columns declare. `stickyRowHeader` is `pin: "start"` on the row
    header - unless the row header declares a side of its own. */
export function declaredPins(
  columns: readonly { id: string; pin?: Pin }[],
  stickyRowHeader?: string,
): Pins {
  const out: Record<string, Pin> = {};
  for (const c of columns) if (c.pin) out[c.id] = c.pin;
  if (stickyRowHeader !== undefined && !out[stickyRowHeader]) out[stickyRowHeader] = "start";
  return out;
}

/** One column pinned to a side, or unpinned with `null`; the others stay. */
export function withPin(pins: Pins, id: string, pin: Pin | null): Pins {
  const out = { ...pins };
  if (pin) out[id] = pin;
  else delete out[id];
  return out;
}

const samePins = (a: Pins, b: Pins): boolean =>
  Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([id, pin]) => b[id] === pin);

/** What the view carries: the user's choice when it deviates from the
    declaration, without columns that do not exist. As long as none is known
    the choice stays as it is - the first render would erase it otherwise. */
export function pinsForView(chosen: Pins | null, declared: Pins, known: ReadonlySet<string>): Pins | undefined {
  if (!chosen) return undefined;
  const kept = known.size === 0 ? chosen : Object.fromEntries(Object.entries(chosen).filter(([id]) => known.has(id)));
  return samePins(kept, declared) ? undefined : kept;
}

/** The blocks of a row, in cells of the head row: `start` cells from the left
    and `end` cells from the right stick, of `count` cells in all. */
export interface PinBlocks {
  start: number;
  end: number;
  count: number;
}

/** Where a cell that covers the cells `first` to `last` of the head row
    sticks: its side, its place counted from that side's edge, and whether it
    is the block's inner edge, where the shadow falls. A cell that reaches
    beyond its block does not stick - it would lay itself over the cells that
    scroll beside it. */
export function pinOf(
  blocks: PinBlocks,
  first: number,
  last = first,
): { side: Pin; at: number; edge: boolean } | undefined {
  if (last < blocks.start) return { side: "start", at: first, edge: last === blocks.start - 1 };
  const endBegins = blocks.count - blocks.end;
  if (blocks.end > 0 && first >= endBegins) return { side: "end", at: blocks.count - 1 - last, edge: first === endBegins };
  return undefined;
}
