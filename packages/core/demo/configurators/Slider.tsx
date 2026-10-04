/* The Slider page's configurator: which props its panel offers, in its order,
   and the name and value it starts with - at `min`, its default, the track
   would stand empty, so the code always shows both. Their values and
   defaults come from `SliderProps` (`@umriss-ui/demo`,
   `tooling/configurator.ts`). */

import { Slider } from "../../src";

export const component = Slider;
export const controls = ["min", "max", "showValue", "disabled"];
export const required = { "aria-label": "Canary traffic, %", defaultValue: 40 };
