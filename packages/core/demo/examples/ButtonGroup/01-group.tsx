import { Button, ButtonGroup } from "../../../src";

export const title = "A group";
export const lead = "Buttons that act on the same thing, joined; `aria-label` names the group, which a screen reader otherwise calls just \"group\".";

export default function Group() {
  return (
    <ButtonGroup aria-label="Browse incidents">
      <Button>Previous incident</Button>
      <Button>Next incident</Button>
    </ButtonGroup>
  );
}
