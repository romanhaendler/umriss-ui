/* The TimeInput page's configurator: the seconds, the size and the two states. It starts empty, as the bare
   element does. */

import { TimeInput } from "../../src";

export const component = TimeInput;
export const controls = ["withSeconds", "size", "invalid", "disabled"];
export const required = { "aria-label": "Shift starts" };
