import { Combobox, FormField, Grid, LanguageProvider, Stack, Stat, Text } from "../../../src";
import type { LimitSet } from "../../../src";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";

export const title = "English and German side by side";
export const lead = "The same surface without a provider and under German: verdicts, placeholders and number notation move, the caller's labels and data stay.";

/* The p95 latency objective of the checkout service: 300 ms. */
const OBJECTIVE: LimitSet = {
  target: 250,
  limits: [
    { value: 270, side: "upper", severity: "warning" },
    { value: 300, side: "upper", severity: "alarm" },
  ],
};

const ENGINEERS = [
  { value: "priya", label: "Priya Raman" },
  { value: "jonas", label: "Jonas Keller" },
  { value: "ada", label: "Ada Mwangi" },
];

function Surface() {
  return (
    <Stack gap={3}>
      <Stat label="Checkout p95" value={312} unit="ms" limits={OBJECTIVE} />
      <Stat label="Search p95" value={null} unit="ms" limits={OBJECTIVE} />
      <Stat label="Requests today" value={1284311} decimals={0} />
      <FormField label="Assignee">
        <Combobox value={null} onChange={() => {}} clearable options={ENGINEERS} />
      </FormField>
    </Stack>
  );
}

export default function SideBySide() {
  return (
    <Grid minItemWidth="240px" gap={5}>
      <Stack gap={2}>
        <Text size="xs" tone="muted">
          Without a provider
        </Text>
        <Surface />
      </Stack>
      <Stack gap={2}>
        <Text size="xs" tone="muted">
          GERMAN_WORDING and GERMAN_FORMATS
        </Text>
        <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
          <Surface />
        </LanguageProvider>
      </Stack>
    </Grid>
  );
}
