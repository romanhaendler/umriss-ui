import { useEffect, useState } from "react";
import { IconButton, Stack, Text } from "../../../src";

export const title = "Loading and disabled";
export const lead = "While its action runs, the spinner takes the icon's place and the button locks; disabled, it fades and keeps its name.";

function Refresh() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M8.3 5.8A3.4 3.4 0 1 1 7.6 2.7M7.9 1.2v1.8H6.1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Export() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true">
      <path d="M5 1.5v5M2.8 4.3 5 6.5l2.2-2.2M1.8 8.5h6.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LoadingAndDisabled() {
  const [loading, setLoading] = useState(false);
  const [refreshed, setRefreshed] = useState("10:30");

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
      setRefreshed("10:31");
    }, 1500);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <Stack direction="row" gap={2} align="center">
      <IconButton variant="secondary" aria-label="Refresh the tours" loading={loading} onClick={() => setLoading(true)}>
        <Refresh />
      </IconButton>
      <IconButton variant="secondary" aria-label="Export the tour list" disabled>
        <Export />
      </IconButton>
      <Text size="sm" tone="muted">
        Refreshed at {refreshed}
      </Text>
    </Stack>
  );
}
