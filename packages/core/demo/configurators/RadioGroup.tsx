/* The RadioGroup page's configurator: which props its panel offers, in its
   order, and the name, the options and the choice it starts with - the group
   requires its options, so the code always shows them. Their values and
   defaults come from `RadioGroupProps` (`@umriss-ui/demo`,
   `tooling/configurator.ts`). */

import { RadioGroup } from "../../src";

const options = [
  { value: "door", label: "Leave at the door" },
  { value: "neighbour", label: "Hand to a neighbour" },
  { value: "depot", label: "Take back to the depot" },
];

export const component = RadioGroup;
export const controls = ["orientation", "size", "disabled"];
export const required = {
  "aria-label": "If nobody is home",
  options: {
    node: options,
    code: `[${options.map(({ value, label }) => `{ value: "${value}", label: "${label}" }`).join(", ")}]`,
  },
  defaultValue: "neighbour",
};
