import { useState } from "react";
import { FormField, RadioGroup } from "../../../src";

export const title = "With descriptions";

/* That is what this component exists for instead of a select: the possibilities
   all stand there, and each may bring a sentence along. Where there is nothing
   to explain, a `Select` is the smaller answer.

   A disabled possibility stays visible. A choice that does not exist is
   different information from one you are not allowed to make. */
export default function WithDescriptions() {
  const [delivery, setDelivery] = useState("standard");

  return (
    <FormField
      label="Delivery"
      hint="The arrow keys travel and choose at the same time; disabled entries are skipped."
    >
      <RadioGroup
        value={delivery}
        onChange={setDelivery}
        options={[
          {
            value: "standard",
            label: "Standard",
            description: "Delivery within three working days, at no extra charge.",
          },
          {
            value: "express",
            label: "Express",
            description: "On the next working day, provided the order arrives before 2 p.m.",
          },
          {
            value: "collection",
            label: "Collection in person",
            description: "Ready from the following working day; we will be in touch.",
          },
          {
            value: "freight",
            label: "Freight forwarder",
            description: "Currently not available.",
            disabled: true,
          },
        ]}
      />
    </FormField>
  );
}
