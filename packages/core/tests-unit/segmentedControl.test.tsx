/* Segmented control (field-row-alignment 04). One choice out of a few short
   possibilities, drawn as one field - and in what it says and how the keys
   move, a radio group. What is checked is what a person observes: what the
   screen reader is told, where the tab stop sits, where the arrow keys lead
   and what is chosen. */

import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { SegmentedControl } from "../src/components/SegmentedControl";
import { FormField } from "../src/components/FormField";

const OPTIONS = [
  { value: "raw", label: "Raw" },
  { value: "cleaned", label: "Cleaned" },
  { value: "archived", label: "Archived", disabled: true },
  { value: "forecast", label: "Forecast" },
] as const;

const radio = (name: string) => screen.getByRole("radio", { name }) as HTMLInputElement;

describe("SegmentedControl – what it says", () => {
  it("is a radio group, each segment a radio named by its label", () => {
    render(<SegmentedControl aria-label="State of the data" options={OPTIONS} value="raw" onChange={vi.fn()} />);
    expect(screen.getByRole("radiogroup", { name: "State of the data" })).toBeTruthy();
    expect(screen.getAllByRole("radio").map((r) => r.getAttribute("value"))).toEqual(["raw", "cleaned", "archived", "forecast"]);
    expect(radio("Raw").checked).toBe(true);
    expect(radio("Cleaned").checked).toBe(false);
  });

  it("keeps a disabled possibility visible but closed", () => {
    render(<SegmentedControl aria-label="State" options={OPTIONS} value="raw" onChange={vi.fn()} />);
    expect(radio("Archived").disabled).toBe(true);
    expect(radio("Forecast").disabled).toBe(false);
  });

  it("closes every possibility when disabled as a whole", () => {
    render(<SegmentedControl aria-label="State" options={OPTIONS} value="raw" onChange={vi.fn()} disabled />);
    expect(screen.getAllByRole("radio").every((r) => (r as HTMLInputElement).disabled)).toBe(true);
  });

  it("takes part in a form under its name", () => {
    render(<SegmentedControl aria-label="State" name="state" options={OPTIONS} value="raw" onChange={vi.fn()} />);
    expect(screen.getAllByRole("radio").every((r) => r.getAttribute("name") === "state")).toBe(true);
  });
});

describe("SegmentedControl – icons (segmented-control-inset 02)", () => {
  it("names a possibility by its word alone, its icon hidden", () => {
    render(
      <SegmentedControl
        aria-label="Theme"
        options={[
          { value: "light", label: "Light", icon: <svg data-testid="sun"><title>Sun</title></svg> },
          { value: "dark", label: "Dark" },
        ]}
        value="light"
        onChange={vi.fn()}
      />,
    );
    expect(radio("Light").value).toBe("light");
    expect(screen.getByTestId("sun").closest("[aria-hidden='true']")).not.toBeNull();
    expect(screen.queryByRole("radio", { name: /Sun/ })).toBeNull();
  });
});

describe("SegmentedControl – the keys", () => {
  it("is one tab stop, on the chosen possibility", () => {
    render(<SegmentedControl aria-label="State" options={OPTIONS} value="cleaned" onChange={vi.fn()} />);
    expect(screen.getAllByRole("radio").map((r) => r.tabIndex)).toEqual([-1, 0, -1, -1]);
  });

  it("puts the tab stop on the first selectable possibility where none is chosen", () => {
    render(<SegmentedControl aria-label="State" options={OPTIONS} value={null} onChange={vi.fn()} />);
    expect(radio("Raw").tabIndex).toBe(0);
    expect(screen.getAllByRole("radio").every((r) => !(r as HTMLInputElement).checked)).toBe(true);
  });

  it("moves and chooses with the arrow keys, skipping the disabled and wrapping", () => {
    const onChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState<(typeof OPTIONS)[number]["value"]>("cleaned");
      return (
        <SegmentedControl
          aria-label="State"
          options={OPTIONS}
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      );
    }
    render(<Controlled />);
    const group = screen.getByRole("radiogroup");
    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("forecast");
    expect(document.activeElement).toBe(radio("Forecast"));
    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("raw");
    fireEvent.keyDown(group, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenLastCalledWith("forecast");
  });

  it("chooses uncontrolled, starting from its default", () => {
    const onChange = vi.fn();
    render(<SegmentedControl aria-label="State" options={OPTIONS} defaultValue="raw" onChange={onChange} />);
    expect(radio("Raw").checked).toBe(true);
    fireEvent.click(radio("Forecast"));
    expect(radio("Forecast").checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith("forecast");
  });
});

describe("SegmentedControl – in a field", () => {
  it("takes the field's label, hint, required and invalid state", () => {
    render(
      <FormField label="State of the data" error="Choose cleaned data for a report." required>
        <SegmentedControl options={OPTIONS} value="raw" onChange={vi.fn()} />
      </FormField>,
    );
    const group = screen.getByRole("radiogroup", { name: "State of the data" });
    const described = (group.getAttribute("aria-describedby") ?? "").split(" ").map((id) => document.getElementById(id)?.textContent);
    expect(described).toContain("Choose cleaned data for a report.");
    expect(group.getAttribute("aria-required")).toBe("true");
    expect(group.getAttribute("aria-invalid")).toBe("true");
  });

  it("chooses nothing when the field's label is clicked", () => {
    const onChange = vi.fn();
    render(
      <FormField label="State of the data">
        <SegmentedControl options={OPTIONS} value={null} onChange={onChange} />
      </FormField>,
    );
    fireEvent.click(screen.getByText("State of the data"));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getAllByRole("radio").every((r) => !(r as HTMLInputElement).checked)).toBe(true);
  });
});
