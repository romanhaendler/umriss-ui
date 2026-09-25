import { Grid, LanguageProvider, Stack, Stat, Text } from "../../../src";
import type { LanguageOptions, LimitSet } from "../../../src";

export const title = "Replace single entries";
export const lead = "Pass only the entries your application says differently; every entry you leave out keeps its default, never an empty text or a key.";

/* Outside the component, so the provider does not rebuild on every render. */
const WORDING: LanguageOptions["wording"] = {
  verdictOk: "Within objective",
  verdictWarning: "Objective at risk",
  verdictAlarm: "Objective breached",
};

const OBJECTIVE: LimitSet = {
  target: 250,
  limits: [
    { value: 270, side: "upper", severity: "warning" },
    { value: 300, side: "upper", severity: "alarm" },
  ],
};

function Surface() {
  return (
    <Stack gap={3}>
      <Stat label="Sign-in p95" value={184} unit="ms" limits={OBJECTIVE} />
      <Stat label="Search p95" value={276} unit="ms" limits={OBJECTIVE} />
      <Stat label="Checkout p95" value={312} unit="ms" limits={OBJECTIVE} />
      <Stat label="Billing p95" value={null} unit="ms" limits={OBJECTIVE} />
    </Stack>
  );
}

export default function SingleEntries() {
  return (
    <Grid minItemWidth="240px" gap={5}>
      <Stack gap={2}>
        <Text size="xs" tone="muted">
          The defaults
        </Text>
        <Surface />
      </Stack>
      <Stack gap={2}>
        <Text size="xs" tone="muted">
          Three entries replaced
        </Text>
        <LanguageProvider wording={WORDING}>
          <Surface />
        </LanguageProvider>
      </Stack>
    </Grid>
  );
}
