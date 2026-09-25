import { useState } from "react";
import { DateTimeRangePicker, FormField } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "With seconds";
export const lead = "Set `withSeconds` where the span is measured to the second; `presets={[]}` drops the column when no span repeats.";

export default function WithSeconds() {
  const [breach, setBreach] = useState<DateRange | null>({
    from: new Date(2026, 2, 17, 9, 40, 12),
    to: new Date(2026, 2, 17, 10, 9, 48),
  });

  return (
    <FormField label="Objective breached, Checkout" style={{ maxWidth: 420 }}>
      <DateTimeRangePicker value={breach} onChange={setBreach} withSeconds presets={[]} />
    </FormField>
  );
}
