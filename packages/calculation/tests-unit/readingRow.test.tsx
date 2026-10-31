import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Calculation, Given, Sum } from "../src";
import { OeeCalculation } from "./oee";

describe("Reading and folding a row", () => {
  it("names every missing given in the reason, not only the first", () => {
    render(
      <Calculation aria-label="Total">
        <Sum label="Total">
          <Given label="Alpha" value={null} />
          <Given label="Beta" value={null} />
          <Given label="Gamma" value={3} />
        </Sum>
      </Calculation>,
    );
    const reason = [...document.querySelectorAll("[class*=assessment]")].at(-1)!.textContent!;
    expect(reason).toContain("Alpha");
    expect(reason).toContain("Beta");
    expect(reason).not.toContain("Gamma");
  });

  it("gives the disclosure the row's sentence, figure included, as its description", () => {
    render(<OeeCalculation />);
    const button = screen.getByRole("button", { name: "Show how Availability is derived" });
    const described = document.getElementById(button.getAttribute("aria-describedby")!);
    expect(described?.textContent).toMatch(/91\.6/);
  });

  it("does not fold a row on the second or third click of a multiple click", () => {
    render(<OeeCalculation />);
    const button = screen.getByRole("button", { name: "Show how Availability is derived" });
    const row = button.closest("[data-foldable]")!;
    fireEvent.click(row, { detail: 2 });
    fireEvent.click(row, { detail: 3 });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(row, { detail: 1 });
    expect(button.getAttribute("aria-expanded")).toBe("true");
  });
});
