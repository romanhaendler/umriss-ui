import { useState } from "react";
import { FormField, RadioGroup } from "../../../src";

export const title = "Radio group";
export const lead = "Pass the choices as `options`; the group takes one tab stop, and the arrow keys move and choose at once.";

export default function RadioGroupExample() {
  const [attempt, setAttempt] = useState("neighbour");

  return (
    <FormField label="If nobody is home">
      <RadioGroup
        value={attempt}
        onChange={setAttempt}
        options={[
          { value: "door", label: "Leave at the door" },
          { value: "neighbour", label: "Hand to a neighbour" },
          { value: "depot", label: "Take back to the depot" },
        ]}
      />
    </FormField>
  );
}
