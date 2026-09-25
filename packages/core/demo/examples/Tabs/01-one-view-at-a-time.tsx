import { Tab, TabList, TabPanel, Tabs, Text } from "../../../src";

export const title = "One view at a time";
export const lead = "Give each `Tab` and its `TabPanel` the same `value`; `defaultValue` picks the first, and the tabs keep the choice.";

export default function OneViewAtATime() {
  return (
    <Tabs defaultValue="overview">
      <TabList aria-label="Checkout">
        <Tab value="overview">Overview</Tab>
        <Tab value="incidents">Incidents</Tab>
        <Tab value="on-call">On call</Tab>
      </TabList>
      <TabPanel value="overview">
        <Text size="sm" tone="secondary">
          Payments team · tier 1 · p95 objective 300 ms · 99.95 % a month.
        </Text>
      </TabPanel>
      <TabPanel value="incidents">
        <Text size="sm" tone="secondary">
          INC-1048, SEV1, open since 09:42: card payments time out.
        </Text>
      </TabPanel>
      <TabPanel value="on-call">
        <Text size="sm" tone="secondary">
          Primary Jonas Keller, secondary Ada Mwangi, until tomorrow 09:00.
        </Text>
      </TabPanel>
    </Tabs>
  );
}
