import { Dial, Panel } from "../../../src";

export const title = "In a panel";

/* Children, and a dial on another page than its own. */
export default function InAPanel() {
  return (
    <Panel>
      <Dial value={3} />
    </Panel>
  );
}
