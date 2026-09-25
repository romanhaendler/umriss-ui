import { Switch } from "../../../src";

export const title = "On and off";
export const lead = "Use a switch for a setting that takes effect the moment it flips; Space and a click on the label toggle it.";

export default function OnAndOff() {
  return <Switch label="Page me at night" defaultChecked />;
}
