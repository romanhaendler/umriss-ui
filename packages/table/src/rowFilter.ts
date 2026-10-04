/* Row filters (table-filters 08): a condition the application defines over the
   whole row, set by a control of its own. The table treats its condition like
   a column's - in the ratio, under "Reset", in the view and in the report to a
   server - and asks `matches` of every admitted row. The object itself is the
   key: after its definition no call names it by its id. */

/** A row filter, as `rowFilter` makes it: a condition over the whole row
    that a control of the application sets through `setFilter`. */
export interface RowFilter<Z, B> {
  /** Its name in `t.view.conditions` and in what server mode reports - the one
      place the filter is spelled. Not the id of a column of the same table. */
  readonly id: string;
  /** What it is called: before the text of its chip, and in the chip's
      accessible names. */
  readonly label: string;
  /** Whether the row satisfies the condition. Any question over the whole row;
      whatever varies belongs in the condition - the table cannot see a change
      in a closure. */
  readonly matches: (row: Z, condition: B) => boolean;
  /** The text of the condition in the table toolbar, behind the label. Without
      it the condition has no chip: the application's control shows it. */
  readonly describe?: (condition: B) => string;
}

/** A filter over the rows of type `Z` with conditions of type `B`. Create it
    outside the component, like a column filter, and name it in `rowFilters`. */
export function rowFilter<Z, B>(definition: RowFilter<Z, B>): RowFilter<Z, B> {
  return definition;
}
