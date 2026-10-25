import { useState } from "react";
import { FormField, NumberInput } from "../../../src";

export const title = "A year without grouping";
export const lead = "`grouping={false}` writes no group separators, so a year reads 2024 where the formats would write 2.024; the field still reads what it writes.";

export default function YearWithoutGrouping() {
  const [year, setYear] = useState<number | null>(2024);

  return (
    <FormField label="Model year" style={{ maxWidth: 240 }}>
      <NumberInput value={year} onChange={setYear} min={1900} max={2100} decimals={0} grouping={false} />
    </FormField>
  );
}
