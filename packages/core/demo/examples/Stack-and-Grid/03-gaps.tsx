import { Badge, Stack, Text } from "../../../src";

export const title = "Gaps";
export const lead = "Pick the smallest `gap` that still separates: 1 or 2 inside a group, 4 to 6 between groups.";

const TEAMS = ["Payments", "Identity", "Discovery"];

export default function Gaps() {
  return (
    <Stack gap={4}>
      {([1, 3, 6] as const).map((gap) => (
        <Stack key={gap} direction="row" gap={gap} align="center">
          <Text size="xs" tone="muted" style={{ width: 48 }}>
            gap {gap}
          </Text>
          {TEAMS.map((team) => (
            <Badge key={team}>{team}</Badge>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
