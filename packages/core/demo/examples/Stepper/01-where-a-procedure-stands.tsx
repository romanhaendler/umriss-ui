import { Stepper } from "../../../src";

export const title = "Where a procedure stands";
export const lead = "Pass the `steps` in order and the index of the `current` one; the steps before it read as done, the ones after as upcoming.";

export default function WhereAProcedureStands() {
  return (
    <Stepper
      aria-label="Incident INC-1048"
      steps={[{ label: "Detect" }, { label: "Acknowledge" }, { label: "Mitigate" }, { label: "Resolve" }, { label: "Review" }]}
      current={2}
      style={{ maxWidth: 640 }}
    />
  );
}
