/* The Checkbox page's configurator: which props its panel offers, in its
   order, and the label it starts with - the box's name, so the code always
   shows it. Their values and defaults come from `CheckboxProps`
   (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { Checkbox } from "../../src";

export const component = Checkbox;
export const controls = ["indeterminate", "disabled"];
export const required = { label: "Signature required on delivery" };
