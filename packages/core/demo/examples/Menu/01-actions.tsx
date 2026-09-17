import { useState } from "react";
import { Button, Menu, MenuItem, MenuSeparator, Stack, Text } from "../../../src";

export const title = "Actions under a trigger";

/* A menu is not a select: its entries are things that happen, and not values
   that stay. Whoever lets a value be chosen wants `Select` or `Combobox`.

   After a choice it closes by itself - a menu that stayed open after something
   happened would cover the result.

   `align="end"` aligns the panel with the right edge of the trigger; at a screen
   edge it flips to the other side on its own. */
export default function Actions() {
  const [last, setLast] = useState("-");

  return (
    <Stack gap={3} align="flex-start">
      <Menu align="end" trigger={<Button size="sm">Actions</Button>}>
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
