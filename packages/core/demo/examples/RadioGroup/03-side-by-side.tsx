import { useState } from "react";
import { FormField, RadioGroup } from "../../../src";

export const title = "Side by side";
export const lead = "Set `orientation=\"horizontal\"` for a few short labels without descriptions.";

export default function SideBySide() {
  const [part, setPart] = useState("full");

  return (
    <FormField label="Leave on Friday, 20 March">
      <RadioGroup
        orientation="horizontal"
        value={part}
        onChange={setPart}
        options={[
          { value: "morning", label: "Morning" },
          { value: "afternoon", label: "Afternoon" },
          { value: "full", label: "Full day" },
        ]}
      />
    </FormField>
  );
}
