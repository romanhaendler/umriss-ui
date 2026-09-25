import { useState } from "react";
import { Button, Skeleton, Stack, Text } from "../../../src";

export const title = "Hold a list's place while it loads";
export const lead = "The placeholder rows are as tall as the rows that replace them, so nothing below jumps when the data arrives.";

const PEOPLE = [
  { name: "Maya Lindgren", role: "Product manager · Web" },
  { name: "Arjun Mehta", role: "Developer · Web" },
  { name: "Noah Fischer", role: "Designer · Web" },
];

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        background: "var(--u-color-surface-sunken)",
        fontSize: "var(--u-text-xs)",
      }}
    >
      {name.split(" ").map((part) => part[0])}
    </span>
  );
}

export default function AListLoading() {
  const [loading, setLoading] = useState(true);

  return (
    <Stack gap={4} style={{ maxWidth: 420 }}>
      <Stack gap={3} aria-busy={loading}>
        {PEOPLE.map((person) => (
          <Stack key={person.name} direction="row" gap={3} align="center" style={{ minHeight: 36 }}>
            {loading ? (
              <>
                <Skeleton circle width={32} height={32} />
                <Stack gap={2} style={{ flex: 1 }}>
                  <Skeleton width="50%" height={14} />
                  <Skeleton width="35%" height={10} />
                </Stack>
              </>
            ) : (
              <>
                <Avatar name={person.name} />
                <Stack gap={1}>
                  <Text size="sm" weight="medium">
                    {person.name}
                  </Text>
                  <Text size="xs" tone="muted">
                    {person.role}
                  </Text>
                </Stack>
              </>
            )}
          </Stack>
        ))}
      </Stack>
      <Button size="sm" onClick={() => setLoading((l) => !l)} style={{ alignSelf: "flex-start" }}>
        {loading ? "Show the loaded rows" : "Show the placeholders"}
      </Button>
    </Stack>
  );
}
