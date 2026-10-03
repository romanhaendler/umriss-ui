import { Dial } from "../../../src";

export const title = "A basic dial";

/* An attribute, and an inherited prop. */
export default function Basic() {
  return <Dial value={42} tone="alarm" id="pressure" />;
}
