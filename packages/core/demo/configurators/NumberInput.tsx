/* The NumberInput page's configurator: which props its panel offers, in its
   order, and the name and number it starts with. The field is controlled -
   `value` and `onChange` are required - so the stage holds the number as the
   reader's own state would, and the code always writes the pair as that
   state. The number fields are bounded so that no value breaks the field: up
   to three decimals, a step from 0.1 to 10, bounds from 0 to 100. Their
   values and defaults come from `NumberInputProps` (`@umriss-ui/demo`,
   `tooling/configurator.ts`). */

import { useState } from "react";
import { NumberInput, type NumberInputProps } from "../../src";

function Weight(props: NumberInputProps) {
  const [weight, setWeight] = useState(props.value);
  return <NumberInput {...props} value={weight} onChange={setWeight} />;
}

export const component = Weight;
export const controls = ["size", "decimals", "step", "min", "max", "chars", "invalid", "disabled"];
export const required = {
  "aria-label": "Parcel weight",
  value: { node: 18.5, code: "weight" },
  onChange: { node: undefined, code: "setWeight" },
};
export const bounds = { decimals: [0, 3, 1], step: [0.1, 10, 0.1], min: [0, 100, 1], max: [0, 100, 1] };
