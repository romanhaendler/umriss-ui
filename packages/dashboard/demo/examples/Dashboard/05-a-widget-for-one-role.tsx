import { useState } from "react";
import { Button, Text } from "@umriss-ui/core";
import { useDashboard } from "../../../src";
import type { DashboardView } from "../../../src";

export const title = "A widget for one role";
export const lead = "A widget type is declared only for the role that may see it. The other role does not draw the widget and does not lose it: the stored arrangement keeps it, and \"Done\" keeps it after the widgets that are drawn, so it comes back at the end.";

type Role = "controller" | "dispatcher";

const VIEW: DashboardView = {
  widgets: [
    { id: "s1", type: "stock", size: "small", options: { name: "Pallets" } },
    { id: "c1", type: "cost", size: "small", options: {} },
    { id: "s2", type: "stock", size: "small", options: { name: "Drivers" } },
  ],
};

export default function OneRole() {
  const [role, setRole] = useState<Role>("controller");
  const [told, setTold] = useState<string>();
  const { Dashboard, WidgetType } = useDashboard({
    defaultView: VIEW,
    allowEdit: true,
    onViewChange: (view) => setTold(view.widgets.map((widget) => `${widget.type} ${widget.id}`).join(", ")),
  });
  return (
    <>
      <Button variant={role === "controller" ? "primary" : "secondary"} onClick={() => setRole("controller")}>Controller</Button>{" "}
      <Button variant={role === "dispatcher" ? "primary" : "secondary"} onClick={() => setRole("dispatcher")}>Dispatcher</Button>
      <Dashboard headingLevel={4} aria-label="Dispatch, by role">
        <WidgetType name="stock" label="Stock" sentence="A stock on hand." sizes={{ small: { columns: 4, rows: 2 } }} start="small" defaultOptions={{ name: "Pallets" }} title={(options) => options.name}>
          {({ options }) => <Text size="sm">{`${options.name} on hand`}</Text>}
        </WidgetType>
        {role === "controller" && (
          <WidgetType name="cost" label="Cost" sentence="What the week costs." sizes={{ small: { columns: 4, rows: 2 } }} start="small" defaultOptions={{}}>
            {() => <Text size="sm">Cost this week: 4,820 EUR</Text>}
          </WidgetType>
        )}
      </Dashboard>
      <Text as="p" size="sm" tone="secondary">
        {told ? `Told to the application, in this order: ${told}. ` : "The application was told nothing yet. "}
        {"A widget of a type this role does not declare is not drawn, and \"Done\" keeps it after the drawn widgets, so it comes back at the end."}
      </Text>
    </>
  );
}
