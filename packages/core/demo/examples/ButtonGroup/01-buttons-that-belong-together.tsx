import { Button, ButtonGroup, Stack } from "../../../src";

export const title = "Buttons that belong together";

/* A group is a statement: these buttons belong together and either exclude one
   another or follow one another. `aria-label` names what it is about - without
   it a screen reader hears only "group". */
export default function ButtonsThatBelongTogether() {
  return (
    <Stack gap={3}>
      <Stack direction="row" gap={3} wrap>
        <ButtonGroup aria-label="Choose a view">
          <Button>List</Button>
          <Button>Grid</Button>
          <Button>Timeline</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Import">
          <Button variant="primary">Check</Button>
          <Button variant="primary">Apply</Button>
          <Button variant="primary">Finish</Button>
        </ButtonGroup>
      </Stack>
      <Stack direction="row" gap={3} wrap>
        <ButtonGroup aria-label="History">
          <Button variant="ghost">Back</Button>
          <Button variant="ghost">Forward</Button>
          <Button variant="ghost">Refresh</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Compact">
          <Button size="sm">One</Button>
          <Button size="sm">Two</Button>
          <Button size="sm">Three</Button>
        </ButtonGroup>
      </Stack>
    </Stack>
  );
}
