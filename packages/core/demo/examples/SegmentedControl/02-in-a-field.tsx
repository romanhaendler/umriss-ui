import { useState } from "react";
import { FormField, SegmentedControl } from "../../../src";

export const title = "In a field";
export const lead =
  "Inside a `FormField` the control is named by the field's label and takes its hint or error, required and invalid state by itself.";

export default function InAField() {
  const [state, setState] = useState<"raw" | "cleaned">("raw");

  return (
    <FormField
      label="State of the data"
      required
      error={state === "raw" ? "A report is drawn from cleaned data." : undefined}
    >
      <SegmentedControl
        value={state}
        onChange={setState}
        options={[
          { value: "raw", label: "Raw data" },
          { value: "cleaned", label: "Cleaned data" },
        ]}
      />
    </FormField>
  );
}
