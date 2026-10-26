import { Text } from "@umriss-ui/core";
import { HeadingType, useDashboard } from "../../../src";
import type { DashboardView, HeadingOptions } from "../../../src";

export const title = "Headings that divide the dashboard";
export const lead = "The heading widget type is built in: one size across the full width, its text as its options, drawn as a title without a card. An application adds it to the dashboard when readers should be able to structure it.";

const VIEW: DashboardView = {
  widgets: [
    { id: "h1", type: "heading", size: "full", options: { text: "Today" } satisfies HeadingOptions },
    { id: "n1", type: "note", size: "wide", options: {} },
    { id: "n2", type: "note", size: "wide", options: {} },
    { id: "h2", type: "heading", size: "full", options: { text: "This week" } satisfies HeadingOptions },
    { id: "n3", type: "note", size: "wide", options: {} },
  ],
};

export default function Sections() {
  const { Dashboard, WidgetType } = useDashboard({ defaultView: VIEW });
  return (
    <Dashboard headingLevel={4} aria-label="Sections">
      <HeadingType />
      <WidgetType name="note" label="Note" sentence="A line of text." sizes={{ wide: { columns: 6, rows: 3 } }} start="wide" defaultOptions={{}}>
        {() => <Text size="sm">Whatever the application puts in a widget.</Text>}
      </WidgetType>
    </Dashboard>
  );
}
