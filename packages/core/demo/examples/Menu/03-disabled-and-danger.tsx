import { Button, Menu, MenuItem, MenuSeparator } from "../../../src";

export const title = "Disable an entry, mark a destructive one";
export const lead = "A `disabled` entry keeps its place and is skipped by the arrow keys; the `danger` tone marks what destroys, after a separator.";

export default function DisabledAndDanger() {
  return (
    <Menu trigger={<Button size="sm">Invoice INV-26-0311</Button>}>
      <MenuItem>Open</MenuItem>
      <MenuItem disabled>Approve (already paid)</MenuItem>
      <MenuItem>Download as PDF</MenuItem>
      <MenuSeparator />
      <MenuItem tone="danger">Cancel the invoice</MenuItem>
    </Menu>
  );
}
