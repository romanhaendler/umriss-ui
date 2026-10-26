import { FormField, Select, Stack, Text } from "@umriss-ui/core";
import { useDashboard } from "../../../src";
import type { WidgetSize } from "../../../src";

export const title = "Your own component as a widget";
export const lead = "A widget's content is any React component: a `WidgetType`'s children are a function of the size it stands at and its options, and return what the widget shows. Here the application's own list of tours shows more at a larger size, and its form chooses the depot.";

/* The application's own component - nothing in it knows the dashboard. */
const TOURS = {
  North: [
    { tour: "Tour 12", stop: "Holloway Garden Supplies", eta: "10:40" },
    { tour: "Tour 14", stop: "Brixley Cycles", eta: "11:05" },
    { tour: "Tour 17", stop: "Ferrow Bakery", eta: "11:30" },
    { tour: "Tour 19", stop: "Marlow & Finch Books", eta: "12:15" },
  ],
  South: [
    { tour: "Tour 3", stop: "Oakridge Pharmacy", eta: "10:20" },
    { tour: "Tour 5", stop: "Kestrel Hardware", eta: "11:50" },
  ],
};
type Depot = keyof typeof TOURS;

function ToursOnTheRoad({ depot, rows }: { depot: Depot; rows: number }) {
  const tours = TOURS[depot];
  return (
    <Stack gap={1}>
      <Text size="sm" tone="secondary">{`${tours.length} tours on the road from ${depot}`}</Text>
      {tours.slice(0, rows).map((one) => (
        <Text key={one.tour} size="sm">{`${one.tour} · ${one.stop} · ${one.eta}`}</Text>
      ))}
    </Stack>
  );
}

/* How many lines each size has room for: the content is told its size. */
const ROWS: Partial<Record<WidgetSize, number>> = { small: 1, wide: 4 };

export default function YourOwnWidget() {
  const { Dashboard, WidgetType } = useDashboard({
    defaultView: {
      widgets: [
        { id: "north", type: "tours", size: "wide", options: { depot: "North" } },
        { id: "south", type: "tours", size: "small", options: { depot: "South" } },
      ],
    },
  });
  return (
    <Dashboard headingLevel={4} aria-label="Tours">
      <WidgetType
        name="tours"
        label="Tours on the road"
        sentence="The tours of one depot and their next stop."
        sizes={{ small: { columns: 4, rows: 2 }, wide: { columns: 8, rows: 3 } }}
        start="small"
        defaultOptions={{ depot: "North" as Depot }}
        title={(options) => `Tours, ${options.depot}`}
        form={({ options, change }) => (
          <FormField label="Depot">
            <Select value={options.depot} onChange={(event) => change({ depot: event.target.value as Depot })}>
              {Object.keys(TOURS).map((depot) => (
                <option key={depot}>{depot}</option>
              ))}
            </Select>
          </FormField>
        )}
      >
        {({ size, options }) => <ToursOnTheRoad depot={options.depot} rows={ROWS[size] ?? 1} />}
      </WidgetType>
    </Dashboard>
  );
}
