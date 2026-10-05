/* The SegmentedControl page's configurator: which props its panel offers, in
   its order, and the name, the options and the choice it starts with - the
   control requires its options, so the code always shows them. Their values
   and defaults come from `SegmentedControlProps` (`@umriss-ui/demo`,
   `tooling/configurator.ts`). */

import { SegmentedControl } from "../../src";

const options = [
  { value: "raw", label: "Raw data" },
  { value: "cleaned", label: "Cleaned data" },
];

export const component = SegmentedControl;
export const controls = ["size", "fill", "disabled"];
export const required = {
  "aria-label": "State of the data",
  options: {
    node: options,
    code: `[${options.map(({ value, label }) => `{ value: "${value}", label: "${label}" }`).join(", ")}]`,
  },
  defaultValue: "raw",
};
