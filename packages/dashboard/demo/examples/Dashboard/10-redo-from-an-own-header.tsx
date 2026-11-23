import { Button, ButtonGroup, Stack, Text } from "@umriss-ui/core";
import { HeadingType, useDashboard } from "../../../src";
import type { DashboardView, HeadingOptions } from "../../../src";

export const title = "The editing actions in the application's own header";
export const lead = "The parts hand over the editing actions, so an application can offer them in its own page header too: Edit, Undo, Redo and Done do the same there as in the dashboard's own bar, which stays where it is. Redo does nothing at the last step of the draft.";

const VIEW: DashboardView = {
  widgets: [
    { id: "h1", type: "heading", size: "full", options: { text: "Dispatch, today" } satisfies HeadingOptions },
    { id: "a", type: "figure", size: "wide", options: { label: "Tours out", value: "14 of 18" } },
    { id: "b", type: "figure", size: "wide", options: { label: "Pallets on hand", value: "412" } },
  ],
};

export default function RedoFromAnOwnHeader() {
  const { Dashboard, WidgetType, editing, edit, undo, redo, done } = useDashboard({ defaultView: VIEW });
  return (
    <Stack gap={3}>
      <ButtonGroup aria-label="Dispatch actions" size="sm">
        <Button onClick={edit} disabled={editing}>Edit</Button>
        <Button onClick={undo} disabled={!editing}>Undo</Button>
        <Button onClick={redo} disabled={!editing}>Redo</Button>
        <Button variant="primary" onClick={done} disabled={!editing}>Done</Button>
      </ButtonGroup>
      <Dashboard headingLevel={4} aria-label="Dispatch, today">
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
