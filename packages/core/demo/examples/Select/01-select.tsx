import { useState } from "react";
import { FormField, Select } from "../../../src";

export const title = "Select";
export const lead = "Write the choices as native `option` elements; a disabled empty option stands in for the placeholder.";

export default function SelectExample() {
  const [centre, setCentre] = useState("");

  return (
    <FormField label="Cost centre" style={{ maxWidth: 320 }}>
      <Select value={centre} onChange={(event) => setCentre(event.target.value)}>
        <option value="" disabled>
          Choose a cost centre
        </option>
        <option value="CC-1100">CC-1100 Sales</option>
        <option value="CC-1200">CC-1200 Marketing</option>
        <option value="CC-2100">CC-2100 Engineering</option>
        <option value="CC-2200">CC-2200 Design</option>
        <option value="CC-3100">CC-3100 Customer service</option>
      </Select>
    </FormField>
  );
}
