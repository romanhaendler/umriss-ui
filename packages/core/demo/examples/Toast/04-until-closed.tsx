import { Button, useToast } from "../../../src";

export const title = "Keep it until it is closed";
export const lead = "`duration: 0` keeps a toast until the reader closes it – for the rare message whose loss costs something.";

export default function UntilClosed() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() =>
        toast({
          title: "Working offline",
          description: "Scans are kept on this device and sent when the connection is back.",
          tone: "warning",
          duration: 0,
        })
      }
    >
      Go offline
    </Button>
  );
}
