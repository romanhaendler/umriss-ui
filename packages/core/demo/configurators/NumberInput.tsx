/* The NumberInput page's configurator: which props its panel offers, in its
   order, and the name and number it starts with. The field is controlled -
   `value` and `onChange` are required - so the stage holds the number as the
   reader's own state would, and the code always writes the pair as that
   state. Their values and defaults come from `NumberInputProps`
   (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { useState } from "react";
import { NumberInput, type NumberInputProps } from "../../src";

function Weight(props: NumberInputProps) {
  const [weight, setWeight] = useState(props.value);
  return <NumberInput {...props} value={weight} onChange={setWeight} />;
}

export const component = Weight;
export const controls = ["size", "chars", "invalid", "disabled"];
export const required = {
  "aria-label": "Parcel weight",
  value: { node: 18.5, code: "weight" },
  onChange: { node: undefined, code: "setWeight" },
};
