/* Operating the tree (tree-view 03). What is checked is what a person
   observes: where the tab stop sits, where the arrow keys lead, what the
   screen reader gets to know and that activating and checking stay two
   gestures.

   The model is the radio group's test: the same question - one tab stop,
   arrow keys, announced state -, the same level. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TreeView, useTree, type NodeReader } from "../src/components/TreeView";

interface Folder {
  id: string;
  name: string;
  children?: Folder[];
  disabled?: boolean;
  unloaded?: boolean;
}

const TREE: Folder[] = [
  {
    id: "a",
    name: "Anlagen",
    children: [
      { id: "a1", name: "Vertrag" },
      { id: "a2", name: "Bilder", children: [{ id: "a2x", name: "Skizze" }] },
    ],
  },
  { id: "b", name: "Leer", children: [] },
  { id: "c", name: "Einzelblatt" },
];

const READER: NodeReader<Folder> = {
  key: (o) => o.id,
  children: (o) => o.children,
  label: (o) => o.name,
};

function Fixture({
  checkable = false,
  onActivate = vi.fn(),
  onChecked = vi.fn(),
  defaultActive = "a" as string | null,
  defaultExpanded = [] as string[],
}) {
  const tree = useTree(TREE, {
    reader: READER,
    defaultActive,
    defaultExpanded,
    onActivate,
    onChecked,
  });
  return (
    <TreeView tree={tree} ariaLabel="Ablage" checkable={checkable}>
      {(e) => e.node.name}
    </TreeView>
  );
}

const node = (name: string) => screen.getByRole("treeitem", { name: new RegExp(name) });
const all = () => screen.getAllByRole("treeitem");
const press = (key: string) => fireEvent.keyDown(screen.getByRole("tree"), { key });
/** The keys of all nodes with tabIndex 0 – there must be exactly one. */
const tabStops = () =>
  all()
    .filter((el) => el.getAttribute("tabindex") === "0")
    .map((el) => el.getAttribute("data-key"));

describe("Tab stop", () => {
  it("offers exactly one, and that at the active node", () => {
    render(<Fixture />);
    expect(tabStops()).toEqual(["a"]);
  });

  it("gives it to the first entry without an active node", () => {
    render(<Fixture defaultActive={null} />);
    expect(tabStops()).toEqual(["a"]);
  });

  it("stays on the same node after leaving and coming back", () => {
    render(<Fixture />);
    press("ArrowDown");
    press("ArrowDown");
    expect(tabStops()).toEqual(["c"]);
    // Leaving: focus goes outside.
    fireEvent.blur(screen.getByRole("tree"), { relatedTarget: document.body });
    // Back: the tab stop still sits where it sat – Tab lands there again.
    expect(tabStops()).toEqual(["c"]);
  });

  it("travels with the active node", () => {
    render(<Fixture />);
    press("ArrowDown");
    expect(tabStops()).toEqual(["b"]);
  });
});

describe("Arrow keys", () => {
  it("go down and up along what is visible", () => {
    render(<Fixture />);
    press("ArrowDown");
    expect(node("Leer").getAttribute("tabindex")).toBe("0");
    press("ArrowUp");
    expect(node("Anlagen").getAttribute("tabindex")).toBe("0");
  });

  it("skip the content of a closed branch", () => {
    render(<Fixture />);
    expect(screen.queryByRole("treeitem", { name: /Vertrag/ })).toBeNull();
    press("ArrowDown");
    expect(node("Leer").getAttribute("tabindex")).toBe("0");
  });

  it("open with right first and step inside afterwards", () => {
    render(<Fixture />);
    // One key press opens – and does not move the active node yet.
    press("ArrowRight");
    expect(node("Anlagen").getAttribute("aria-expanded")).toBe("true");
    expect(node("Anlagen").getAttribute("tabindex")).toBe("0");
    // The second one steps inside.
    press("ArrowRight");
    expect(node("Vertrag").getAttribute("tabindex")).toBe("0");
  });

  it("close with left first and step out afterwards", () => {
    render(<Fixture defaultExpanded={["a"]} />);
    press("ArrowLeft");
    expect(node("Anlagen").getAttribute("aria-expanded")).toBe("false");
    press("ArrowLeft");
    // A closed root has no parent: the active node stays where it is.
    expect(node("Anlagen").getAttribute("tabindex")).toBe("0");
  });

  it("step out of a child to the parent with left", () => {
    render(<Fixture defaultExpanded={["a"]} defaultActive="a1" />);
    press("ArrowLeft");
    expect(node("Anlagen").getAttribute("tabindex")).toBe("0");
  });

  it("do nothing with right at an empty branch", () => {
    render(<Fixture defaultActive="b" />);
    press("ArrowRight");
    expect(node("Leer").getAttribute("aria-expanded")).not.toBe("true");
    expect(node("Leer").getAttribute("tabindex")).toBe("0");
  });

  it("reach the ends with Home and End", () => {
    render(<Fixture />);
    press("End");
    expect(node("Einzelblatt").getAttribute("tabindex")).toBe("0");
    press("Home");
    expect(node("Anlagen").getAttribute("tabindex")).toBe("0");
  });
});

