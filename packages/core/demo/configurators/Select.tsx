/* The Select page's configurator: which props its panel offers, in its order,
   the name it starts with - a field without a `FormField` around it needs one
   of its own - and its options. A native select keeps its own choice, so the
   code needs no state; `clearable` is left out, because it needs a controlled
   value and `onClear`. Their values and defaults come from `SelectProps`
   (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { Select } from "../../src";

export const component = Select;
export const controls = ["size", "chars", "invalid", "disabled"];
export const required = {
  "aria-label": "Charge to",
  children: {
    node: [
      <option key="1100">CC-1100 Sales</option>,
      <option key="2100">CC-2100 Engineering</option>,
      <option key="3100">CC-3100 Customer service</option>,
    ],
    code: "\n  <option>CC-1100 Sales</option>\n  <option>CC-2100 Engineering</option>\n  <option>CC-3100 Customer service</option>\n",
  },
};
