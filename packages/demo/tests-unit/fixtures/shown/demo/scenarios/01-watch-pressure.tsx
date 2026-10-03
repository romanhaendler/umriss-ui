import { Dial } from "../../src";

export const title = "Watch the pressure";

export const lead = "An operator keeps it open beside the line.";

export const builtFrom = ["dial"];

export default function WatchPressure() {
  return <Dial value={5} />;
}
