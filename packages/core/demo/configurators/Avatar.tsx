/* The Avatar page's configurator: which props its panel offers, in its order,
   and the name it starts with - required. Their values and defaults come from
   `AvatarProps` (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { Avatar } from "../../src";

export const component = Avatar;
export const controls = ["name", "size", "initials"];
export const required = { name: "Arjun Rao" };
