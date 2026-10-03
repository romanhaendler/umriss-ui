import { Dial, Panel } from "../../../src";

export const title = "In a panel";

/* Children, a dial on another page than its own, and marks a callback maps
   into the array the prop takes. */
export default function InAPanel() {
  return (
    <Panel marks={[10, 20].map((at) => ({ at }))}>
      <Dial value={3} />
    </Panel>
  );
}
