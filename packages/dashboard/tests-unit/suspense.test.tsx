import { lazy } from "react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { useDashboard } from "../src";

type Loaded = { default: () => ReactNode };
let resolve!: (c: Loaded) => void;
const Late = lazy(() => new Promise<Loaded>((r) => (resolve = r)));

function Harness() {
  const { Dashboard, WidgetType } = useDashboard({
    defaultView: {
      widgets: [
        { id: "a", type: "plain", size: "small", options: {} },
        { id: "b", type: "late", size: "small", options: {} },
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
      <WidgetType name="late" label="Late" sentence="Late." sizes={sizes} start="small" defaultOptions={{}}>
        {() => <Late />}
      </WidgetType>
      <WidgetType name="broken" label="Broken" sentence="Throws." sizes={sizes} start="small" defaultOptions={{}}>
        {() => {
          throw new Error("no");
        }}
      </WidgetType>
    </Dashboard>
  );
}

describe("a widget that suspends", () => {
  it("shows a skeleton in its own body while the others stay", async () => {
    render(<Harness />);
    expect(screen.getByText("plain content")).toBeTruthy();
    const late = screen.getByRole("region", { name: "Late" });
    expect(late.querySelector("[class*=skeleton]")).toBeTruthy();
    resolve({ default: () => <span>late content</span> });
    expect(await screen.findByText("late content")).toBeTruthy();
    expect(late.querySelector("[class*=skeleton]")).toBeNull();
    expect(screen.getByText("plain content")).toBeTruthy();
  });
});
