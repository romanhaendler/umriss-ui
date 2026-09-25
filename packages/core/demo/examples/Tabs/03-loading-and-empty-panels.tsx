import { EmptyState, Skeleton, Stack, Tab, TabList, TabPanel, Tabs, Text } from "../../../src";

export const title = "Loading and empty panels";
export const lead = "A panel still loading shows a `Skeleton`, an empty one an `EmptyState`; the tab itself stays and says what would be there.";

export default function LoadingAndEmptyPanels() {
  return (
    <Tabs defaultValue="work">
      <TabList aria-label="Hana Sato">
        <Tab value="work">Work</Tab>
        <Tab value="leave">Leave</Tab>
        <Tab value="profile">Profile</Tab>
      </TabList>
      <TabPanel value="work">
        <Stack gap={2} style={{ maxWidth: 320 }}>
          <Skeleton />
          <Skeleton width="80%" />
          <Skeleton width="60%" />
        </Stack>
      </TabPanel>
      <TabPanel value="leave">
        <EmptyState title="No leave planned" description="Holidays, sick days and training appear here once they are entered." />
      </TabPanel>
      <TabPanel value="profile">
        <Text size="sm" tone="secondary">
          Developer in the Apps team, 40 h a week.
        </Text>
      </TabPanel>
    </Tabs>
  );
}
