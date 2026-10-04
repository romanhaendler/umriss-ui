/* The MultiSelect page's configurator: which props its panel offers, in its
   order, and what it starts with - its name, its options and two chosen
   people, so `clearable` has something to clear. The value and its setter are
   the reader's own state, so the code names them. Their values and defaults
   come from `MultiSelectProps` (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { MultiSelect } from "../../src";
import { keep } from "./keep";

const PEOPLE = [
  { value: "maya", label: "Maya Lindgren" },
  { value: "arjun", label: "Arjun Mehta" },
  { value: "noah", label: "Noah Fischer" },
  { value: "eva", label: "Eva Novak" },
];

export const component = keep(MultiSelect);
export const controls = ["size", "chars", "clearable", "invalid", "disabled"];
export const required = {
  "aria-label": "Project team",
  options: { node: PEOPLE, code: "people" },
  value: { node: ["arjun", "noah"], code: "team" },
  onChange: { node: undefined, code: "setTeam" },
};
