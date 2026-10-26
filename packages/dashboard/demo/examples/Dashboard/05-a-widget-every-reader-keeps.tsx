import { Stack, Text } from "@umriss-ui/core";
import { useDashboard } from "../../../src";
import type { DashboardView } from "../../../src";

export const title = "A widget every reader keeps";
export const lead = "The application marks a widget of the default view as locked. In the editing mode the reader moves it like any other, but cannot remove it, resize it or change its options, and its menu says why.";

const VIEW: DashboardView = {
  widgets: [
    { id: "safety", type: "figure", size: "wide", options: { name: "Safety", value: "0 incidents", note: "Last 30 days" }, locked: true },
    { id: "orders", type: "figure", size: "small", options: { name: "Orders", value: "128", note: "Today" } },
    { id: "late", type: "figure", size: "small", options: { name: "Late tours", value: "3", note: "Of 41" } },
  ],
};

export default function Locked() {
  const { Dashboard, WidgetType } = useDashboard({ defaultView: VIEW });
  return (
    <Dashboard aria-label="Start">
      <WidgetType
        name="figure"
        label="Figure"
        sentence="One number with a note."
        sizes={{ small: { columns: 3, rows: 2 }, wide: { columns: 6, rows: 2 } }}
        start="small"
        defaultOptions={{ name: "Figure", value: "0", note: "" }}
        title={(options: { name: string }) => options.name}
      >
        {({ options }: { options: { value: string; note: string } }) => (
          <Stack gap={1}>
            <Text as="div" size="2xl" weight="semibold">{options.value}</Text>
            <Text size="sm" tone="secondary">{options.note}</Text>
          </Stack>
        )}
      </WidgetType>
    </Dashboard>
  );
}
