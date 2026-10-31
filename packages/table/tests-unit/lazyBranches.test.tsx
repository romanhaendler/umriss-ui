/* Tree rows whose children load on opening: `childRows` answers `null` for a
   branch not loaded, opening it calls `onBranchOpen`, a promise shows a
   loading line and a rejection its message with "Try again". */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { useTable } from "../src";

interface Folder {
  id: string;
  name: string;
  kids?: Folder[] | null;
}

const ROOTS: Folder[] = [
  { id: "a", name: "Docs", kids: null },
  { id: "b", name: "Leaf" },
];

function Files({ open, defaultBranches }: { open: (key: string, row: Folder) => void | Promise<unknown>; defaultBranches?: string[] }) {
  const [rows, setRows] = useState(ROOTS);
  const t = useTable(rows, {
    rowKey: (f) => f.id,
    childRows: (f) => f.kids,
    defaultBranches,
    onBranchOpen: (key, row) => {
      const result = open(key, row);
      if (key === "a" && !(result instanceof Promise)) setRows([{ ...ROOTS[0]!, kids: [{ id: "a1", name: "Report" }] }, ROOTS[1]!]);
      return result;
    },
  });
  const { Table, Column } = t;
  return (
    <>
      <Table aria-label="Files">
        <Column value="name" label="Name" rowHeader />
      </Table>
      <button type="button" onClick={() => setRows([{ ...ROOTS[0]!, kids: [{ id: "a1", name: "Report" }] }, ROOTS[1]!])}>
        arrive
      </button>
    </>
  );
}

const fold = () => screen.getByRole("button", { name: /Unfold rows under Docs|Fold rows under Docs/ });

describe("lazy branches", () => {
  it("gives a null branch a fold and calls onBranchOpen once on opening", () => {
    const open = vi.fn();
    render(<Files open={open} />);
    expect(screen.getAllByRole("button", { name: /rows under/ })).toHaveLength(1);
    expect(open).not.toHaveBeenCalled();
    fireEvent.click(fold());
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith("a", ROOTS[0]);
    expect(screen.getByText("Report")).toBeTruthy();
  });

  it("shows a loading line with aria-busy while the promise is pending, then the rows", async () => {
    let done!: () => void;
    const open = vi.fn(() => new Promise<void>((resolve) => (done = resolve)));
    render(<Files open={open} />);
    fireEvent.click(fold());
    expect(screen.getByRole("status").textContent).toContain("Loading rows under Docs");
    expect(document.querySelector("[aria-busy]")?.getAttribute("aria-busy")).toBe("true");
    fireEvent.click(screen.getByText("arrive"));
    await act(async () => done());
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByText("Report")).toBeTruthy();
    expect(document.querySelector("[aria-busy]")).toBeNull();
  });

  it("shows the rejection's message with Try again, which asks once more", async () => {
    const open = vi.fn().mockRejectedValueOnce(new Error("Disk offline")).mockResolvedValueOnce(undefined);
    render(<Files open={open} />);
    fireEvent.click(fold());
    await act(async () => {});
    expect(screen.getByRole("alert").textContent).toBe("Disk offline");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(open).toHaveBeenCalledTimes(2);
    await act(async () => {});
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("calls onBranchOpen on the first render for a branch in defaultBranches", () => {
    const open = vi.fn();
    render(<Files open={open} defaultBranches={["a"]} />);
    expect(open).toHaveBeenCalledWith("a", ROOTS[0]);
  });

  it("opens with ArrowRight on the fold", () => {
    const open = vi.fn();
    render(<Files open={open} />);
    fireEvent.keyDown(fold(), { key: "ArrowRight" });
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("leaves a closed unloaded branch out of unfoldAllBranches", () => {
    const open = vi.fn();
    function All() {
      const t = useTable(ROOTS, { rowKey: (f) => f.id, childRows: (f) => f.kids, onBranchOpen: open });
      return <button type="button" onClick={t.unfoldAllBranches}>all</button>;
    }
    render(<All />);
    fireEvent.click(screen.getByText("all"));
    expect(open).not.toHaveBeenCalled();
  });
});
