/* The DateTimeRangePicker page's configurator: which props its panel offers,
   in its order, and what it starts with - its name and a window with times at
   both ends, so `clearable` has something to clear and `withSeconds`
   something to show. The value and its setter are the reader's own state, so
   the code names them. Their values and defaults come from
   `DateTimeRangePickerProps` (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { DateTimeRangePicker } from "../../src";
import { keep } from "./keep";

export const component = keep(DateTimeRangePicker);
export const controls = ["withSeconds", "size", "chars", "clearable", "invalid", "disabled"];
export const required = {
  "aria-label": "Planned downtime, Billing",
  value: { node: { from: new Date(2026, 9, 14, 22, 0), to: new Date(2026, 9, 15, 2, 30) }, code: "downtime" },
  onChange: { node: undefined, code: "setDowntime" },
};
