import { useState } from "react";
import { Text } from "@umriss-ui/core";
import { useDashboard } from "../../../src";
import type { DashboardView, WidgetSize } from "../../../src";

export const title = "An arrangement from an older release";
export const lead = "The application keeps its own `{ version, view }` and migrates an older value with a plain function before the dashboard reads it. Three things need no migration of the application's: a type's new option takes its default, a size the type no longer offers falls back to its starting size, and a type that is gone stays in the stored view, not drawn.";

/** What an older release stored: its own shape, with the figure's name as `label`. */
interface StoredV1 {
  version: 1;
  cards: ReadonlyArray<{ id: string; kind: string; size: WidgetSize; label?: string }>;
}

/** What the application keeps now. */
interface StoredV2 {
  version: 2;
  view: DashboardView;
}

/* The value as version 1 stored it: the trend is larger than it is offered now, the weather type is gone,
   and no figure has the unit option that the type has since gained. */
const STORED: StoredV1 = {
  version: 1,
  cards: [
    { id: "a", kind: "figure", size: "small", label: "Orders" },
    { id: "b", kind: "trend", size: "large" },
    { id: "c", kind: "weather", size: "small" },
    { id: "d", kind: "figure", size: "medium", label: "Utilisation" },
  ],
};

/** One older value in, the current one out. Nothing else needs to change. */
function migrate(stored: StoredV1 | StoredV2): StoredV2 {
  if (stored.version === 2) return stored;
  return {
    version: 2,
    view: { widgets: stored.cards.map((card) => ({ id: card.id, type: card.kind, size: card.size, options: card.label === undefined ? {} : { name: card.label } })) },
  };
}

export default function OlderRelease() {
  const [kept, setKept] = useState<StoredV2>(() => migrate(STORED));
  const { Dashboard, WidgetType } = useDashboard({
    defaultView: { widgets: [] },
    initialView: kept.view,
    onViewChange: (view) => setKept({ version: 2, view }),
  });
  return (
    <>
      <Dashboard aria-label="Orders and utilisation">
        <WidgetType
          name="figure"
          label="Figure"
          sentence="One number with its unit."
          sizes={{ small: { columns: 3, rows: 2 }, medium: { columns: 4, rows: 2 } }}
          start="small"
          defaultOptions={{ name: "Orders", unit: "per day" }}
          title={(options) => options.name}
        >
          {({ options }) => <Text size="sm">{`${options.name}, ${options.unit}`}</Text>}
        </WidgetType>
        <WidgetType name="trend" label="Trend" sentence="A figure over the last weeks." sizes={{ wide: { columns: 6, rows: 3 } }} start="wide" defaultOptions={{}}>
          {() => <Text size="sm">Trend over the last weeks</Text>}
        </WidgetType>
      </Dashboard>
      <Text as="p" size="sm" tone="secondary">
        {`The application keeps version ${kept.version}: ${kept.view.widgets.map((widget) => widget.id).join(", ")}, in that order. A "Done" writes it back in version 2.`}
      </Text>
    </>
  );
}
