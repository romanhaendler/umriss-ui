/* The Sparkline page's configurator: which props its panel offers, in its
   order, and the data it starts with - required, so the code always shows it.
   Width and height step by a pixel; `width="fill"` is the examples' to show.
   Their values and defaults come from `SparklineProps` (`@umriss-ui/demo`,
   `tooling/configurator.ts`). */

import { Sparkline } from "../../src";

const data = [42, 58, 71, 66, 80, 74, 88];

export const component = Sparkline;
export const controls = ["width", "height", "tone"];
export const required = { data: { node: data, code: "[42, 58, 71, 66, 80, 74, 88]" } };
export const bounds = { width: [24, 320, 1], height: [12, 96, 1] };
