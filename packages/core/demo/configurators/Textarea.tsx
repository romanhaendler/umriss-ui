/* The Textarea page's configurator: which props its panel offers, in its
   order, and the name it starts with - a field without a `FormField` around it
   needs one of its own, so the code always shows it. Their values and
   defaults come from `TextareaProps` (`@umriss-ui/demo`,
   `tooling/configurator.ts`). */

import { Textarea } from "../../src";

export const component = Textarea;
export const controls = ["size", "placeholder", "chars", "resize", "autoGrow", "invalid", "disabled"];
export const required = { "aria-label": "Incident summary" };
