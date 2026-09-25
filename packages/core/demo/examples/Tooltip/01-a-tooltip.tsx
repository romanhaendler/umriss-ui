import { Button, Tooltip } from "../../../src";

export const title = "A tooltip";
export const lead = "Wrap one focusable element; the `content` appears on pointer contact and on keyboard focus alike.";

export default function ATooltip() {
  return (
    <Tooltip content="Copies the board with its columns, not its cards.">
      <Button size="sm">Duplicate the board</Button>
    </Tooltip>
  );
}
