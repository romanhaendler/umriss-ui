import { useState } from "react";
import { MenuItem, MenuSeparator, SplitButton, Stack, Text } from "../../../src";

export const title = "Offer variants of the main action";
export const lead = "A `SplitButton` runs its main action on a click and keeps the rarer variants in its `menu`, found but not hit by accident.";

export default function SplitButtonExample() {
  const [last, setLast] = useState("nothing yet");

  return (
    <Stack gap={3} align="flex-start">
      <SplitButton
        variant="primary"
        onClick={() => setLast("labels for tour T-03")}
        menu={
          <>
            <MenuItem onSelect={() => setLast("the loading manifest")}>Print the loading manifest</MenuItem>
            <MenuItem onSelect={() => setLast("the delivery notes")}>Print delivery notes</MenuItem>
            <MenuSeparator />
            <MenuItem tone="danger" onSelect={() => setLast("nothing - print jobs cancelled")}>
              Cancel all print jobs
            </MenuItem>
          </>
        }
      >
        Print labels
      </SplitButton>
      <Text size="xs" tone="muted">
        Printed: {last}
      </Text>
    </Stack>
  );
}
