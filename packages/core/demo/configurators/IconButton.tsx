/* The IconButton page's configurator: which props its panel offers, in its
   order, and the name and glyph it starts with - both required, so the code
   always shows them. Their values and defaults come from `IconButtonProps`
   (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { IconButton, PlusGlyph } from "../../src";

export const component = IconButton;
export const controls = ["variant", "size", "loading", "disabled"];
export const required = { "aria-label": "Add a stop", children: { node: <PlusGlyph />, code: "<PlusGlyph />" } };
