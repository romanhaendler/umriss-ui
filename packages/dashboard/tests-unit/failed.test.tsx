import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useDashboard } from "../src";

const failure = new Error("no");

function Harness() {
  const { Dashboard, WidgetType } = useDashboard({
    defaultView: {
      widgets: [
        { id: "a", type: "plain", size: "small", options: {} },
        { id: "c", type: "broken", size: "small", options: {} },
      ],
    },
  });
  const sizes = { small: { columns: 3, rows: 2 } };
  return (
    <Dashboard aria-label="Start">
      <WidgetType name="plain" label="Plain" sentence="Plain." sizes={sizes} start="small" defaultOptions={{}}>
        {() => <span>plain content</span>}
      </WidgetType>
      <WidgetType name="broken" label="Broken" sentence="Throws." sizes={sizes} start="small" defaultOptions={{}}>
        {() => {
          throw failure;
        }}
      </WidgetType>
    </Dashboard>
  );
}

describe("a widget whose content throws", () => {
  it("reaches onCaughtError, keeps its frame and says so, and the others render", () => {
    const onCaughtError = vi.fn();
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      render(<Harness />, { onCaughtError });
    } finally {
      quiet.mockRestore();
    }
    expect(onCaughtError).toHaveBeenCalled();
    expect(onCaughtError.mock.calls[0]?.[0]).toBe(failure);
    const broken = screen.getByRole("region", { name: "Broken" });
    expect(broken.textContent).toContain("This widget cannot show anything.");
    expect(screen.getByText("plain content")).toBeTruthy();
  });
});
