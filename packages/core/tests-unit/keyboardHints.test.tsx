/* What the on-screen keyboard is told in the library's own fields, and the
   palette's close for a finger. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Combobox } from "../src/components/Combobox";
import { CommandPalette } from "../src/components/CommandPalette";
import { MultiSelect } from "../src/components/MultiSelect";
import { TreeSearch, useTree, type NodeReader } from "../src/components/TreeView";

const OPTIONS = [{ value: "a", label: "Alpha" }];
const READER: NodeReader<{ id: string }> = { key: (o) => o.id, children: () => undefined, label: (o) => o.id };
const ROOTS = [{ id: "a" }];

function Search(props: { enterKeyHint?: "go"; autoComplete?: string }) {
  const tree = useTree(ROOTS, { reader: READER });
  return <TreeSearch tree={tree} aria-label="Find" {...props} />;
}

describe("keyboard hints", () => {
  it("the palette closes through its cross", () => {
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} items={[]} onChoose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("the palette's field says go", () => {
    render(<CommandPalette open onClose={vi.fn()} items={[]} onChoose={vi.fn()} />);
    expect(screen.getByRole("combobox").getAttribute("enterkeyhint")).toBe("go");
  });

  it("the combobox says done and keeps autofill off", () => {
    render(<Combobox options={OPTIONS} value={null} onChange={vi.fn()} aria-label="Letter" />);
    const input = screen.getByRole("combobox");
    expect(input.getAttribute("enterkeyhint")).toBe("done");
    expect(input.getAttribute("autocomplete")).toBe("off");
  });

  it("the multiselect's search says done and keeps autofill off", () => {
    render(<MultiSelect options={OPTIONS} value={[]} onChange={vi.fn()} aria-label="Letters" />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    const input = screen.getByRole("textbox", { name: "Search options" });
    expect(input.getAttribute("enterkeyhint")).toBe("done");
    expect(input.getAttribute("autocomplete")).toBe("off");
  });

  it("the tree search says search, and a caller's value wins", () => {
    const { unmount } = render(<Search />);
    const input = screen.getByRole("searchbox");
    expect(input.getAttribute("enterkeyhint")).toBe("search");
    expect(input.getAttribute("autocomplete")).toBe("off");
    unmount();
    render(<Search enterKeyHint="go" autoComplete="on" />);
    expect(screen.getByRole("searchbox").getAttribute("enterkeyhint")).toBe("go");
    expect(screen.getByRole("searchbox").getAttribute("autocomplete")).toBe("on");
  });
});
