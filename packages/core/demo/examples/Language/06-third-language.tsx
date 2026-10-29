import { useState } from "react";
import { DatePicker, FormField, Grid, LanguageProvider, NumberInput, Stack, Text, formatsFor } from "../../../src";

export const title = "A third language, notation first";
export const lead = "`formatsFor` builds the notation of any locale the runtime knows: Swiss French dates and numbers, and a week that starts on Sunday where your users' calendars do. The words stay English until you hand over a `Wording` of your own.";

/* Outside the component, so the provider does not rebuild on every render.
   `weekStart` is ISO-numbered: 7 is Sunday. */
const SWISS_FRENCH = { ...formatsFor("fr-CH"), weekStart: 7 };

function Surface() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 2, 18));
  const [weight, setWeight] = useState<number | null>(1284.5);
  return (
    <Stack gap={3}>
      <FormField label="Delivery date">
        <DatePicker value={date} onChange={setDate} />
      </FormField>
      <FormField label="Weight">
        <NumberInput value={weight} onChange={setWeight} decimals={1} suffix="kg" />
      </FormField>
    </Stack>
  );
}

export default function ThirdLanguage() {
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
          formatsFor("fr-CH"), weekStart 7
        </Text>
        <LanguageProvider formats={SWISS_FRENCH}>
          <Surface />
        </LanguageProvider>
      </Stack>
    </Grid>
  );
}