describe("Activating and checking stay separate", () => {
  it("reports Enter as an activation and checks nothing", () => {
    const onActivate = vi.fn();
    const onChecked = vi.fn();
    render(<Fixture checkable onActivate={onActivate} onChecked={onChecked} />);
    press("Enter");
    expect(onActivate).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }));
    expect(onChecked).not.toHaveBeenCalled();
  });

  it("checks with the space key and does not move the active node", () => {
    const onActivate = vi.fn();
    const onChecked = vi.fn();
    render(<Fixture checkable onActivate={onActivate} onChecked={onChecked} />);
    press(" ");
    expect(onChecked).toHaveBeenCalled();
    expect(onActivate).not.toHaveBeenCalled();
    expect(node("Anlagen").getAttribute("tabindex")).toBe("0");
  });
});

describe("What the screen reader gets to know", () => {
  it("names level, position and sibling count", () => {
    render(<Fixture defaultExpanded={["a"]} />);
    expect(node("Anlagen").getAttribute("aria-level")).toBe("1");
    expect(node("Anlagen").getAttribute("aria-posinset")).toBe("1");
    expect(node("Anlagen").getAttribute("aria-setsize")).toBe("3");
    expect(node("Vertrag").getAttribute("aria-level")).toBe("2");
    expect(node("Vertrag").getAttribute("aria-posinset")).toBe("1");
    expect(node("Vertrag").getAttribute("aria-setsize")).toBe("2");
  });

  it("says at a branch whether it is open – and nothing at all at a leaf", () => {
    render(<Fixture />);
    expect(node("Anlagen").getAttribute("aria-expanded")).toBe("false");
    expect(node("Einzelblatt").hasAttribute("aria-expanded")).toBe(false);
    // An empty branch cannot be opened and does not claim it either.
    expect(node("Leer").hasAttribute("aria-expanded")).toBe(false);
  });

  it("reports the checked state on the node, not on the checkbox", () => {
    render(<Fixture checkable defaultExpanded={["a", "a2"]} />);
    expect(node("Anlagen").getAttribute("aria-checked")).toBe("false");
    fireEvent.keyDown(screen.getByRole("tree"), { key: " " });
    expect(node("Anlagen").getAttribute("aria-checked")).toBe("true");
    expect(node("Skizze").getAttribute("aria-checked")).toBe("true");
  });

  it("shows a partially checked branch as mixed", () => {
    render(<Fixture checkable defaultExpanded={["a", "a2"]} defaultActive="a1" />);
    fireEvent.keyDown(screen.getByRole("tree"), { key: " " });
    expect(node("Vertrag").getAttribute("aria-checked")).toBe("true");
    expect(node("Anlagen").getAttribute("aria-checked")).toBe("mixed");
  });

  it("hides the visible checkbox from the screen reader", () => {
    render(<Fixture checkable />);
    // Otherwise it would announce the same state a second time.
    const boxes = document.querySelectorAll('input[type="checkbox"]');
    expect(boxes.length).toBeGreaterThan(0);
    boxes.forEach((b) => expect(b.getAttribute("aria-hidden")).toBe("true"));
  });

  it("keeps no space free for ticks where there are none", () => {
    render(<Fixture />);
    expect(document.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(node("Anlagen").hasAttribute("aria-checked")).toBe(false);
  });

  it("carries the tree as a named structure", () => {
    render(<Fixture />);
    expect(screen.getByRole("tree").getAttribute("aria-label")).toBe("Ablage");
  });
});

describe("Checking, through the surface", () => {
  /** The set reported last, as a sorted list. */
  function lastSet(spy: ReturnType<typeof vi.fn>): string[] {
    const calls = spy.mock.calls;
    const last = calls[calls.length - 1]?.[0] as ReadonlySet<string> | undefined;
    return last === undefined ? [] : [...last].sort();
  }

  const box = (name: string) =>
    node(name).querySelector('input[type="checkbox"]') as HTMLInputElement;

  it("cascades through a closed branch down to nodes never rendered", () => {
    const onChecked = vi.fn();
    render(<Fixture checkable onChecked={onChecked} />);
    // "Skizze" does not stand in the document – the branch is closed.
    expect(screen.queryByRole("treeitem", { name: /Skizze/ })).toBeNull();
    fireEvent.click(box("Anlagen"));
    // That is exactly the point of the cascade: it reaches what the user does
    // not see. Whoever walks the flattening instead of the tree passes every
    // test that only looks at open branches.
    expect(lastSet(onChecked)).toEqual(["a", "a1", "a2", "a2x"]);
  });

  it("reports branches together with leaves, not only leaves", () => {
    const onChecked = vi.fn();
    render(<Fixture checkable onChecked={onChecked} defaultExpanded={["a", "a2"]} />);
    fireEvent.click(box("Anlagen"));
    const set = lastSet(onChecked);
    expect(set).toContain("a");
    expect(set).toContain("a2");
    expect(set).toContain("a2x");
  });

  it("turns the branch on as soon as its last child is checked – up to the top", () => {
    render(<Fixture checkable defaultExpanded={["a", "a2"]} />);
    fireEvent.click(box("Vertrag"));
    expect(node("Anlagen").getAttribute("aria-checked")).toBe("mixed");
    fireEvent.click(box("Skizze"));
    // "Skizze" is the only child of "Bilder" – both become full.
    expect(node("Bilder").getAttribute("aria-checked")).toBe("true");
    expect(node("Anlagen").getAttribute("aria-checked")).toBe("true");
  });

  it("takes the branch out again as soon as a child is unchecked", () => {
    render(<Fixture checkable defaultExpanded={["a", "a2"]} />);
    fireEvent.click(box("Anlagen"));
    expect(node("Anlagen").getAttribute("aria-checked")).toBe("true");
    fireEvent.click(box("Skizze"));
    expect(node("Bilder").getAttribute("aria-checked")).toBe("false");
    expect(node("Anlagen").getAttribute("aria-checked")).toBe("mixed");
  });

  it("toggles exactly once per gesture", () => {
    /* The box lies inside a label and the label inside a span. A click used
       to run through both paths: the box's onChange *and* the span's onClick.
       Toggling twice means not toggling at all - in the browser nothing
       happened, while jsdom covered it up because both calls computed the
       same thing from the same state. What is counted is therefore the
       gestures, not the result. */
    const onChecked = vi.fn();
    render(<Fixture checkable onChecked={onChecked} />);
    fireEvent.click(box("Einzelblatt"));
    expect(onChecked).toHaveBeenCalledTimes(1);
  });

  it("toggles exactly once on a click on the label too", () => {
    const onChecked = vi.fn();
    render(<Fixture checkable onChecked={onChecked} />);
    const label = node("Einzelblatt").querySelector("label") as HTMLElement;
    fireEvent.click(label);
    expect(onChecked).toHaveBeenCalledTimes(1);
    expect([...(onChecked.mock.calls[0]?.[0] as ReadonlySet<string>)]).toEqual(["c"]);
  });

  it("checks with the box without moving the active node", () => {
    const onActivate = vi.fn();
    render(<Fixture checkable onActivate={onActivate} />);
    fireEvent.click(box("Einzelblatt"));
    expect(onActivate).not.toHaveBeenCalled();
    expect(tabStops()).toEqual(["a"]);
  });
});

describe("Mouse", () => {
  it("toggles with the chevron without activating", () => {
    const onActivate = vi.fn();
    render(<Fixture onActivate={onActivate} defaultActive={null} />);
    const chevron = node("Anlagen").querySelector("span[aria-hidden]") as HTMLElement;
    fireEvent.click(chevron);
    expect(node("Anlagen").getAttribute("aria-expanded")).toBe("true");
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("activates with the label without checking", () => {
    const onActivate = vi.fn();
    const onChecked = vi.fn();
    render(<Fixture checkable onActivate={onActivate} onChecked={onChecked} />);
    fireEvent.click(node("Einzelblatt"));
    expect(onActivate).toHaveBeenCalledWith(expect.objectContaining({ id: "c" }));
    expect(onChecked).not.toHaveBeenCalled();
  });
});

/* ============ What cannot be checked, in the surface ============ */

const EDGE_CASES: Folder[] = [
  {
    id: "g",
    name: "Gemischt",
    children: [
      { id: "g1", name: "Frei" },
      { id: "g2", name: "Gesperrt", disabled: true },
    ],
  },
  { id: "u", name: "Ungeladen", unloaded: true },
];

const EDGE_READER: NodeReader<Folder> = {
  ...READER,
  disabled: (o) => o.disabled === true,
  unloaded: (o) => o.unloaded === true,
};

function EdgeFixture({
  onChecked = vi.fn(),
  onLoadChildren = vi.fn(),
  onActivate = vi.fn(),
}) {
  const tree = useTree(EDGE_CASES, {
    reader: EDGE_READER,
    defaultExpanded: ["g"],
    defaultActive: "g",
    onChecked,
    onLoadChildren,
    onActivate,
  });
  return (
    <TreeView tree={tree} ariaLabel="Grenzen" checkable>
      {(e) => e.node.name}
    </TreeView>
  );
}

describe("The anchor", () => {
  function AnchorFixture({ onAnchor = vi.fn() }) {
    const tree = useTree(TREE, { reader: READER, defaultActive: "a", onAnchor });
    return (
      <TreeView tree={tree} ariaLabel="Anker" checkable>
        {(e) => e.node.name}
      </TreeView>
    );
  }
  const box = (name: string) =>
    node(name).querySelector('input[type="checkbox"]') as HTMLInputElement;

  it("is set by a single check and travels with every further one", () => {
    const onAnchor = vi.fn();
    render(<AnchorFixture onAnchor={onAnchor} />);
    fireEvent.click(box("Einzelblatt"));
    expect(onAnchor).toHaveBeenLastCalledWith("c");
    fireEvent.click(box("Leer"));
    expect(onAnchor).toHaveBeenLastCalledWith("b");
  });

  it("can be set from outside", () => {
    function Controlled() {
      const tree = useTree(TREE, { reader: READER, anchor: "c", defaultActive: "a" });
      // Without an anchor of its own the gesture would span from the active
      // node.
      return (
        <TreeView tree={tree} ariaLabel="Gesteuert" checkable>
          {(e) => e.node.name}
        </TreeView>
      );
    }
    render(<Controlled />);
    expect(screen.getByRole("tree")).toBeTruthy();
  });
});

describe("Shift with an arrow key", () => {
  function CountFixture({ onActive = vi.fn(), onChecked = vi.fn() }) {
    const tree = useTree(TREE, {
      reader: READER,
      defaultActive: "a",
      onActive,
      onChecked,
    });
    return (
      <TreeView tree={tree} ariaLabel="Zaehlen" checkable>
        {(e) => e.node.name}
      </TreeView>
    );
  }

  it("reports the active node exactly once per gesture", () => {
    /* One gesture, one report. Whoever moves first and then calls a gesture
       that moves by itself reports twice - and both times from the same stale
       state. Exactly the defect this library already had once with the boxes,
       and the reason why here the gestures are counted and not compared. */
    const onActive = vi.fn();
    render(<CountFixture onActive={onActive} />);
    fireEvent.keyDown(screen.getByRole("tree"), { key: "ArrowDown", shiftKey: true });
    expect(onActive).toHaveBeenCalledTimes(1);
  });

  it("moves and checks in one go", () => {
    const onChecked = vi.fn();
    render(<CountFixture onChecked={onChecked} />);
    fireEvent.keyDown(screen.getByRole("tree"), { key: "ArrowDown", shiftKey: true });
    expect(node("Leer").getAttribute("tabindex")).toBe("0");
    expect(onChecked).toHaveBeenCalledTimes(1);
    expect([...(onChecked.mock.calls[0]?.[0] as ReadonlySet<string>)]).toEqual(["b"]);
  });
});

describe("Disabled nodes", () => {
  const box = (name: string) =>
    node(name).querySelector('input[type="checkbox"]') as HTMLInputElement;

  it("shows the box instead of leaving it out", () => {
    // A missing box would mean "this node has none" – a different statement
    // from "you may not check this one" – and would shift the row.
    render(<EdgeFixture />);
    expect(box("Gesperrt")).toBeTruthy();
    expect(box("Gesperrt").disabled).toBe(true);
    expect(box("Frei").disabled).toBe(false);
  });

  it("reports nothing when it is clicked", () => {
    const onChecked = vi.fn();
    render(<EdgeFixture onChecked={onChecked} />);
    fireEvent.click(box("Gesperrt"));
    expect(onChecked).not.toHaveBeenCalled();
  });

  it("reports nothing when the space key is pressed", () => {
    const onChecked = vi.fn();
    render(<EdgeFixture onChecked={onChecked} />);
    fireEvent.keyDown(screen.getByRole("tree"), { key: "End" });
    fireEvent.keyDown(screen.getByRole("tree"), { key: "ArrowUp" });
    expect(node("Gesperrt").getAttribute("tabindex")).toBe("0");
    fireEvent.keyDown(screen.getByRole("tree"), { key: " " });
    expect(onChecked).not.toHaveBeenCalled();
  });

  it("stays navigable and activatable", () => {
    const onActivate = vi.fn();
    render(<EdgeFixture onActivate={onActivate} />);
    fireEvent.click(node("Gesperrt"));
    expect(onActivate).toHaveBeenCalledWith(expect.objectContaining({ id: "g2" }));
  });

  it("tells the screen reader that it is not available", () => {
    render(<EdgeFixture />);
    expect(node("Gesperrt").getAttribute("aria-disabled")).toBe("true");
    expect(node("Frei").hasAttribute("aria-disabled")).toBe(false);
  });
});

describe("Unloaded branches", () => {
  it("looks like a branch and not like a leaf", () => {
    render(<EdgeFixture />);
    expect(node("Ungeladen").getAttribute("aria-expanded")).toBe("false");
  });

  it("reports the expanding exactly once", () => {
    const onLoadChildren = vi.fn();
    render(<EdgeFixture onLoadChildren={onLoadChildren} />);
    const chevron = node("Ungeladen").querySelector("span[aria-hidden]") as HTMLElement;
    fireEvent.click(chevron);
    expect(onLoadChildren).toHaveBeenCalledTimes(1);
    expect(onLoadChildren).toHaveBeenCalledWith(expect.objectContaining({ id: "u" }));
  });

  it("reports nothing for a loaded branch", () => {
    const onLoadChildren = vi.fn();
    render(<EdgeFixture onLoadChildren={onLoadChildren} />);
    const chevron = () => node("Gemischt").querySelector("span[aria-hidden]") as HTMLElement;
    // "Gemischt" starts open: first closed, then open again. Only the
    // expanding could report, so it has to actually occur here.
    fireEvent.click(chevron());
    expect(node("Gemischt").getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(chevron());
    expect(node("Gemischt").getAttribute("aria-expanded")).toBe("true");
    expect(onLoadChildren).not.toHaveBeenCalled();
  });

  it("shows while expanding that loading is happening", () => {
    render(<EdgeFixture />);
    const chevron = node("Ungeladen").querySelector("span[aria-hidden]") as HTMLElement;
    fireEvent.click(chevron);
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("cannot be checked", () => {
    const onChecked = vi.fn();
    render(<EdgeFixture onChecked={onChecked} />);
    const box = node("Ungeladen").querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(box.disabled).toBe(true);
    fireEvent.click(box);
    expect(onChecked).not.toHaveBeenCalled();
  });
});
