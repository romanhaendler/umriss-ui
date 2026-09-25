import { Checkbox } from "../../../src";

export const title = "Checkbox";
export const lead = "A `label` beside the box makes the whole line clickable; the value counts when the form is saved.";

export default function CheckboxExample() {
  return <Checkbox label="Signature required on delivery" defaultChecked />;
}
