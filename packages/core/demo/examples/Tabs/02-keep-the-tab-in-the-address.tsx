import { useState } from "react";
import { Stack, Tab, TabList, TabPanel, Tabs, Text } from "../../../src";

export const title = "Keep the tab in the address";
export const lead = "Control `value` with `onChange` when the visible tab belongs in the address, so a link or a reload opens the same view.";

export default function KeepTheTabInTheAddress() {
  const [tab, setTab] = useState("stops");

  return (
    <Stack gap={3}>
      <Tabs value={tab} onChange={setTab}>
        <TabList aria-label="Tour T-01">
          <Tab value="stops">Stops</Tab>
          <Tab value="vehicle">Vehicle</Tab>
          <Tab value="costs">Costs</Tab>
        </TabList>
        <TabPanel value="stops">
          <Text size="sm" tone="secondary">
            11 stops, two of them outside their window.
          </Text>
        </TabPanel>
        <TabPanel value="vehicle">
          <Text size="sm" tone="secondary">
            FP 214 K, a van with 1,200 kg payload, from the North depot.
          </Text>
        </TabPanel>
        <TabPanel value="costs">
          <Text size="sm" tone="secondary">
            86 km and 6 h 40 min of driving time.
          </Text>
        </TabPanel>
      </Tabs>
      <Text size="xs" tone="muted">
        Address: <code>#/tours/T-01/{tab}</code>
      </Text>
    </Stack>
  );
}
