import { Calculation, Given, Sum } from "../../../src";
import type { Metric } from "../../../src";

/* Data from the controlling world, written out here so the example runs on its own. */

interface CostCentre {
  id: string;
  name: string;
  owner: string;
  /** The budget of one month. */
  monthlyBudget: number;
}

const COST_CENTRES: readonly CostCentre[] = [
  { id: "CC-1100", name: "Sales", owner: "Helen Marsh", monthlyBudget: 142_000 },
  { id: "CC-1200", name: "Marketing", owner: "Rafael Ortiz", monthlyBudget: 68_000 },
  { id: "CC-2100", name: "Engineering", owner: "Anika Sørensen", monthlyBudget: 188_000 },
  { id: "CC-2200", name: "Design", owner: "Paul Whitaker", monthlyBudget: 54_000 },
  { id: "CC-3100", name: "Customer service", owner: "Grace Obi", monthlyBudget: 61_000 },
  { id: "CC-4100", name: "Finance", owner: "Martina Vogel", monthlyBudget: 47_000 },
  { id: "CC-4200", name: "People", owner: "Daniel Frost", monthlyBudget: 39_000 },
  { id: "CC-4300", name: "IT", owner: "Kenji Arai", monthlyBudget: 83_000 },
  { id: "CC-4400", name: "Facilities", owner: "Olga Ivanova", monthlyBudget: 72_000 },
];

interface Team {
  /** The cost centre the team books to. */
  costCentre: string;
  name: string;
  /** People employed, whatever their hours. */
  headcount: number;
  /** Full-time equivalents: contracted hours over 40 a week. */
  fte: number;
  /** Staff cost of a month, in thousand euros. */
  monthlyCost: number;
}

/** Every team, on 17 March: 102 people, 91.5 full-time equivalents. */
const TEAMS: readonly Team[] = [
  { costCentre: "CC-1100", name: "Field sales North", headcount: 9, fte: 8.6, monthlyCost: 61.2 },
  { costCentre: "CC-1100", name: "Field sales South", headcount: 8, fte: 7.5, monthlyCost: 53.9 },
  { costCentre: "CC-1100", name: "Inside sales", headcount: 6, fte: 5.2, monthlyCost: 29.8 },
  { costCentre: "CC-1100", name: "Key accounts", headcount: 4, fte: 4.0, monthlyCost: 33.6 },
  { costCentre: "CC-1200", name: "Brand", headcount: 3, fte: 2.8, monthlyCost: 19.4 },
  { costCentre: "CC-1200", name: "Online marketing", headcount: 4, fte: 3.5, monthlyCost: 24.1 },
  { costCentre: "CC-1200", name: "Trade fairs", headcount: 2, fte: 1.5, monthlyCost: 10.2 },
  { costCentre: "CC-3100", name: "Service desk", headcount: 7, fte: 5.9, monthlyCost: 31.3 },
  { costCentre: "CC-3100", name: "Returns", headcount: 3, fte: 2.5, monthlyCost: 12.6 },
  { costCentre: "CC-2100", name: "Seating", headcount: 6, fte: 5.8, monthlyCost: 43.5 },
  { costCentre: "CC-2100", name: "Desks", headcount: 7, fte: 6.5, monthlyCost: 48.1 },
  { costCentre: "CC-2100", name: "Storage", headcount: 5, fte: 4.6, monthlyCost: 33.9 },
  { costCentre: "CC-2100", name: "Test lab", headcount: 3, fte: 2.5, monthlyCost: 16.8 },
  { costCentre: "CC-2200", name: "Industrial design", headcount: 4, fte: 3.6, monthlyCost: 27.2 },
  { costCentre: "CC-2200", name: "Colour and material", headcount: 2, fte: 1.8, monthlyCost: 12.9 },
  { costCentre: "CC-4100", name: "Accounting", headcount: 5, fte: 4.4, monthlyCost: 27.5 },
  { costCentre: "CC-4100", name: "Controlling", headcount: 3, fte: 3.0, monthlyCost: 21.3 },
  { costCentre: "CC-4200", name: "Recruiting", headcount: 2, fte: 1.8, monthlyCost: 12.4 },
  { costCentre: "CC-4200", name: "Payroll", headcount: 2, fte: 1.5, monthlyCost: 9.6 },
  { costCentre: "CC-4300", name: "Workplace", headcount: 4, fte: 3.8, monthlyCost: 24.2 },
  { costCentre: "CC-4300", name: "Applications", headcount: 5, fte: 4.5, monthlyCost: 34.8 },
  { costCentre: "CC-4400", name: "Buildings", headcount: 3, fte: 3.0, monthlyCost: 16.9 },
  { costCentre: "CC-4400", name: "Canteen", headcount: 5, fte: 3.2, monthlyCost: 14.7 },
];

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
