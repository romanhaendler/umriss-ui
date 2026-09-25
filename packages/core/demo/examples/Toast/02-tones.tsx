import { Button, Stack, useToast } from "../../../src";

export const title = "Tones";
export const lead = "The `tone` says how it turned out; a symbol and the words say the same, so the colour is never alone.";

export default function Tones() {
  const { toast } = useToast();

  return (
    <Stack direction="row" gap={3} wrap>
      <Button onClick={() => toast({ title: "Release 4.18 deployed", description: "Checkout and Billing run the new version.", tone: "success" })}>
        Success
      </Button>
      <Button onClick={() => toast({ title: "Connection lost", description: "Reconnecting to the metrics stream.", tone: "warning" })}>
        Warning
      </Button>
      <Button onClick={() => toast({ title: "Rollback failed", description: "Search still runs release 4.17.", tone: "danger" })}>
        Danger
      </Button>
    </Stack>
  );
}
