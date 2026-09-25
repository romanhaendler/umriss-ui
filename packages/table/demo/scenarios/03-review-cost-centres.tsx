import { Grid, Stack, Stat } from "@umriss-ui/core";
import type { LimitSet } from "@umriss-ui/core";
import { Export, Search, Toolbar, useTable } from "../../src";
import { CLOSED_MONTHS, COST_CENTRES, LEDGER, MONTHS } from "@umriss-ui/demo/worlds/controlling";

export const title = "Review cost centres against budget";

export const lead =
  "The controller at Carrow & Lisle reviews the first quarter before the month-end call: which cost centres will land over budget, and by how much.";

export const callouts = [
  "The quarter in three tiles; the variance is read against the same limits as the column below.",
  "Search a cost centre or its owner; the export writes the report as it stands, with its groups.",
  "Cost centres grouped by area. Each area's line sums its budget, actual, outlook and variance, and carries the worst verdict of its centres.",
  "The outlook is January and February as booked plus March as forecast. Marketing's campaign runs over the alarm limit; IT's delayed licences run under.",
];

export const builtFrom = [
  "grouping",
  "aggregate",
  "verdictcolumn",
  "toolbar",
  "export",
  { name: "Stat", page: "@umriss-ui/core#stat" },
];

/* Over budget by 3 % is worth a question, by 8 % an explanation; 10 % under
   means money planned and not spent. */
const VARIANCE: LimitSet = {
  target: 0,
  limits: [
    { value: 3, side: "upper", severity: "warning" },
    { value: 8, side: "upper", severity: "alarm" },
    { value: -10, side: "lower", severity: "warning" },
  ],
};

const AREAS: Record<string, string> = { "1": "Commercial", "2": "Product", "3": "Service", "4": "Administration" };

const QUARTER = MONTHS.slice(0, 3);

interface Row {
  id: string;
  area: string;
  name: string;
  owner: string;
  budget: number;
  /** Booked, in the closed months. */
  actual: number;
  /** Booked where closed, forecast where open. */
  outlook: number;
}

const ROWS: Row[] = COST_CENTRES.map((centre) => {
  const months = LEDGER.filter((l) => l.costCentre === centre.id && QUARTER.includes(l.month));
  const sum = (pick: (l: (typeof months)[number]) => number) => months.reduce((s, l) => s + pick(l), 0);
  return {
    id: centre.id,
    area: AREAS[centre.id[3]!]!,
    name: centre.name,
    owner: centre.owner,
    budget: sum((l) => l.budget),
    actual: sum((l) => l.actual ?? 0),
    outlook: sum((l) => l.actual ?? l.forecast),
  };
});

const total = (pick: (r: Row) => number) => ROWS.reduce((s, r) => s + pick(r), 0);
const EURO = { decimals: 0 } as const;

export default function ReviewCostCentres() {
  const t = useTable(ROWS, {
    rowKey: (r) => r.id,
    defaultGrouping: "area",
    defaultSort: { column: "id", direction: "asc" },
  });
  const { Table, Column, VerdictColumn } = t;
  const budget = total((r) => r.budget);
  const outlook = total((r) => r.outlook);

  return (
    <Stack gap={4}>
      <div data-callout="1">
        <Grid minItemWidth="180px" gap={3}>
          <Stat label="Budget Q1" value={budget} unit="€" decimals={0} />
          <Stat label={`Actual, ${CLOSED_MONTHS} months closed`} value={total((r) => r.actual)} unit="€" decimals={0} />
          <Stat label="Outlook against budget" value={((outlook - budget) / budget) * 100} unit="%" decimals={1} limits={VARIANCE} />
        </Grid>
      </div>

      <Toolbar of={t}>
        <span data-callout="2">
          <Search of={t} placeholder="Cost centre or owner" />
        </span>
        <Export of={t} filename="cost-centres-q1.csv" />
      </Toolbar>

      <div data-callout="3">
        <Table ariaLabel="Cost centres, first quarter">
          <Column value="area" label="Area" />
          <Column value="id" label="Cost centre" rowHeader />
          <Column value="name" label="Name">
            {(name, r) => (r.id === "CC-1200" ? <span data-callout="4">{name}</span> : name)}
          </Column>
          <Column value="owner" label="Owner" />
          <Column value="budget" label="Budget (€)" format={EURO} aggregate="sum" />
          <Column value="actual" label="Actual Jan–Feb (€)" format={EURO} aggregate="sum" share={false} />
          <Column value="outlook" label="Outlook (€)" format={EURO} aggregate="sum" share={false} />
          <Column id="variance" label="Variance (€)" value={(r) => r.outlook - r.budget} format={EURO} aggregate="sum" share={false} />
          <VerdictColumn
            id="variancePercent"
            label="Variance (%)"
            value={(r) => ((r.outlook - r.budget) / r.budget) * 100}
            limits={VARIANCE}
            format={{ decimals: 1 }}
            aggregate="worst"
          />
        </Table>
      </div>
    </Stack>
  );
}
