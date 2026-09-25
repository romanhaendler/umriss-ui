import { Switch } from "../../../src";

export const title = "On and off";

/* The first step: one function, one switch, and the state belongs to the
   switch. Space toggles it, and so does a click on the label - both come from
   the native checkbox underneath; `role="switch"` makes a screen reader say
   "on" and "off" instead of "ticked". */
export default function OnAndOff() {
  return <Switch label="Night setback" defaultChecked />;
}
