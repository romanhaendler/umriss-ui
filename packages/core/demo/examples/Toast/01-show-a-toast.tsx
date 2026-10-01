import { Button, ToastProvider, useToast } from "../../../src";

export const title = "Show a toast";
export const lead = "Call `toast()` from `useToast` with what has happened; a `ToastProvider` at the root of the application holds them.";

function Content() {
  const { toast } = useToast();

  return (
    <Button onClick={() => toast({ title: "Export finished", description: "The project list is ready as a CSV." })}>
      Show a toast
    </Button>
  );
}

/* `useToast` needs a `ToastProvider` above it; at the root of an application
   one provider serves every screen. */
export default function ShowAToast() {
  return (
    <ToastProvider>
      <Content />
    </ToastProvider>
  );
}
