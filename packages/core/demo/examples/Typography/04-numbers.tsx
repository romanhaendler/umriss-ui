import { Grid, Text } from "../../../src";

export const title = "Numbers and identifiers";
export const lead = "Set figures and codes `mono`: tabular digits keep amounts in a column aligned, and 0 and O stay apart.";

const ROWS = [
  { centre: "CC-1100 Sales", actual: "138,412.00" },
  { centre: "CC-1200 Marketing", actual: "76,190.50" },
  { centre: "CC-2100 Engineering", actual: "181,007.25" },
  { centre: "CC-4400 Facilities", actual: "9,880.00" },
];

export default function Numbers() {
  return (
    <Grid columns={2} gap={2} style={{ maxWidth: 360 }}>
      {ROWS.flatMap((row) => [
        <Text key={`${row.centre}-name`} size="sm">
          {row.centre}
        </Text>,
        <Text key={`${row.centre}-actual`} size="sm" mono style={{ textAlign: "right" }}>
          {row.actual}
        </Text>,
      ])}
    </Grid>
  );
}
