import { Alert } from "../../../src";

export const title = "A message";
export const lead = "A title and a sentence or two, standing where the matter is – here above a sprint board.";

export default function AMessage() {
  return (
    <Alert title="Sprint 14 ends on Friday">
      Items still in progress on Friday at 17:00 move to Sprint 15 with their remaining estimate.
    </Alert>
  );
}
