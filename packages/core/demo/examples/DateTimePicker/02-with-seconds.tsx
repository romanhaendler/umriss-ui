import { useState } from "react";
import { DateTimePicker, FormField } from "../../../src";

export const title = "With seconds";
export const lead = "Set `withSeconds` where the second is part of the value, such as the moment an alert fired.";

export default function WithSeconds() {
  const [fired, setFired] = useState<Date | null>(new Date(2026, 2, 17, 9, 41, 27));

  return (
    <FormField label="Alert fired" style={{ maxWidth: 320 }}>
      <DateTimePicker value={fired} onChange={setFired} withSeconds />
    </FormField>
  );
}
