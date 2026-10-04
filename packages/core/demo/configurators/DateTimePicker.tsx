/* The DateTimePicker page's configurator: which props its panel offers, in
   its order, and what it starts with - its name and an instant, so
   `clearable` has something to clear and `withSeconds` something to show. The
   value and its setter are the reader's own state, so the code names them.
   Their values and defaults come from `DateTimePickerProps`
   (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { DateTimePicker } from "../../src";
import { keep } from "./keep";

export const component = keep(DateTimePicker);
export const controls = ["withSeconds", "size", "chars", "clearable", "invalid", "disabled"];
export const required = {
  "aria-label": "Customer impact began",
  value: { node: new Date(2026, 9, 14, 9, 42, 15), code: "started" },
  onChange: { node: undefined, code: "setStarted" },
};
