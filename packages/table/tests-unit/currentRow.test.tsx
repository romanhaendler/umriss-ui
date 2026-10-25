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

function Keyed({ grid = false, rowHeader = true, tree = false, onCurrentRowChange }: {
  grid?: boolean;
  rowHeader?: boolean;
  tree?: boolean;
  onCurrentRowChange?: (key: string, row: Machine) => void;
}) {
  const t = useTable(MACHINES, { rowKey: (m) => m.id, childRows: tree ? (m) => (m.id === "m1" ? [MACHINES[1]!] : undefined) : undefined });
  const { Table: Frame, Column } = t;
  return (
    <Frame grid={grid} selectable onCurrentRowChange={onCurrentRowChange}>
      <Column value="name" label="Machine" rowHeader={rowHeader} />
      <Column value="line" label="Line" children={(v) => (v === "L2" ? <button type="button">Go</button> : String(v))} />
    </Frame>
  );
}

describe("The current row by the keyboard", () => {
  it("a native table's row header holds one button per row, and Enter on it reports", () => {
    const on = vi.fn();
    render(<Keyed onCurrentRowChange={on} />);
    expect(document.querySelectorAll("tbody th button")).toHaveLength(3);
    /* A button answers Enter and Space with a click; jsdom does not translate the key. */
    fireEvent.click(screen.getByRole("button", { name: "Lathe" }));
    expect(on).toHaveBeenCalledWith("m2", MACHINES[1]);
  });

  it("the current row's button carries aria-current", () => {
    render(<Machines currentRow="m2" onCurrentRowChange={() => undefined} />);
    expect(screen.getByRole("button", { name: "Lathe" }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("button", { name: "Press" }).hasAttribute("aria-current")).toBe(false);
  });

  it("a tree row's toggle stays outside the button", () => {
    render(<Keyed tree onCurrentRowChange={() => undefined} />);
    const toggle = document.querySelector("[data-branch-key]")!;
    const button = toggle.closest("th")!.querySelector("button:not([data-branch-key])")!;
    expect(button).not.toBeNull();
    expect(button.contains(toggle)).toBe(false);
  });

  it("in grid mode no button is rendered", () => {
    render(<Keyed grid onCurrentRowChange={() => undefined} />);
    expect(document.querySelectorAll("tbody th button")).toHaveLength(0);
  });

  it("in grid mode Enter on a plain cell reports, on a cell with a control enters it, and Space selects", () => {
    const on = vi.fn();
    render(<Keyed grid onCurrentRowChange={on} />);
    const cell = (text: string) => screen.getByText(text).closest("td,th") as HTMLElement;
    cell("Lathe").focus();
    fireEvent.keyDown(cell("Lathe"), { key: "Enter" });
    expect(on).toHaveBeenCalledWith("m2", MACHINES[1]);
    on.mockClear();
    cell("Go").focus();
    fireEvent.keyDown(cell("Go"), { key: "Enter" });
    expect(on).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByText("Go"));
    cell("Press").focus();
    fireEvent.keyDown(cell("Press"), { key: " " });
    expect(on).not.toHaveBeenCalled();
    expect(rowOf("Press").hasAttribute("data-selected")).toBe(true);
  });

  it("without a row header there is one development warning, and none in a production build", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const first = render(<Keyed rowHeader={false} onCurrentRowChange={() => undefined} />);
    first.rerender(<Keyed rowHeader={false} onCurrentRowChange={() => undefined} />);
    expect(warn.mock.calls.filter(([m]) => String(m).includes("row header"))).toHaveLength(1);
    first.unmount();
    warn.mockClear();
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const [{ render: renderAgain }, { createElement }] = await Promise.all([import("@testing-library/react"), import("react")]);
    const { useTable: useTableAgain } = await import("../src");
    function Bare() {
      const { Table: Frame, Column } = useTableAgain(MACHINES, { rowKey: (m) => m.id });
      return createElement(Frame, { onCurrentRowChange: () => undefined }, createElement(Column, { value: "name", label: "Machine" }));
    }
    renderAgain(createElement(Bare));
    expect(warn).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
    warn.mockRestore();
  });
});
