import { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, Stack, Text } from "../../../src";

export const title = "Refresh a panel in place";
export const lead = "While a panel reloads, the button that started it carries the spinner - `loading` on a `Button` - and the old figures stay readable below it. The button stays, so the head keeps its height.";

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
          <Button size="sm" variant="ghost" loading={loading} onClick={() => setLoading(true)}>
            Refresh
          </Button>
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
