import { Stepper } from "../../../src";

export const title = "A failed step";
export const lead = "Mark a step `failed` and it shows a cross and says \"failed\"; it stays failed when the procedure has moved past it.";

export default function AFailedStep() {
  return (
    <Stepper
      aria-label="Shipment FP-1004249"
      orientation="vertical"
      steps={[
        { label: "Loaded", description: "North depot, 06:40" },
        { label: "Out for delivery", description: "Tour T-01" },
        { label: "First attempt", description: "10:35, nobody at the door", failed: true },
        { label: "Second attempt", description: "Tomorrow, 08:00–10:00" },
        { label: "Delivered" },
      ]}
      current={3}
      style={{ maxWidth: 360 }}
    />
  );
}
