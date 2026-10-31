/* The RangeSlider page's configurator: the Slider's, for a pair. At `[min, max]`, its default, the fill would
   span the whole track, so the code always shows the start. `step` is bounded, 1 to 50: a step of 0 would
   never move. */

import { RangeSlider } from "../../src";

export const component = RangeSlider;
export const controls = ["min", "max", "step", "showValue", "disabled"];
export const required = { "aria-label": "Acceptable band, °C", defaultValue: [20, 70] };
export const bounds = { step: [1, 50, 1] };
