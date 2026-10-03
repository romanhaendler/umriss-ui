/* The Switch page's configurator: which props its panel offers, in its order,
   and the label it starts with - the switch's name, so the code always shows
   it. Their values and defaults come from `SwitchProps` (`@umriss-ui/demo`,
   `tooling/configurator.ts`). */

import { Switch } from "../../src";

export const component = Switch;
export const controls = ["size", "invalid", "disabled"];
export const required = { label: "Page me at night" };
