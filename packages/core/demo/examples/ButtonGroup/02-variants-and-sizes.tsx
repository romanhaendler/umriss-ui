import { Button, ButtonGroup, Stack } from "../../../src";

export const title = "Variants and sizes";
export const lead = "Give every button in a group the same `variant` and `size`; a group that mixes them no longer reads as one control. `size` on the group says it once for all of them.";

export default function VariantsAndSizes() {
  return (
    <Stack gap={3} align="flex-start">
      <ButtonGroup aria-label="Zoom the tour plan">
        <Button>Zoom out</Button>
        <Button>Zoom in</Button>
        <Button>Fit</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Tour T-03">
        <Button variant="primary">Dispatch</Button>
        <Button variant="primary">Print manifest</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Stops" size="sm">
        <Button variant="ghost">Move up</Button>
        <Button variant="ghost">Move down</Button>
        <Button variant="ghost">Remove</Button>
      </ButtonGroup>
    </Stack>
  );
}
