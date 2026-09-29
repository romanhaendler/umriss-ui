import { COST_CENTRES, TEAMS } from "@umriss-ui/demo/worlds/controlling";
import { Calculation, Given, Sum } from "../../../src";
import type { Metric } from "../../../src";

export const title = "A third metric: staff cost";
export const lead = "Any number of metrics, each with its unit and places. Narrow, where the figures leave the label too little room, each line puts them beneath its label.";

const METRICS: Metric[] = [
  { id: "heads", label: "Headcount", unit: "HC" },
  { id: "fte", label: "Full-time equivalents", unit: "FTE", decimals: 1 },
  { id: "cost", label: "Staff cost a month", unit: "k€", decimals: 1 },
];

const PRODUCT = ["CC-2100", "CC-2200"];

export default function StaffCost() {
  return (
    <Calculation aria-label="Staff and staff cost of the product business line" metrics={METRICS}>
      <Sum label="Product">
        {PRODUCT.map((id) => (
          <Sum key={id} label={COST_CENTRES.find((centre) => centre.id === id)!.name}>
            {TEAMS.filter((team) => team.costCentre === id).map((team) => (
              <Given
                key={team.name}
                label={team.name}
                value={{ heads: team.headcount, fte: team.fte, cost: team.monthlyCost }}
              />
            ))}
          </Sum>
        ))}
      </Sum>
    </Calculation>
  );
}
