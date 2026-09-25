import { useState } from "react";
import { DatePicker, FormField, LanguageProvider, NumberInput, Stack } from "../../../src";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";

export const title = "German";
export const lead = "Import both halves of German from `@umriss-ui/core/wording/de`; the components' own words and notation change, your labels stay as written.";

export default function German() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 2, 18));
  const [weight, setWeight] = useState<number | null>(1284.5);

  return (
    <LanguageProvider wording={GERMAN_WORDING} formats={GERMAN_FORMATS}>
      <Stack direction="row" gap={3} wrap>
        <FormField label="Delivery date">
          <DatePicker value={date} onChange={setDate} clearable />
        </FormField>
        <FormField label="Weight">
          <NumberInput value={weight} onChange={setWeight} decimals={1} suffix="kg" />
        </FormField>
      </Stack>
    </LanguageProvider>
  );
}
