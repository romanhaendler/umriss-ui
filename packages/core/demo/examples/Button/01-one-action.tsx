import { useState } from "react";
import { Button } from "../../../src";

export const title = "One action";
export const lead = "A label that says what happens, and `onClick` for the action.";

export default function OneAction() {
  const [acknowledged, setAcknowledged] = useState(false);
  return (
    <Button disabled={acknowledged} onClick={() => setAcknowledged(true)}>
      {acknowledged ? "Acknowledged" : "Acknowledge"}
    </Button>
  );
}
