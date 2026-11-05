/* ADR-0081 beyond the fields: Tabs, Accordion, Splitter and useTree name their callback after the
   state (`onValueChange`, `onExpandedChange` ...). */

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Accordion, AccordionItem, Splitter, Tab, TabList, TabPanel, Tabs, useTree } from "../src";

afterEach(() => vi.restoreAllMocks());

function TabsCase(props: { onValueChange?: (v: string) => void }) {
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

function AccordionCase(props: { onValueChange?: (v: string[]) => void }) {
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
function TreeCase(props: { onExpandedChange?: (s: ReadonlySet<string>) => void }) {
  const tree = useTree([{ id: "a", kids: [{ id: "b" }] }], { reader: READER, ...props });
  return <button onClick={() => tree.toggleExpanded("a")}>toggle</button>;
}

describe("Tabs", () => {
  it("onValueChange reports the tab", () => {
    const fn = vi.fn();
    render(<TabsCase onValueChange={fn} />);
    fireEvent.click(screen.getByText("Second"));
    expect(fn).toHaveBeenCalledWith("b");
  });
});

describe("Accordion", () => {
  it("onValueChange reports the open sections", () => {
    const fn = vi.fn();
    render(<AccordionCase onValueChange={fn} />);
    fireEvent.click(screen.getByText("X"));
    expect(fn).toHaveBeenCalledWith(["x"]);
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
  it("onValueChange reports the share", () => {
    const fn = vi.fn();
    render(make({ onValueChange: fn }));
    press();
    expect(fn).toHaveBeenCalledWith(55);
  });
});

describe("useTree", () => {
  it("onExpandedChange reports the set", () => {
    const fn = vi.fn();
    render(<TreeCase onExpandedChange={fn} />);
    fireEvent.click(screen.getByText("toggle"));
    expect([...(fn.mock.calls[0]?.[0] as Set<string>)]).toEqual(["a"]);
  });
});
