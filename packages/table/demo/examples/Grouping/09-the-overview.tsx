import { Button, Stack, Text } from "@umriss-ui/core";
import { COST_CENTRES, LEDGER } from "@umriss-ui/demo/worlds/controlling";
import { useTable } from "../../../src";

export const title = "Fold groups into a summary";
export const lead = "Folded, a grouped table is one line per group with its totals; folds are part of the view and come back through `initialView`.";

const ROWS = LEDGER.map((row) => ({
  key: `${row.costCentre} ${row.month}`,
  centre: COST_CENTRES.find((c) => c.id === row.costCentre)!.name,
  month: row.month,
  budget: row.budget,
  forecast: row.forecast,
  actual: row.actual,
}));

/* A fold is kept by the path of its group. */
const path = (...values: string[]) => JSON.stringify(values.map((v) => `value:${v}`));

export default function Overview() {
  const t = useTable(ROWS, {
    rowKey: (r) => r.key,
    defaultGrouping: "centre",
    initialView: { folded: COST_CENTRES.filter((c) => c.name !== "Marketing").map((c) => path(c.name)) },
  });
  const { Table, Column } = t;
  return (
    <Stack gap={3}>
      <Table ariaLabel="Budget by cost centre" maxHeight="480px" stickyHeader>
        <Column value="centre" label="Cost centre" />
        <Column value="month" label="Month" rowHeader />
        <Column value="budget" label="Budget (€)" aggregate="sum" />
        <Column value="forecast" label="Forecast (€)" aggregate="sum" />
        <Column value="actual" label="Actual (€)" aggregate="sum" />
      </Table>
      <Stack direction="row" gap={2}>
        <Button size="sm" onClick={t.foldAll}>
          Fold all
        </Button>
        <Button size="sm" onClick={t.unfoldAll}>
          Unfold all
        </Button>
      </Stack>
      <Text as="code" size="xs" mono>
        {JSON.stringify(t.view)}
      </Text>
    </Stack>
  );
}
