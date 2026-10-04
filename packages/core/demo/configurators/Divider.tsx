/* The Divider page's configurator: which props its panel offers, in its
   order. Their values and defaults come from `DividerProps`
   (`@umriss-ui/demo`, `tooling/configurator.ts`); the stage is a flex row, so
   an upright divider takes its height from it, as in a bar. */

import { Divider } from "../../src";

export const component = Divider;
export const controls = ["orientation", "strong", "label"];
