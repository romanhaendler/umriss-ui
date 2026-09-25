import { Sparkline, Stack, Text } from "../../../src";

export const title = "Handle too little history";
export const lead = "With fewer than two values there is no shape, so it draws nothing; say in words why the space is empty.";

const SERVICES = [
  { name: "Checkout", history: [212, 230, 498, 305, 221] },
  { name: "Payouts (new)", history: [140] },
];

export default function TooLittleHistory() {
  return (
    <Stack gap={2}>
      {SERVICES.map((service) => (
        <Stack key={service.name} direction="row" gap={3} align="center">
          <Text as="span" size="sm" style={{ width: 120 }}>
            {service.name}
          </Text>
          {service.history.length >= 2 ? (
            <Sparkline data={service.history} />
          ) : (
            <Text as="span" size="xs" tone="muted" style={{ width: 96 }}>
              no history yet
            </Text>
          )}
          <Text as="span" size="sm" mono>
            {service.history.at(-1)} ms
          </Text>
        </Stack>
      ))}
    </Stack>
  );
}
