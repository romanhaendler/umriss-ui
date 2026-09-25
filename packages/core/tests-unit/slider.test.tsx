/* The slider at the seam a caller has (core-foundations 02): one value on a
   native range input, the keys of the APG slider pattern, marks, the readout
   and its `format`. The keys are the component's own and not left to the
   browser - PageUp and PageDown differ between engines, and a step that
   depends on the browser is one a data-dense screen cannot promise. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { FormField, Slider } from "../src";

const slider = () => screen.getByRole("slider");
const press = (key: string) => fireEvent.keyDown(slider(), { key });

describe("Slider", () => {
  it("is a slider with its bounds and value, named by its label", () => {
    render(
      <FormField label="Setpoint">
        <Slider min={20} max={80} defaultValue={40} />
      </FormField>,
    );
    const control = screen.getByRole("slider", { name: "Setpoint" });
    expect(control.getAttribute("min")).toBe("20");
    expect(control.getAttribute("max")).toBe("80");
    expect((control as HTMLInputElement).value).toBe("40");
  });

  it("moves by one step on the arrows, in both directions and both axes", () => {
    render(<Slider aria-label="Speed" defaultValue={50} step={5} />);
    press("ArrowRight");
    expect(slider()).toHaveProperty("value", "55");
    press("ArrowUp");
    expect(slider()).toHaveProperty("value", "60");
    press("ArrowLeft");
    press("ArrowDown");
    press("ArrowDown");
    expect(slider()).toHaveProperty("value", "45");
  });

  it("moves by a tenth of the range on PageUp and PageDown, snapped to the step", () => {
    render(<Slider aria-label="Speed" min={0} max={200} step={3} defaultValue={99} />);
    press("PageUp");
    // A tenth is 20, which is not on the step of 3: it rounds to 21.
    expect(slider()).toHaveProperty("value", "120");
    press("PageDown");
    press("PageDown");
    expect(slider()).toHaveProperty("value", "78");
  });

  it("goes to the bounds on Home and End, and stays inside them", () => {
    render(<Slider aria-label="Speed" min={10} max={90} defaultValue={50} />);
    press("End");
    expect(slider()).toHaveProperty("value", "90");
    press("ArrowRight");
    press("PageUp");
    expect(slider()).toHaveProperty("value", "90");
    press("Home");
    expect(slider()).toHaveProperty("value", "10");
    press("ArrowLeft");
    expect(slider()).toHaveProperty("value", "10");
  });

  /* Review finding: End went to a `max` off the step grid, and the browser
     then showed the thumb on the grid while the value said otherwise. */
  it("stays on the step grid where max does not lie on it", () => {
    render(<Slider aria-label="Batches" min={0} max={10} step={3} defaultValue={3} />);
    press("End");
    expect(slider()).toHaveProperty("value", "9");
    press("Home");
    press("PageUp");
    press("PageUp");
    press("PageUp");
    press("PageUp");
    expect(slider()).toHaveProperty("value", "9");
  });

  it("says a form field's error and requirement to a screen reader", () => {
    render(
      <FormField label="Setpoint" error="Outside the permitted band" required>
        <Slider />
      </FormField>,
    );
    expect(slider().getAttribute("aria-invalid")).toBe("true");
    expect(slider().getAttribute("aria-required")).toBe("true");
  });

  it("shows its value by default, and not when asked not to", () => {
    const { rerender } = render(<Slider aria-label="Speed" defaultValue={42} />);
    expect(screen.getByText("42")).toBeTruthy();
    rerender(<Slider aria-label="Speed" defaultValue={42} showValue={false} />);
    expect(screen.queryByText("42")).toBeNull();
  });

  it("controlled: reports and waits until value follows", () => {
    const changed = vi.fn();
    const { rerender } = render(<Slider aria-label="Speed" value={30} onChange={changed} />);
    press("ArrowRight");
    expect(changed).toHaveBeenCalledWith(31);
    expect(slider()).toHaveProperty("value", "30");
    rerender(<Slider aria-label="Speed" value={31} onChange={changed} />);
    expect(slider()).toHaveProperty("value", "31");
  });

  it("reports a pointer's change as a number", () => {
    function Controlled() {
      const [value, setValue] = useState(10);
      return <Slider aria-label="Speed" value={value} onChange={setValue} showValue />;
    }
    render(<Controlled />);
    fireEvent.change(slider(), { target: { value: "64" } });
    expect(slider()).toHaveProperty("value", "64");
    expect(screen.getByText("64")).toBeTruthy();
  });

  it("says the formatted value as its text, and shows it in the readout", () => {
    render(<Slider aria-label="Temperature" defaultValue={72.5} step={0.5} format={(v) => `${v.toFixed(1)} °C`} showValue />);
    expect(slider().getAttribute("aria-valuetext")).toBe("72.5 °C");
    expect(screen.getByText("72.5 °C")).toBeTruthy();
  });

  it("draws marks, with their labels where they have one", () => {
    const { container } = render(
      <Slider aria-label="Load" defaultValue={50} marks={[0, 25, { value: 50, label: "Rated" }, 75, 100]} />,
    );
    expect(container.querySelectorAll("[data-mark]")).toHaveLength(5);
    expect(screen.getByText("Rated")).toBeTruthy();
  });

  it("disabled takes no key", () => {
    render(<Slider aria-label="Speed" defaultValue={50} disabled />);
    press("ArrowRight");
    expect(slider()).toHaveProperty("value", "50");
    expect(slider()).toHaveProperty("disabled", true);
  });

  it("leaves Tab and other keys alone, and a caller's handler can prevent the step", () => {
    render(<Slider aria-label="Speed" defaultValue={50} onKeyDown={(e) => e.key === "End" && e.preventDefault()} />);
    press("End");
    expect(slider()).toHaveProperty("value", "50");
    const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    slider().dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
  });
});
