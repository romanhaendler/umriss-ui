/* The DatePicker page's configurator: which props its panel offers, in its
   order, and what it starts with - its name and a day, so `clearable` has
   something to clear. The value and its setter are the reader's own state, so
   the code names them. Their values and defaults come from `DatePickerProps`
   (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { DatePicker } from "../../src";
import { keep } from "./keep";

export const component = keep(DatePicker);
export const controls = ["size", "chars", "clearable", "invalid", "disabled"];
export const required = {
  "aria-label": "Delivery date",
  value: { node: new Date(2026, 9, 14), code: "delivery" },
  onChange: { node: undefined, code: "setDelivery" },
};
