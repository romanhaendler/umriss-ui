import { Button } from "../../../src";

export const title = "First component";
export const lead = "After `pnpm add @umriss-ui/core`, import a component and render it – no stylesheet import, no provider.";

export default function FirstComponent() {
  return <Button variant="primary">Acknowledge the incident</Button>;
}
