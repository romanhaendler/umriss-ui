/* The table's Search tells the on-screen keyboard what Enter does. */

import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Search, Toolbar, useTable } from "../src";

const ROWS = [{ id: "1", n: "A" }];

function List() {
  const { Table: Frame, Column } = useTable(ROWS, { rowKey: (a) => a.id });
  return (
    <Frame>
      <Toolbar>
        <Search />
      </Toolbar>
      <Column value="n" label="N" rowHeader />
    </Frame>
  );
}

it("says search and keeps autofill off", () => {
  render(<List />);
  const input = screen.getByRole("searchbox");
  expect(input.getAttribute("enterkeyhint")).toBe("search");
  expect(input.getAttribute("autocomplete")).toBe("off");
});
