import { useMemo, useState } from "react";
import { Button, Stack, ToastProvider, UmrissProvider, useToast } from "../../../src";
import type { ToastPosition } from "../../../src";

export const title = "Where they stand";
export const lead = "`toast.position` in the `UmrissProvider` puts every toast of the application at one edge and one place along it; the deck grows away from that edge. On a phone they take the window's width, and only the edge counts.";

const POSITIONS: { position: ToastPosition; label: string }[] = [
  { position: "top-start", label: "Top start" },
  { position: "top-center", label: "Top center" },
  { position: "top-end", label: "Top end" },
  { position: "bottom-start", label: "Bottom start" },
  { position: "bottom-center", label: "Bottom center" },
  { position: "bottom-end", label: "Bottom end" },
];

function Buttons({ onPick }: { onPick: (position: ToastPosition) => void }) {
  const { toast } = useToast();
  return (
    <Stack direction="row" gap={2} wrap>
      {POSITIONS.map(({ position, label }) => (
        <Button
          key={position}
          size="sm"
          variant="secondary"
          onClick={() => {
            onPick(position);
            toast({ title: "Report exported", description: `Standing ${label.toLowerCase()}.`, tone: "success" });
          }}
        >
          {label}
        </Button>
      ))}
    </Stack>
  );
}

export default function WhereTheyStand() {
  const [position, setPosition] = useState<ToastPosition>("top-center");
  /* A new object is a new setting: kept until the position changes. */
  const config = useMemo(() => ({ position }), [position]);
  return (
    <UmrissProvider toast={config}>
      <ToastProvider>
        <Buttons onPick={setPosition} />
      </ToastProvider>
    </UmrissProvider>
  );
}
