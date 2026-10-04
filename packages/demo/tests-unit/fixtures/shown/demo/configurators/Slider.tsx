import { Dial } from "../../src";

/* A configurator of a component named otherwise than its page, with a
   required prop beside its controls - one of them the element's own, which
   no table lists. */
export const name = "Dial";
export const component = Dial;
export const controls = ["unit", "disabled"];
export const required = { value: { node: 5, code: "pressure" } };
