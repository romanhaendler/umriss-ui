/* A column that fits many tables: bound to one property, not to a row type.

     const amount = column<{ amount: number }>({ value: "amount", label: "Amount", footer: "sum" });
     <Column {...amount} />

   The compiler accepts it for every row with a numeric `amount` and rejects it
   otherwise. If the preset has more than one field, the field name is named
   along with it: `column<{ amount: number; number: string }, "amount">(…)` -
   TypeScript cannot infer one type argument while another is named
   (Ticket 01). */

import type { Field, ColumnPreset } from "./types";

export function column<P, K extends Field<P> = Field<P>>(preset: ColumnPreset<P, K>): ColumnPreset<P, K> {
  return preset;
}
