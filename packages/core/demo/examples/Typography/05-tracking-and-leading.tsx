import { Stack, Text } from "../../../src";

export const title = "Tracking and leading";
export const lead = "Use `tracking=\"caps\"` for small letter-spaced labels and `leading=\"tight\"` for key figures and labels that run over two lines.";

export default function TrackingAndLeading() {
  return (
    <Stack gap={3} style={{ maxWidth: 280 }}>
      <Text size="xs" tracking="caps" tone="muted">
        Sprint 14 · Web team
      </Text>
      <Text size="2xl" tracking="display" leading="tight" weight="semibold">
        38 of 52 points
      </Text>
      <Text size="sm" leading="tight" tone="secondary">
        Checkout flow redesign and member portal sign-up, carried over from sprint 13
      </Text>
    </Stack>
  );
}
