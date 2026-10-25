import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Calculation, Given, Sum } from "../src";

describe("the elements rendered on their own", () => {
  it("throw the error that says to write the tree inside the calculation", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Sum label="Total" />)).toThrow(/directly inside a <Calculation>.*not passed through a client component/s);
    expect(() => render(<Given label="Rate" value={1} />)).toThrow(/@umriss-ui\/calculation/);
  });

  it("do not stop a tree that comes from a map", () => {
    render(
      <Calculation aria-label="Sheet">
        <Sum label="Total">
          {[1, 2, 3].map((n) => (
            <Given key={n} label={`Row ${n}`} value={n} />
          ))}
        </Sum>
      </Calculation>,
    );
    expect(screen.getByText("Row 2")).toBeTruthy();
  });
});
