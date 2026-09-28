import { useState } from "react";
import { Button, Stack, Text, useToast } from "../../../src";
import type { ToastCloseReason } from "../../../src";

export const title = "Undo";
export const lead = "One `action` reverses what just happened; `onClose` says whether the time ran out, the toast was closed or the action was taken, and the line under the list reports which.";

const BOOKINGS = ["Room 2.14 · Tue 10:00 · Design review", "Room 3.02 · Tue 14:00 · Quarterly planning", "Room 1.05 · Wed 09:30 · Onboarding"];

const OUTCOME: Record<ToastCloseReason, string> = {
  timeout: "The time ran out: the cancellation stands.",
  dismiss: "The toast was closed: the cancellation stands.",
  action: "Undone: the booking is back.",
};

export default function Undo() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState(BOOKINGS);
  const [outcome, setOutcome] = useState<string | null>(null);

  const cancel = (booking: string) => {
    setBookings((list) => list.filter((entry) => entry !== booking));
    setOutcome(null);
    toast({
      title: "Booking cancelled",
      description: booking,
      action: {
        label: "Undo",
        /* Back in its place in the week, whatever went meanwhile. */
        onClick: () => setBookings((list) => BOOKINGS.filter((entry) => entry === booking || list.includes(entry))),
      },
      onClose: (reason) => setOutcome(OUTCOME[reason]),
    });
  };

  return (
    <Stack gap={2} style={{ maxWidth: 480 }}>
      {bookings.map((booking) => (
        <Stack key={booking} direction="row" gap={3} align="center" justify="space-between">
          <Text size="sm">{booking}</Text>
          <Button size="sm" variant="secondary" onClick={() => cancel(booking)}>
            Cancel
          </Button>
        </Stack>
      ))}
      <Text size="xs" tone="muted">
        {outcome ?? `${bookings.length} of ${BOOKINGS.length} rooms booked`}
      </Text>
    </Stack>
  );
}
