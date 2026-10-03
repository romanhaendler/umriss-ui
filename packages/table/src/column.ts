/* A column that fits many tables: bound to one property, not to a row type.

     const amount = column<{ amount: number }>({ value: "amount", label: "Amount", aggregate: "sum" });
     <Column {...amount} />

   The compiler accepts it for every row with a numeric `amount` and rejects it
   otherwise. If the preset has more than one field, the field name is named
   along with it: `column<{ amount: number; number: string }, "amount">(…)` -
   TypeScript cannot infer one type argument while another is named
   (Ticket 01). */

import type { Field, ColumnPreset } from "./types";

/** A column preset that fits every table whose rows carry its field: create it
    once, outside the component, and spread it into a `Column`. With more than
    one field in `P`, name the field as the second type argument. */
export function column<P, K extends Field<P> = Field<P>>(preset: ColumnPreset<P, K>): ColumnPreset<P, K> {
  return preset;
}
