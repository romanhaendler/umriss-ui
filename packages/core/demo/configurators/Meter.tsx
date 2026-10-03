/* The Meter page's configurator: which props its panel offers, in its order,
   the value it starts with - required - and the bounds `value` documents,
   0 to 1. Their values and defaults come from `MeterProps`
   (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { Meter } from "../../src";

export const component = Meter;
export const controls = ["value", "tone", "showLabel"];
export const required = { value: 0.8 };
export const bounds = { value: [0, 1] };
