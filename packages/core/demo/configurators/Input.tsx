/* The Input page's configurator: which props its panel offers, in its order,
   and the name it starts with - a field without a `FormField` around it needs
   one of its own, so the code always shows it. Their values and defaults come
   from `InputProps` (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { Input } from "../../src";

export const component = Input;
export const controls = ["size", "placeholder", "chars", "invalid", "numeric", "disabled"];
export const required = { "aria-label": "Consignee" };
