import { Card, CardBody, Grid, Text } from "../../../src";

export const title = "Columns of their own widths";
export const lead =
  'Give `columns` a list with one width per column - a number in pixels, or `"fill"` for a share of what the others leave - such as labels beside their values. `minItemWidth` wins over the list.';

/* One cost centre's key figures, written out here so the example runs on its own. */
const FIGURES = [
  { label: "Cost centre", value: "CC-1200 · Marketing" },
  { label: "Owner", value: "Rafael Ortiz" },
  { label: "Monthly budget", value: "68,000\u00a0€" },
  { label: "Spent, March", value: "77,500\u00a0€, 9,500\u00a0€ over budget" },
  { label: "Approved by", value: "Helen Marsh, Sales" },
];

export default function ColumnsOfTheirOwnWidths() {
  return (
    <Card style={{ maxWidth: 480 }}>
      <CardBody>
        <Grid columns={[140, "fill"]} gap={3}>
          {FIGURES.flatMap((figure) => [
            <Text key={`${figure.label} label`} size="sm" tone="muted">
              {figure.label}
            </Text>,
            <Text key={`${figure.label} value`} size="sm">
              {figure.value}
            </Text>,
          ])}
        </Grid>
      </CardBody>
    </Card>
  );
}
