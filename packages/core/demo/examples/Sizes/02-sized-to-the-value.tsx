import { useState } from "react";
import { DatePicker, FormField, Input, NumberInput, Stack } from "../../../src";

export const title = "Sized to the value";
export const lead =
  "Give `chars` the length of the value, and the field is that wide - a postcode five characters, an IBAN twenty-seven - in characters of its own type, with its padding, glyph and steppers added. In a column that lines its fields up at the start, every field shows its own width; a date picker without `chars` is as wide as its longest date. Type a short postcode: the message wraps under its field and moves nothing.";

export default function SizedToTheValue() {
  const [postcode, setPostcode] = useState("20457");
  const [amount, setAmount] = useState<number | null>(1280.5);
  const [due, setDue] = useState<Date | null>(new Date(2026, 2, 31));
  const wrong = postcode !== "" && !/^\d{5}$/.test(postcode);

  return (
    <Stack gap={4} align="start">
      <Stack direction="row" gap={3} wrap>
        <FormField label="Postcode" error={wrong ? "Five digits." : undefined}>
          <Input
            chars={5}
            inputMode="numeric"
            autoComplete="postal-code"
            value={postcode}
            onChange={(event) => setPostcode(event.target.value)}
          />
        </FormField>
        <FormField label="City">
          <Input autoComplete="address-level2" defaultValue="Hamburg" />
        </FormField>
      </Stack>
      <FormField label="IBAN">
        <Input chars={27} defaultValue="DE89 3704 0044 0532 0130 00" />
      </FormField>
      <FormField label="Amount">
        <NumberInput chars={9} value={amount} onChange={setAmount} decimals={2} suffix="€" />
      </FormField>
      <FormField label="Due">
        <DatePicker value={due} onChange={setDue} clearable />
      </FormField>
    </Stack>
  );
}
