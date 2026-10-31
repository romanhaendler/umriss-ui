import { Button, Stack, Text } from "@umriss-ui/core";
import { HeadingType, useDashboard } from "../../../src";
import type { DashboardView, HeadingOptions } from "../../../src";

export const title = "Print the dashboard";
export const lead = "Nothing to set: a printed dashboard is its widgets. The edit bar and the heads' buttons stay off the sheet, and a widget is not broken across two sheets.";

const VIEW: DashboardView = {
  widgets: [
    { id: "h1", type: "heading", size: "full", options: { text: "Dispatch, early shift" } satisfies HeadingOptions },
    { id: "a", type: "figure", size: "wide", options: { label: "Tours out", value: "14 of 18" } },
    { id: "b", type: "figure", size: "wide", options: { label: "Pallets on hand", value: "412" } },
    { id: "c", type: "figure", size: "wide", options: { label: "Late arrivals", value: "2" } },
  ],
};

export default function PrintTheDashboard() {
  const { Dashboard, WidgetType } = useDashboard({ defaultView: VIEW });
  return (
    <Stack gap={3}>
      <Button variant="secondary" size="sm" onClick={() => window.print()} style={{ alignSelf: "flex-start" }}>
        Print this page
      </Button>
      <Dashboard headingLevel={4} aria-label="Dispatch, early shift">
        <HeadingType />
        <WidgetType name="figure" label="Figure" sentence="One figure with its name." sizes={{ wide: { columns: 6, rows: 2 } }} start="wide" defaultOptions={{ label: "", value: "" }} title={(options) => options.label}>
          {({ options }) => (
            <Text size="2xl" weight="semibold">{options.value}</Text>
          )}
        </WidgetType>
      </Dashboard>
    </Stack>
  );
}
