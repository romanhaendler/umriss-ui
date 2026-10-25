/* The current row (ADR-0071): the application holds its key; the table marks
   the row and reports a click on it. */

import type { ReactElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTable } from "../src";

interface Machine {
  id: string;
  name: string;
  line: string;
}

const MACHINES: Machine[] = [
  { id: "m1", name: "Press", line: "L1" },
  { id: "m2", name: "Lathe", line: "L1" },
  { id: "m3", name: "Mill", line: "L2" },
];

function Machines({
  currentRow,
  onCurrentRowChange,
  grouped = false,
  props = true,
}: {
  currentRow?: string | null;
  onCurrentRowChange?: (key: string, row: Machine) => void;
  grouped?: boolean;
  props?: boolean;
}) {
  const t = useTable(MACHINES, { rowKey: (m) => m.id, defaultGrouping: grouped ? ["line"] : undefined });
  const { Table: Frame, Column, RowDetail, RowActions, Action } = t;
  const current = props ? { currentRow, onCurrentRowChange } : {};
  return (
    <Frame selectable {...current}>
      <Column value="name" label="Machine" rowHeader />
      <Column value="line" label="Line" children={(v) => <button type="button">Go {String(v)}</button>} />
      <RowDetail>{(m) => <p>Detail {m.name}</p>}</RowDetail>
      <RowActions>
        <Action onSelect={() => undefined}>Open</Action>
      </RowActions>
    </Frame>
  );
}

const rowOf = (name: string) => screen.getByText(name).closest("tr")!;

describe("The current row", () => {
  it("a click on a cell reports the key and the row", () => {
    const on = vi.fn();
    render(<Machines onCurrentRowChange={on} />);
    fireEvent.click(screen.getByText("Lathe"));
    expect(on).toHaveBeenCalledWith("m2", MACHINES[1]);
  });

  it("the checkbox, the expander, a row action and a button in a cell report nothing", () => {
    const on = vi.fn();
    render(<Machines onCurrentRowChange={on} />);
    fireEvent.click(rowOf("Press").querySelector("input[type=checkbox]")!);
    fireEvent.click(rowOf("Press").querySelector("button[aria-expanded]")!);
    fireEvent.click(screen.getAllByText("Open")[0]!);
    fireEvent.click(screen.getAllByText("Go L1")[0]!);
    expect(on).not.toHaveBeenCalled();
  });

  it("a group header and a detail report nothing", () => {
    const on = vi.fn();
    const { unmount } = render(<Machines onCurrentRowChange={on} grouped />);
    fireEvent.click(document.querySelector("tr[data-line]:not([data-line=row])")!);
    expect(on).not.toHaveBeenCalled();
    unmount();
    render(<Machines onCurrentRowChange={on} />);
    fireEvent.click(rowOf("Press").querySelector("button[aria-expanded]")!);
    fireEvent.click(screen.getByText("Detail Press"));
    expect(on).not.toHaveBeenCalled();
  });

  it("a click on the current row reports again", () => {
    const on = vi.fn();
    render(<Machines currentRow="m1" onCurrentRowChange={on} />);
    fireEvent.click(screen.getByText("Press"));
    expect(on).toHaveBeenCalledTimes(1);
  });

  it("aria-current stands on the current row only", () => {
    render(<Machines currentRow="m2" />);
    expect(document.querySelectorAll("[aria-current]")).toHaveLength(1);
    expect(rowOf("Lathe").getAttribute("aria-current")).toBe("true");
  });

  it("the selection and the current row are independent", () => {
    const on = vi.fn();
    render(<Machines currentRow="m1" onCurrentRowChange={on} />);
    fireEvent.click(rowOf("Lathe").querySelector("input[type=checkbox]")!);
    expect(rowOf("Press").getAttribute("aria-current")).toBe("true");
    expect(rowOf("Lathe").getAttribute("aria-current")).toBeNull();
    fireEvent.click(screen.getByText("Mill"));
    expect(rowOf("Mill").hasAttribute("data-selected")).toBe(false);
    expect(rowOf("Lathe").hasAttribute("data-selected")).toBe(true);
  });

  it("without the props the DOM is today's", () => {
    /* The ids React hands out differ between two renders; the rest must not. */
    const html = (el: ReactElement) => render(el).container.innerHTML.replace(/_r_\w+_/g, "id");
    const a = html(<Machines props={false} />);
    const b = html(<Machines currentRow={null} />);
    expect(b).toBe(a);
  });
});
