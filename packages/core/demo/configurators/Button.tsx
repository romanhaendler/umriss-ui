/* The Button page's configurator: which props its panel offers, in its order,
   and the text it starts with. Their values and defaults come from
   `ButtonProps` (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { Button } from "../../src";

export const component = Button;
export const controls = ["variant", "size", "loading", "disabled"];
export const children = "Acknowledge";
