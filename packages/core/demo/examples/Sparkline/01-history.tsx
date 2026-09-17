import { Grid, Sparkline, Stack, Text } from "../../../src";

export const title = "A history at line height";

/* No axes, no labels, no tooltip. What it shows is the SHAPE of a history and
   not its values - the value stands beside it, where it can be read off. Its
   most frequent place is a table cell: in @umriss-ui/table the presentation of a
   column whose value is the history.

   It is ink and not meaning: `accent` only where exactly one line among several
   is to be picked out. Whoever needs an axis needs a chart and not this
   component. */

const ROWS = [
  { name: "Aurora", history: [52, 61, 58, 70, 74, 82], value: "82 %" },
  { name: "Basalt", history: [30, 34, 41, 47, 55, 64], value: "64 %" },
  { name: "Cirrus", history: [68, 75, 83, 88, 93, 97], value: "97 %" },
  { name: "Dorado", history: [42, 38, 25, 12, 4, 2], value: "2 %" },
];

export default function History() {
  return (
    <Stack gap={4}>
      <Grid columns={2} gap={3}>
        {ROWS.map((row) => (
          <Stack key={row.name} direction="row" gap={3} align="center">
            <Text as="span" size="sm">
              {row.name}
            </Text>
            <Sparkline data={row.history} />
            <Text as="span" size="sm" mono>
              {row.value}
            </Text>
          </Stack>
        ))}
      </Grid>
      <Stack direction="row" gap={4} align="center">
        <Sparkline data={[10, 30, 20, 45, 40, 60]} width={140} height={36} />
        <Sparkline data={[10, 30, 20, 45, 40, 60]} tone="accent" width={140} height={36} />
      </Stack>
    </Stack>
  );
}
