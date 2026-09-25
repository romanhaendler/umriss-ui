import { Button, VisuallyHidden } from "../../../src";

export const title = "Complete a label";
export const lead = "The eye reads \"Acknowledge\" beside the incident; a screen reader hears which one.";

export default function CompleteALabel() {
  return (
    <Button size="sm">
      Acknowledge
      <VisuallyHidden> incident INC-1048</VisuallyHidden>
    </Button>
  );
}
