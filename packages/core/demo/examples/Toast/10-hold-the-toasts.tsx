import { useState } from "react";
import { Button, Stack, Switch, ToastProvider, useToast } from "../../../src";

export const title = "Hold the toasts";
export const lead = "`held` on the `ToastProvider` keeps every toast out of sight and hearing while a surface is open that they must not cover and there is no room beside it. Their time stands still, a new one waits, and when the hold ends they come back with the time they had left: nothing is lost, as it would be by dismissing them.";

function SendButton() {
  const { toast } = useToast();
  return (
    <Button onClick={() => toast({ title: "Route T-03 planned", description: "12 stops, back by 16:40.", tone: "success" })}>
      Send a toast
    </Button>
  );
}

export default function HoldTheToasts() {
  const [held, setHeld] = useState(false);
  return (
    <ToastProvider held={held}>
      <Stack direction="row" gap={4} align="center">
        <Switch label="Hold the toasts" checked={held} onChange={(event) => setHeld(event.target.checked)} />
        <SendButton />
      </Stack>
    </ToastProvider>
  );
}
