import { COST_CENTRES, TEAMS } from "@umriss-ui/demo/worlds/controlling";
import { Calculation, Given, Sum } from "../../../src";
import type { Metric } from "../../../src";

export const title = "Team, cost centre, business line";
export const lead = "A tree of sums, built from data: every cost centre folds to its total and opens into its teams, each metric summed on its own.";

const METRICS: Metric[] = [
  { id: "heads", label: "Headcount", unit: "HC" },
  { id: "fte", label: "Full-time equivalents", unit: "FTE", decimals: 1 },
];

const COMMERCIAL = ["CC-1100", "CC-1200", "CC-3100"];

export default function BusinessLine() {
  return (
    <Calculation aria-label="Staff of the commercial business line, 17 March" metrics={METRICS}>
      <Sum label="Commercial">
        {COMMERCIAL.map((id) => (
          <Sum key={id} label={COST_CENTRES.find((centre) => centre.id === id)!.name}>
            {TEAMS.filter((team) => team.costCentre === id).map((team) => (
              <Given key={team.name} label={team.name} value={{ heads: team.headcount, fte: team.fte }} />
            ))}
          </Sum>
        ))}
      </Sum>
    </Calculation>
  );
}
