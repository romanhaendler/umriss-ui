/* Search and virtualisation (tree-view 05).

   The two stand together because they cross each other, not because they
   resemble each other: the search changes what the flattening contains, the
   virtualisation how much of it reaches the document. The defect sits in the
   crossing - numbers taken from what is rendered look right until a filter
   runs, and right under a filter until virtualisation starts. */

import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TreeSearch, TreeView, useTree, type NodeReader } from "../src/components/TreeView";

interface Folder {
  id: string;
  name: string;
  children?: Folder[];
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
  {
    id: "d",
    name: "Archiv",
    children: [{ id: "d1", name: "Zweitausend", children: [{ id: "d1a", name: "Kassenbuch" }] }],
  },
];

/** A wide tree on which a window shows itself at all. */
const MANY: Folder[] = Array.from({ length: 200 }, (_, i) => ({
  id: `k${i}`,
  name: `Knoten ${i}`,
}));

const READER: NodeReader<Folder> = {
  key: (o) => o.id,
  children: (o) => o.children,
  label: (o) => o.name,
};

function Fixture({
  roots = TREE,
  virtual,
  defaultExpanded = [] as string[],
  withSearchField = false,
}: {
  roots?: Folder[];
  virtual?: { rowHeight: number; overscan?: number };
  defaultExpanded?: string[];
  withSearchField?: boolean;
}) {
  const tree = useTree(roots, { reader: READER, defaultExpanded, virtual });
  return (
    <>
      {withSearchField ? <TreeSearch tree={tree} aria-label="Suche" /> : null}
      <TreeView tree={tree} ariaLabel="Ablage">
        {(e) => e.node.name}
      </TreeView>
    </>
  );
}

const labels = () =>
  screen.queryAllByRole("treeitem").map((el) => el.textContent?.trim() ?? "");
const search = (text: string) =>
  fireEvent.change(screen.getByLabelText("Suche"), { target: { value: text } });

describe("Search in the surface", () => {
  it("shows a deep match with its whole path, although everything is closed", () => {
    render(<Fixture withSearchField />);
    expect(labels()).toEqual(["Anlagen", "Leer", "Einzelblatt", "Archiv"]);
    search("Kassenbuch");
    expect(labels()).toEqual(["Archiv", "Zweitausend", "Kassenbuch"]);
  });

  it("restores the tree exactly when the search is emptied", () => {
    render(<Fixture withSearchField defaultExpanded={["a"]} />);
    const before = labels();
    search("Kassenbuch");
    expect(labels()).not.toEqual(before);
    search("");
    expect(labels()).toEqual(before);
  });

  it("shows the empty state instead of an empty box when nothing matches", () => {
    render(<Fixture withSearchField />);
    search("Regenbogen");
    expect(labels()).toEqual([]);
    expect(screen.getByText(/Nothing matches the search/)).toBeTruthy();
  });

  it("tells matches apart from nodes that stand there only for the path's sake", () => {
    render(<Fixture withSearchField />);
    search("Kassenbuch");
    const className = (name: string) =>
      screen.getByRole("treeitem", { name: new RegExp(name) }).className;
    // What is dimmed is what only shows the way – not every non-match.
    expect(className("Archiv")).not.toBe(className("Kassenbuch"));
  });

  it("does not dim children under a match – they are context", () => {
    render(<Fixture withSearchField defaultExpanded={["a"]} />);
    const classNames = () =>
      new Set(screen.getAllByRole("treeitem").map((el) => el.className));

    search("Kassenbuch");
    // Signpost and match look different – two appearances.
    expect(classNames().size).toBe(2);

    search("Anlagen");
    // Here there is no signpost: "Vertrag" and "Bilder" do not match, but
    // they stand under a match and are thereby context. All rows look the
    // same – matches are not highlighted.
    expect(screen.getAllByRole("treeitem").length).toBeGreaterThan(1);
    expect(classNames().size).toBe(1);
  });
});

describe("Virtualisation", () => {
  it("renders every node without it", () => {
    render(<Fixture roots={MANY} />);
    expect(screen.getAllByRole("treeitem")).toHaveLength(200);
  });

  it("renders only a window with it", () => {
    render(<Fixture roots={MANY} virtual={{ rowHeight: 26 }} />);
    const rendered = screen.getAllByRole("treeitem").length;
    expect(rendered).toBeGreaterThan(0);
    expect(rendered).toBeLessThan(200);
  });

  it("reports the same positions and sibling counts as without it", () => {
    // The crossing: the numbers come from the flattening and never from what
    // happens to stand in the document (ADR-0004).
    const { unmount } = render(<Fixture roots={MANY} />);
    const without = screen.getAllByRole("treeitem").slice(0, 5).map((el) => ({
      pos: el.getAttribute("aria-posinset"),
      size: el.getAttribute("aria-setsize"),
    }));
    unmount();
    render(<Fixture roots={MANY} virtual={{ rowHeight: 26 }} />);
    const with_ = screen.getAllByRole("treeitem").slice(0, 5).map((el) => ({
      pos: el.getAttribute("aria-posinset"),
      size: el.getAttribute("aria-setsize"),
    }));
    expect(with_).toEqual(without);
    expect(with_[0]?.size).toBe("200");
  });

  it("keeps exactly one tab stop even with a window", () => {
    render(<Fixture roots={MANY} virtual={{ rowHeight: 26 }} />);
    const stops = screen
      .getAllByRole("treeitem")
      .filter((el) => el.getAttribute("tabindex") === "0");
    expect(stops).toHaveLength(1);
  });

  it("reaches a node outside the window with the keyboard too", () => {
    render(<Fixture roots={MANY} virtual={{ rowHeight: 26 }} />);
    expect(screen.queryByRole("treeitem", { name: /Knoten 199$/ })).toBeNull();
    fireEvent.keyDown(screen.getByRole("tree"), { key: "End" });
    // The active node is a key, not an element: the window has to follow it,
    // otherwise there would be nothing to focus.
    const last = screen.getByRole("treeitem", { name: /Knoten 199$/ });
    expect(last.getAttribute("tabindex")).toBe("0");
  });

  it("lets sibling counts shrink under a filter", () => {
    render(<Fixture withSearchField virtual={{ rowHeight: 26 }} />);
    search("a");
    // "Leer" drops out: three of four roots survive. The levels below open
    // because something matches there too – counting still happens per set
    // of siblings.
    const roots = screen
      .getAllByRole("treeitem")
      .filter((el) => el.getAttribute("aria-level") === "1");
    expect(roots.map((el) => el.textContent?.trim())).toEqual([
      "Anlagen",
      "Einzelblatt",
      "Archiv",
    ]);
    expect(roots.map((el) => el.getAttribute("aria-setsize"))).toEqual(["3", "3", "3"]);
    expect(roots.map((el) => el.getAttribute("aria-posinset"))).toEqual(["1", "2", "3"]);
  });
});
