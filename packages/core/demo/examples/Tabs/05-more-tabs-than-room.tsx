import { Tab, TabList, TabPanel, Tabs, Text } from "../../../src";

export const title = "More tabs than room";
export const lead = "A `TabList` wider than its place scrolls sideways within it and keeps the chosen tab in view.";

const REGIONS = ["Nordics", "Benelux", "Iberia", "DACH", "Baltics", "Balkans", "Central Europe", "Mediterranean", "British Isles", "Eastern Europe"];

export default function MoreTabsThanRoom() {
  return (
    <Tabs defaultValue="Nordics">
      <TabList aria-label="Regions">
        {REGIONS.map((region) => (
          <Tab key={region} value={region}>
            {region}
          </Tab>
        ))}
      </TabList>
      {REGIONS.map((region) => (
        <TabPanel key={region} value={region}>
          <Text size="sm" tone="secondary">
            Open orders in {region}.
          </Text>
        </TabPanel>
      ))}
    </Tabs>
  );
}
