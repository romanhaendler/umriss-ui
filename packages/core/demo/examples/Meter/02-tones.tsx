import { Grid, Meter, Stack, Text } from "../../../src";

export const title = "Tones";
export const lead = "The `tone` is your verdict on the value, not its height; the figure beside it says the same for whoever cannot see colour.";

const CENTRES = [
  { name: "Sales", used: 0.62, tone: "neutral", note: "62 % of March's budget" },
  { name: "IT", used: 0.91, tone: "warning", note: "91 % – with a third of March left" },
  { name: "Marketing", used: 1.07, tone: "danger", note: "107 % – over budget" },
] as const;

export default function Tones() {
  return (
    <Grid minItemWidth="220px" gap={4}>
      {CENTRES.map((centre) => (
        <Stack key={centre.name} gap={2}>
          <Text size="sm" weight="medium">
            {centre.name}
          </Text>
          <Meter value={centre.used} tone={centre.tone} label={`Budget used, ${centre.name}`} />
          <Text size="xs" tone="muted">
            {centre.note}
          </Text>
        </Stack>
      ))}
    </Grid>
  );
}
