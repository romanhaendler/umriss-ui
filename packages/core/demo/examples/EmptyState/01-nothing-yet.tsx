import { Button, EmptyState } from "../../../src";

export const title = "Nothing yet";
export const lead = "The `title` says what is missing, the `description` what would bring it, and the `action` is the way there.";

export default function NothingYet() {
  return (
    <EmptyState
      title="No reports yet"
      description="Reports you save from the budget overview appear here."
      action={
        <Button variant="primary" size="sm">
          Open the budget overview
        </Button>
      }
    />
  );
}
