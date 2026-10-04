/* The Stat page's configurator: which props its panel offers, in its order,
   and the label and value it starts with - both required, so the code always
   shows them. `decimals` counts places, 0 to 6. Their values and defaults
   come from `StatProps` (`@umriss-ui/demo`, `tooling/configurator.ts`).

   The tile is the container its layout answers to, so on the stage - a flex
   row that sizes nothing - it gets the width of a tile in a row, as the first
   example gives it; the code shows `Stat` alone. */

import { Stat, type StatProps } from "../../src";

export const component = (props: StatProps) => (
  <div style={{ width: 240 }}>
    <Stat {...props} />
  </div>
);
export const controls = ["label", "value", "unit", "decimals"];
export const required = { label: "Requests per minute · Checkout", value: 812 };
export const bounds = { decimals: [0, 6, 1] };
