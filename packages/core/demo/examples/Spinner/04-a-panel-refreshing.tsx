import { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, Spinner, Stack, Text } from "../../../src";

export const title = "Refresh a panel in place";
export const lead = "While a panel reloads, a spinner in its head says so and the old figures stay readable below it.";

export default function APanelRefreshing() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <Card style={{ maxWidth: 420 }}>
      <CardHeader
        title="Open incidents"
        actions={
          loading ? (
            <Stack direction="row" gap={2} align="center">
              <Spinner size={12} aria-label="Refreshing the incidents" />
              <Text as="span" size="xs" tone="muted">
                Refreshing
              </Text>
            </Stack>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setLoading(true)}>
              Refresh
            </Button>
          )
        }
      />
      <CardBody>
        <Stack gap={2}>
          <Text size="sm">INC-1048 · Checkout slow, card payments time out</Text>
          <Text size="sm">INC-1047 · Webhook deliveries delayed</Text>
        </Stack>
      </CardBody>
    </Card>
  );
}
