import { useState } from "react";
import { Button, Menu, MenuItem, MenuSeparator, Stack, Text } from "../../../src";

export const title = "Run actions from a trigger";
export const lead = "Give `trigger` a button and the entries as `MenuItem`; each runs its `onSelect` and the menu closes.";

export default function Actions() {
  const [last, setLast] = useState("-");

  return (
    <Stack gap={3} align="flex-start">
      <Menu trigger={<Button size="sm">Actions</Button>}>
        <MenuItem onSelect={() => setLast("Exported as CSV")}>Export as CSV</MenuItem>
        <MenuItem onSelect={() => setLast("Link copied")}>Copy the link</MenuItem>
        <MenuSeparator />
        <MenuItem tone="danger" onSelect={() => setLast("View removed")}>
          Remove the view
        </MenuItem>
      </Menu>
      <Text size="xs" tone="muted">
        Last: {last}
      </Text>
    </Stack>
  );
}
