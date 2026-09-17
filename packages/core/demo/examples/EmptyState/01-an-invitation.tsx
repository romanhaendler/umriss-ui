import { Button, EmptyState } from "../../../src";

export const title = "An invitation, not a dead end";

/* The title says what is missing; the description says why and what would bring
   it there; the action is the way there. An empty state without that way is a
   dead end with a symbol on it. */
export default function AnInvitation() {
  return (
    <EmptyState
      title="No reports yet"
      description="As soon as the first report has been created, it appears here."
      action={
        <Button variant="primary" size="sm">
          Create a report
        </Button>
      }
    />
  );
}
