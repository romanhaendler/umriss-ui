import { useState } from "react";
import { FormField, RadioGroup } from "../../../src";

export const title = "Descriptions";
export const lead = "Give an option a `description` when the choice needs a sentence; a `disabled` option stays visible and is skipped.";

export default function Descriptions() {
  const [service, setService] = useState("standard");

  return (
    <FormField label="Delivery service" style={{ maxWidth: 480 }}>
      <RadioGroup
        value={service}
        onChange={setService}
        options={[
          { value: "standard", label: "Standard", description: "Within two working days, at no extra charge." },
          { value: "next-day", label: "Next day", description: "Booked before 14:00, delivered the next working day." },
          { value: "same-day", label: "Same day", description: "Booked before 10:00, delivered by 18:00 within the city." },
          { value: "pick-up", label: "Pick-up point", description: "No pick-up point within 2 km of this address.", disabled: true },
        ]}
      />
    </FormField>
  );
}
