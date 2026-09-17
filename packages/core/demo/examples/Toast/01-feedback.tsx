import { Button, Stack, useToast } from "../../../src";

export const title = "Short feedback at the edge";

/* `useToast` needs a `ToastProvider` around the application - here the demo
   wraps it, in your application the root does.

   The toast interrupts nothing and goes away by itself. That is why nothing
   ever stands in it that MUST be read: what requires a decision belongs in an
   `Alert` or a `ConfirmDialog`.

   The tone is never the only information - the symbol and the text say the
   same thing. */
export default function Feedback() {
  const { toast } = useToast();

  return (
    <Stack direction="row" gap={3} wrap>
      <Button
        onClick={() =>
          toast({ title: "Export finished", description: "The project list is ready as a CSV." })
        }
      >
        Show a toast
      </Button>
      <Button onClick={() => toast({ title: "Changes saved", tone: "success" })}>
        Success
      </Button>
      <Button
        onClick={() =>
          toast({
            title: "Connection lost",
            description: "It will reconnect automatically.",
            tone: "warning",
          })
        }
      >
        Warning
      </Button>
      <Button
        onClick={() =>
          toast({ title: "It stays put", description: "duration: 0 - until it is closed.", duration: 0 })
        }
      >
        Without an expiry
      </Button>
    </Stack>
  );
}
