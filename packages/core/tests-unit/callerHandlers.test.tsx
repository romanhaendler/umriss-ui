/* What a caller hands in beside the component's own work.

   Several components took an event handler from the caller through `...rest`
   and spread it after their own - so the caller's handler replaced the
   component's instead of running beside it: a tab that did not switch, an
   entry that left its menu open, a tag Delete did not remove, and a number
   field that never let go of its focus state once a form library had given
   it an `onBlur`. Each case here hands in a handler and checks both run.

   Beside it, the focus of a menu: its move to the first entry ran in an
   effect on `open`, before the popover had found its portal target, and so
   the first opening - and only the first - left the focus on the trigger. */

import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Menu, MenuItem } from "../src/components/Menu";
import { Button } from "../src/components/Button";
import { Tab, TabList, TabPanel, Tabs } from "../src/components/Tabs";
import { Tag } from "../src/components/Tag";
import { NumberInput } from "../src/components/NumberInput";
import { RadioGroup } from "../src/components/RadioGroup";
import { TreeView, useTree, type NodeReader } from "../src/components/TreeView";
import { Modal } from "../src/components/Modal";
import { CommandPalette } from "../src/components/CommandPalette";
import { MultiSelect } from "../src/components/MultiSelect";

describe("Menu – the focus", () => {
  it("moves the focus to the first entry", () => {
    render(
      <Menu trigger={<Button>Actions</Button>}>
        <MenuItem>Export</MenuItem>
      </Menu>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Export" }));
  });

  /* The panel is portalled to the end of the page: a Tab left there went to
     the top of the page. Back on the trigger, the Tab moves on from it. */
  it("goes back to the trigger on Tab, for the Tab to move on from there", () => {
    render(
      <Menu trigger={<Button>Actions</Button>}>
        <MenuItem>Export</MenuItem>
      </Menu>,
    );
    const trigger = screen.getByRole("button", { name: "Actions" });
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Export" }), { key: "Tab" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});

describe("A caller's handler runs beside the component's own", () => {
  it("MenuItem: onClick, and the menu still closes", () => {
    const clicked = vi.fn();
    render(
      <Menu trigger={<Button>Actions</Button>}>
        <MenuItem onClick={clicked}>Export</MenuItem>
      </Menu>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Export" }));
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("Tab: onClick, and the tab still switches", () => {
    const clicked = vi.fn();
    function Case() {
      const [value, setValue] = useState("a");
      return (
        <Tabs value={value} onChange={setValue}>
          <TabList aria-label="Views" onKeyDown={vi.fn()}>
            <Tab value="a">First</Tab>
            <Tab value="b" onClick={clicked}>
              Second
            </Tab>
          </TabList>
          <TabPanel value="a">One</TabPanel>
          <TabPanel value="b">Two</TabPanel>
        </Tabs>
      );
    }
    render(<Case />);
    fireEvent.click(screen.getByRole("tab", { name: "Second" }));
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("tabpanel").textContent).toBe("Two");
    fireEvent.keyDown(screen.getByRole("tab", { name: "Second" }), { key: "ArrowLeft" });
    expect(screen.getByRole("tabpanel").textContent).toBe("One");
  });

  it("Tag: onKeyDown, and Delete still removes", () => {
    const pressed = vi.fn();
    const removed = vi.fn();
    render(
      <Tag onKeyDown={pressed} onRemove={removed}>
        Backend
      </Tag>,
    );
    fireEvent.keyDown(screen.getByText("Backend").closest("[data-tag]")!, { key: "Delete" });
    expect(pressed).toHaveBeenCalledTimes(1);
    expect(removed).toHaveBeenCalledTimes(1);
  });

  it("RadioGroup: onKeyDown, and the arrow keys still choose", () => {
    const pressed = vi.fn();
    const chosen = vi.fn();
    render(
      <RadioGroup
        aria-label="Delivery"
        value="a"
        onChange={chosen}
        onKeyDown={pressed}
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
      />,
    );
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowDown" });
    expect(pressed).toHaveBeenCalledTimes(1);
    expect(chosen).toHaveBeenCalledWith("b");
  });

  it("NumberInput: onBlur, and leaving still commits", () => {
    const blurred = vi.fn();
    const changed = vi.fn();
    function Case() {
      const [value, setValue] = useState<number | null>(5);
      return (
        <NumberInput
          aria-label="Quantity"
          value={value}
          max={10}
          onChange={(next) => {
            changed(next);
            setValue(next);
          }}
          onBlur={blurred}
        />
      );
    }
    render(<Case />);
    const input = screen.getByRole("textbox", { name: "Quantity" }) as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "25" } });
    fireEvent.blur(input);
    expect(blurred).toHaveBeenCalledTimes(1);
    // The text follows the clamped value on leaving - the commit ran.
    expect(input.value).toBe("10");
  });

  it("TreeView: onFocus, and the focus still follows the active node", () => {
    interface Leaf {
      id: string;
    }
    const reader: NodeReader<Leaf> = { key: (o) => o.id, children: () => undefined, label: (o) => o.id };
    const roots: Leaf[] = [{ id: "one" }, { id: "two" }];
    const focused = vi.fn();
    function Case() {
      const tree = useTree(roots, { reader, defaultActive: "one" });
      return (
        <TreeView tree={tree} ariaLabel="Files" onFocus={focused}>
          {(e) => e.node.id}
        </TreeView>
      );
    }
    // jsdom has no CSS.escape; the keys here need none.
    vi.stubGlobal("CSS", { escape: (value: string) => value });
    render(<Case />);
    const first = screen.getByRole("treeitem", { name: "one" });
    first.focus();
    fireEvent.focus(first);
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(focused).toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByRole("treeitem", { name: "two" }));
    vi.unstubAllGlobals();
  });
});

/* core-passthrough P3: the components that took no `...rest` before take it
   now, and a caller's handler runs first and may `preventDefault` - the
   component's own work follows unless it did. */
describe("A caller's handler runs first and can prevent the component's own", () => {
  const dialog = () => document.querySelector("dialog")!;

  it("Modal: onMouseDown on the backdrop, and the window still closes", () => {
    const pressed = vi.fn();
    const closed = vi.fn();
    render(<Modal open onClose={closed} onMouseDown={pressed} />);
    fireEvent.mouseDown(dialog());
    expect(pressed).toHaveBeenCalledTimes(1);
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it("Modal: an onCancel that prevents keeps the window standing", () => {
    const closed = vi.fn();
    render(<Modal open onClose={closed} onCancel={(event) => event.preventDefault()} />);
    fireEvent(dialog(), new Event("cancel", { cancelable: true }));
    expect(closed).not.toHaveBeenCalled();
    expect(dialog().hasAttribute("open")).toBe(true);
  });

  it("CommandPalette: onMouseDown on the backdrop, and the palette still closes", () => {
    const pressed = vi.fn();
    const closed = vi.fn();
    render(<CommandPalette open onClose={closed} items={[]} onChoose={vi.fn()} onMouseDown={pressed} />);
    fireEvent.mouseDown(dialog());
    expect(pressed).toHaveBeenCalledTimes(1);
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it("CommandPalette: an onMouseDown that prevents keeps it open", () => {
    const closed = vi.fn();
    render(
      <CommandPalette
        open
        onClose={closed}
        items={[]}
        onChoose={vi.fn()}
        onMouseDown={(event) => event.preventDefault()}
      />,
    );
    fireEvent.mouseDown(dialog());
    expect(closed).not.toHaveBeenCalled();
  });

  it("MultiSelect: onKeyDown on the field, and Backspace still removes", () => {
    const pressed = vi.fn();
    const changed = vi.fn();
    render(
      <MultiSelect
        aria-label="Lines"
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
        value={["a", "b"]}
        onChange={changed}
        onKeyDown={pressed}
      />,
    );
    const main = document.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
    fireEvent.keyDown(main, { key: "Backspace" });
    expect(pressed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith(["a"]);
  });

  it("MultiSelect: an onKeyDown that prevents keeps the selection", () => {
    const changed = vi.fn();
    render(
      <MultiSelect
        options={[{ value: "a", label: "A" }]}
        value={["a"]}
        onChange={changed}
        onKeyDown={(event) => event.preventDefault()}
      />,
    );
    const main = document.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
    fireEvent.keyDown(main, { key: "Backspace" });
    expect(changed).not.toHaveBeenCalled();
  });
});
