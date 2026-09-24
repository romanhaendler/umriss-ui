/* Rule 2 of the README for the two that did not meet it (core-passthrough 05):
   `Tabs` were controlled only, `Card` uncontrolled only. Both now take the
   pattern of the other fields - `value`/`defaultValue` with `onChange`,
   `collapsed`/`defaultCollapsed` with `onCollapsedChange` - and are tested at
   the seam a caller has: what it sees and what it is told. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Tab, TabList, TabPanel, Tabs } from "../src/components/Tabs";
import { Card, CardBody, CardHeader } from "../src/components/Card";

function TabsCase(props: { value?: string; defaultValue?: string; onChange?: (value: string) => void }) {
  return (
    <Tabs {...props}>
      <TabList aria-label="Views">
        <Tab value="a">First</Tab>
        <Tab value="b">Second</Tab>
      </TabList>
      <TabPanel value="a">One</TabPanel>
      <TabPanel value="b">Two</TabPanel>
    </Tabs>
  );
}

describe("Tabs – uncontrolled", () => {
  it("start at defaultValue and switch without a handler", () => {
    render(<TabsCase defaultValue="a" />);
    expect(screen.getByRole("tabpanel").textContent).toBe("One");
    fireEvent.click(screen.getByRole("tab", { name: "Second" }));
    expect(screen.getByRole("tabpanel").textContent).toBe("Two");
    expect(screen.getByRole("tab", { name: "Second" }).getAttribute("aria-selected")).toBe("true");
  });

  it("report the switch as a message", () => {
    const changed = vi.fn();
    render(<TabsCase defaultValue="a" onChange={changed} />);
    fireEvent.keyDown(screen.getByRole("tab", { name: "First" }), { key: "End" });
    expect(changed).toHaveBeenCalledWith("b");
    expect(screen.getByRole("tabpanel").textContent).toBe("Two");
  });
});

describe("Tabs – controlled", () => {
  it("report and wait: the tab switches only once value follows", () => {
    const changed = vi.fn();
    const { rerender } = render(<TabsCase value="a" onChange={changed} />);
    fireEvent.click(screen.getByRole("tab", { name: "Second" }));
    expect(changed).toHaveBeenCalledWith("b");
    expect(screen.getByRole("tabpanel").textContent).toBe("One");
    rerender(<TabsCase value="b" onChange={changed} />);
    expect(screen.getByRole("tabpanel").textContent).toBe("Two");
  });
});

function CardCase(props: {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  return (
    <Card collapsible {...props}>
      <CardHeader title="Line 4" />
      <CardBody>Content</CardBody>
    </Card>
  );
}

const toggle = () => screen.getByRole("button");

describe("Card – controlled", () => {
  it("is collapsed from outside", () => {
    const { rerender } = render(<CardCase collapsed={false} />);
    expect(toggle().getAttribute("aria-expanded")).toBe("true");
    rerender(<CardCase collapsed />);
    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    expect(toggle().textContent).toBe("Show");
  });

  it("reports the header's wish and waits for collapsed to follow", () => {
    const changed = vi.fn();
    render(<CardCase collapsed={false} onCollapsedChange={changed} />);
    fireEvent.click(toggle());
    expect(changed).toHaveBeenCalledWith(true);
    expect(toggle().getAttribute("aria-expanded")).toBe("true");
  });
});

describe("Card – uncontrolled", () => {
  it("folds on its own from defaultCollapsed and reports it", () => {
    const changed = vi.fn();
    render(<CardCase defaultCollapsed onCollapsedChange={changed} />);
    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle());
    expect(toggle().getAttribute("aria-expanded")).toBe("true");
    expect(changed).toHaveBeenCalledWith(false);
  });
});
