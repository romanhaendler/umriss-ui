import { BUSINESS_LINES, COST_CENTRES, TEAMS } from "@umriss-ui/demo/worlds/controlling";
import { Calculation, Given, Sum } from "../../../src";
import type { Metric } from "../../../src";

export const title = "The whole company";
export const lead = "Three levels from data - business line, cost centre, team - and three metrics: 23 teams folded to three lines a reader opens one by one.";

const METRICS: Metric[] = [
  { id: "heads", label: "Headcount", unit: "HC" },
  { id: "fte", label: "Full-time equivalents", unit: "FTE", decimals: 1 },
  { id: "cost", label: "Staff cost a month", unit: "k€", decimals: 1 },
];

const centreName = (id: string) => COST_CENTRES.find((centre) => centre.id === id)!.name;

export default function WholeCompany() {
  return (
    <Calculation aria-label="Staff of Carrow & Lisle, 17 March" metrics={METRICS}>
      <Sum label="Carrow & Lisle">
        {BUSINESS_LINES.map((line) => (
          <Sum key={line.name} label={line.name}>
            {line.costCentres.map((id) => (
              <Sum key={id} label={centreName(id)}>
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
        ))}
      </Sum>
    </Calculation>
  );
}
