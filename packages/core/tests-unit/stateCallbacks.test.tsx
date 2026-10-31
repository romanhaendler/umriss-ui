/* ADR-0081 beyond the fields: Tabs, Accordion, Splitter and useTree name their callback after the
   state (`onValueChange`, `onExpandedChange` ...). The former names still work and warn once. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Accordion, AccordionItem, Splitter, Tab, TabList, TabPanel, Tabs, useTree } from "../src";
import { hasWarned } from "../src/lib/dev";

afterEach(() => vi.restoreAllMocks());

const deprecated = (name: string) => hasWarned("@umriss-ui/core", `deprecated:${name}`);

function TabsCase(props: { onValueChange?: (v: string) => void; onChange?: (v: string) => void }) {
  return (
    <Tabs defaultValue="a" {...props}>
      <TabList aria-label="Views">
        <Tab value="a">First</Tab>
        <Tab value="b">Second</Tab>
      </TabList>
      <TabPanel value="a">One</TabPanel>
      <TabPanel value="b">Two</TabPanel>
    </Tabs>
  );
}

function AccordionCase(props: { onValueChange?: (v: string[]) => void; onChange?: (v: string[]) => void }) {
  return (
    <Accordion {...props}>
      <AccordionItem value="x" title="X">one</AccordionItem>
      <AccordionItem value="y" title="Y">two</AccordionItem>
    </Accordion>
  );
}

interface Node {
  id: string;
  kids?: Node[];
}
const READER = { key: (n: Node) => n.id, label: (n: Node) => n.id, children: (n: Node) => n.kids };
function TreeCase(props: { onExpandedChange?: (s: ReadonlySet<string>) => void; onExpanded?: (s: ReadonlySet<string>) => void }) {
  const tree = useTree([{ id: "a", kids: [{ id: "b" }] }], { reader: READER, ...props });
  return <button onClick={() => tree.toggleExpanded("a")}>toggle</button>;
}

describe("Tabs", () => {
  it("onValueChange reports the tab, without a warning", () => {
    const fn = vi.fn();
    render(<TabsCase onValueChange={fn} />);
    fireEvent.click(screen.getByText("Second"));
    expect(fn).toHaveBeenCalledWith("b");
    expect(deprecated("Tabs onChange")).toBe(false);
  });
  it("the former onChange still works and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fn = vi.fn();
    render(<TabsCase onChange={fn} />);
    fireEvent.click(screen.getByText("Second"));
    fireEvent.click(screen.getByText("First"));
    expect(fn.mock.calls).toEqual([["b"], ["a"]]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("onValueChange");
  });
});

describe("Accordion", () => {
  it("onValueChange reports the open sections, without a warning", () => {
    const fn = vi.fn();
    render(<AccordionCase onValueChange={fn} />);
    fireEvent.click(screen.getByText("X"));
    expect(fn).toHaveBeenCalledWith(["x"]);
    expect(deprecated("Accordion onChange")).toBe(false);
  });
  it("the former onChange still works and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fn = vi.fn();
    render(<AccordionCase onChange={fn} />);
    fireEvent.click(screen.getByText("X"));
    fireEvent.click(screen.getByText("Y"));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("onValueChange");
  });
});

describe("Splitter", () => {
  const press = () => fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" });
  const make = (props: object) => (
    <Splitter {...props}>
      <div>left</div>
      <div>right</div>
    </Splitter>
  );
  it("onValueChange reports the share, without a warning", () => {
    const fn = vi.fn();
    render(make({ onValueChange: fn }));
    press();
    expect(fn).toHaveBeenCalledWith(55);
    expect(deprecated("Splitter onChange")).toBe(false);
  });
  it("the former onChange still works and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fn = vi.fn();
    render(make({ onChange: fn }));
    press();
    press();
    expect(fn.mock.calls).toEqual([[55], [60]]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("onValueChange");
  });
});

describe("useTree", () => {
  it("onExpandedChange reports the set, without a warning", () => {
    const fn = vi.fn();
    render(<TreeCase onExpandedChange={fn} />);
    fireEvent.click(screen.getByText("toggle"));
    expect([...(fn.mock.calls[0]?.[0] as Set<string>)]).toEqual(["a"]);
    expect(deprecated("useTree onExpanded")).toBe(false);
  });
  it("the former onExpanded still works and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fn = vi.fn();
    render(<TreeCase onExpanded={fn} />);
    fireEvent.click(screen.getByText("toggle"));
    fireEvent.click(screen.getByText("toggle"));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("onExpandedChange");
  });
});
