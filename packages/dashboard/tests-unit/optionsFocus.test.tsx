import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useDashboard } from "../src";

function Harness() {
  const { Dashboard, WidgetType } = useDashboard({
    defaultView: { widgets: [{ id: "a", type: "figure", size: "small", options: { name: "Orders" } }] },
  });
  return (
    <Dashboard aria-label="Start">
      <WidgetType
        name="figure"
        label="Figure"
        sentence="One number."
        sizes={{ small: { columns: 3, rows: 2 } }}
        start="small"
        defaultOptions={{ name: "Backlog" }}
        title={(options) => options.name}
        form={({ options, change }) => <input aria-label="Name" value={options.name} onChange={(event) => change({ name: event.target.value })} />}
      >
        {({ options }) => <span>{options.name}</span>}
      </WidgetType>
    </Dashboard>
  );
}

describe("a widget's options", () => {
  it("open with the focus on their first control", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Actions for Orders" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Options" }));
    const dialog = screen.getByRole("dialog");
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Name" }));
  });
});
