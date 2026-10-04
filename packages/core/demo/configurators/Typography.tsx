/* The Typography page's configurator: it configures `Text`, the page's
   paragraph - `name` says so, as the file is named after the page. Which
   props its panel offers, in its order, and the text it starts with; their
   values and defaults come from `TextProps` (`@umriss-ui/demo`,
   `tooling/configurator.ts`). */

import { Text } from "../../src";

export const name = "Text";
export const component = Text;
export const controls = ["size", "weight", "tone", "mono", "tracking", "leading"];
export const children = "Takes card and wallet payments for every booking.";
