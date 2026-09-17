import { useState } from "react";
import { Skeleton, Stack, Tab, TabList, TabPanel, Tabs, Text } from "../../../src";

export const title = "Several views, one visible";

/* `Tabs` is controlled and remembers nothing. That is deliberate: the visible
   tab may come out of an address, and a component with a memory of its own
   beside that would be a second truth about it.

   Only the matching panel stands in the document. A hidden panel would keep
   focus, scroll position and live regions that nobody sees.

   The arrow keys switch and activate at the same time. */
export default function TabsExample() {
  const [tab, setTab] = useState("details");

  return (
    <Tabs value={tab} onChange={setTab}>
      <TabList aria-label="Example views">
        <Tab value="details">Details</Tab>
        <Tab value="loading">Loading state</Tab>
        <Tab value="empty">Empty</Tab>
      </TabList>
      <TabPanel value="details">
        <Text size="sm" tone="secondary">
          The tab stands in `value`; the application decides where it comes from.
        </Text>
      </TabPanel>
      <TabPanel value="loading">
        <Stack gap={2} style={{ maxWidth: "320px" }}>
          <Skeleton />
          <Skeleton width="80%" />
        </Stack>
      </TabPanel>
      <TabPanel value="empty">
        <Text size="sm" tone="muted">
          Nothing to show.
        </Text>
      </TabPanel>
    </Tabs>
  );
}
