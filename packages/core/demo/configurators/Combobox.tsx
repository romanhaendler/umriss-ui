/* The Combobox page's configurator: which props its panel offers, in its
   order, and what it starts with - its name, its options and a chosen driver,
   so `clearable` has something to clear. The value and its setter are the
   reader's own state, so the code names them. Their values and defaults come
   from `ComboboxProps` (`@umriss-ui/demo`, `tooling/configurator.ts`). */

import { Combobox } from "../../src";
import { keep } from "./keep";

const DRIVERS = [
  { value: "d1", label: "Martin Hale" },
  { value: "d2", label: "Nadia Petrova" },
  { value: "d3", label: "Owen Carter" },
  { value: "d4", label: "Lucia Romero" },
];

export const component = keep(Combobox);
export const controls = ["size", "chars", "clearable", "invalid", "disabled"];
export const required = {
  "aria-label": "Driver",
  options: { node: DRIVERS, code: "drivers" },
  value: { node: "d2", code: "driver" },
  onChange: { node: undefined, code: "setDriver" },
};
