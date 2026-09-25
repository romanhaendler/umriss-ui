import { Button, Grid, LanguageProvider, Stack, Text, useFormats, useWording } from "../../../src";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";

export const title = "Use the language in your own components";
export const lead = "Read `useFormats` and `useWording` in a component of your own, and it writes dates and numbers like the library, under any provider.";

const SPRINT_END = new Date(2026, 2, 27, 17, 0);

function SprintHeader() {
  const formats = useFormats();
  const wording = useWording();
  return (
    <Stack direction="row" gap={3} align="center" wrap>
      <Text size="sm">
        Sprint 14 ends <Text as="span" mono>{formats.dateTime(SPRINT_END, false)}</Text> ·{" "}
        <Text as="span" mono>{formats.count(1240)}</Text> points delivered this year
      </Text>
      <Button size="sm" variant="ghost">
        {wording.today}
      </Button>
    </Stack>
  );
}

export default function OwnComponents() {
  return (
    <Grid minItemWidth="280px" gap={5}>
      <SprintHeader />
      <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
        <SprintHeader />
      </LanguageProvider>
    </Grid>
  );
}
