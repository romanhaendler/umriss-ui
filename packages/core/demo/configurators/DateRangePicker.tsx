/* The DateRangePicker page's configurator: which props its panel offers, in
   its order, and what it starts with - its name and a span of days, so
   `clearable` has something to clear. The value and its setter are the
   reader's own state, so the code names them. Their values and defaults come
   from `DateRangePickerProps` (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { DateRangePicker } from "../../src";
import { keep } from "./keep";

export const component = keep(DateRangePicker);
export const controls = ["size", "chars", "clearable", "invalid", "disabled"];
export const required = {
  "aria-label": "Leave",
  value: { node: { from: new Date(2026, 9, 12), to: new Date(2026, 9, 16) }, code: "leave" },
  onChange: { node: undefined, code: "setLeave" },
};
