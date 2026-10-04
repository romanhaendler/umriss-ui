/* The FormField page's configurator: which props its panel offers, in its
   order, and the label and field it starts with - both required, so the code
   always shows them. Their values and defaults come from `FormFieldProps`
   (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { FormField, Input } from "../../src";

export const component = FormField;
export const controls = ["label", "hint", "error", "required"];
export const required = { label: "Cost centre", children: { node: <Input />, code: "<Input />" } };
