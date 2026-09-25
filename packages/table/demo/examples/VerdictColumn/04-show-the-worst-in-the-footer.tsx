import type { LimitSet } from "@umriss-ui/core";
import { useTable } from "../../../src";
import { PEOPLE } from "@umriss-ui/demo/worlds/planning";

export const title = "Show the worst in the footer";

export const lead = "Set `aggregate=\"worst\"` and the footer names the worst verdict among the rows – whether anyone in the team is overbooked.";

/* Hours booked this week, per person. */
const BOOKED: Record<string, number> = {
  maya: 30, arjun: 44, chloe: 38, noah: 26, eva: 36, luis: 40, hana: 39, kofi: 35, freya: 22, david: 20,
};

/* Booked hours against the person's capacity. */
const BOOKING: LimitSet = {
  limits: [
    { value: 1, side: "upper", severity: "warning" },
    { value: 1.1, side: "upper", severity: "alarm" },
  ],
};

export default function ShowTheWorst() {
  const { Table, Column, VerdictColumn } = useTable(PEOPLE, { rowKey: (p) => p.id });

  return (
    <Table ariaLabel="Booked hours this week">
      <Column value="name" label="Name" rowHeader />
      <Column value="team" label="Team" />
      <Column value="capacity" label="Capacity (h)" />
      <VerdictColumn
        id="booked"
        label="Booked"
        value={(p) => (BOOKED[p.id] ?? 0) / p.capacity}
        limits={BOOKING}
        format="percent"
        aggregate="worst"
      />
    </Table>
  );
}
