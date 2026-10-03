/* The ProgressBar page's configurator: which props its panel offers, in its
   order, and the bounds `value` documents, 0 to 1. Without a value the bar
   runs indeterminate - its default - so the panel starts there, the number
   field empty. Their values and defaults come from `ProgressBarProps`
   (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { ProgressBar } from "../../src";

export const component = ProgressBar;
export const controls = ["value", "showLabel"];
export const bounds = { value: [0, 1] };
