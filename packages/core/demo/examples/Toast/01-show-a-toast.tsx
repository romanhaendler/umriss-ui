import { Button, useToast } from "../../../src";

export const title = "Show a toast";
export const lead = "Call `toast()` from `useToast` with what has happened; a `ToastProvider` at the root of the application holds the stack.";

export default function ShowAToast() {
  const { toast } = useToast();

  return (
    <Button onClick={() => toast({ title: "Export finished", description: "The project list is ready as a CSV." })}>
      Show a toast
    </Button>
  );
}
