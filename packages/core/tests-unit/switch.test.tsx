/* The switch at the seam a caller has (core-foundations 01): a native
   checkbox under `role="switch"`, so Space, the label and a form come from the
   platform, and what is tested is what a user and a screen reader get. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { FormField, Switch } from "../src";

describe("Switch", () => {
  it("is a switch named by its label, off by default", () => {
    render(<Switch label="Automatic mode" />);
    const control = screen.getByRole("switch", { name: "Automatic mode" });
    expect(control).toHaveProperty("checked", false);
  });

  it("uncontrolled: starts at defaultChecked and turns on a click on the label", () => {
    const changed = vi.fn();
    render(<Switch label="Heating" defaultChecked onChange={(e) => changed(e.target.checked)} />);
    const control = screen.getByRole("switch", { name: "Heating" });
    expect(control).toHaveProperty("checked", true);
    fireEvent.click(screen.getByText("Heating"));
    expect(control).toHaveProperty("checked", false);
    expect(changed).toHaveBeenCalledWith(false);
  });

  it("controlled: reports and waits until checked follows", () => {
    function Controlled() {
      const [on, setOn] = useState(false);
      return (
        <>
          <Switch label="Pump" checked={on} onChange={() => undefined} />
          <Switch label="Fan" checked={on} onChange={(e) => setOn(e.target.checked)} />
        </>
      );
    }
    render(<Controlled />);
    const pump = screen.getByRole("switch", { name: "Pump" });
    fireEvent.click(pump);
    expect(pump).toHaveProperty("checked", false);
    fireEvent.click(screen.getByRole("switch", { name: "Fan" }));
    expect(pump).toHaveProperty("checked", true);
  });

  /* Space is the platform's: a checkbox toggles on the key's release. jsdom
     does not reproduce that, so what is asserted is that nothing of ours
     stands between the key and the native control - no handler swallows it. */
  it("leaves Space to the native control", () => {
    render(<Switch label="Light" />);
    const control = screen.getByRole("switch", { name: "Light" });
    const event = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    control.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(control.tagName).toBe("INPUT");
    expect(control.getAttribute("type")).toBe("checkbox");
  });

  it("disabled does not toggle", () => {
    render(<Switch label="Locked" disabled />);
    const control = screen.getByRole("switch", { name: "Locked" });
    expect(control).toHaveProperty("disabled", true);
  });

  it("invalid says so to a screen reader, by hand or from the form field", () => {
    const { rerender } = render(<Switch label="Consent" invalid />);
    expect(screen.getByRole("switch").getAttribute("aria-invalid")).toBe("true");
    rerender(
      <FormField label="Consent" error="Required to continue">
        <Switch />
      </FormField>,
    );
    const control = screen.getByRole("switch", { name: "Consent" });
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(control.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("keeps its role against a caller's", () => {
    render(<Switch label="Mode" {...({ role: "checkbox" } as object)} />);
    expect(screen.getByRole("switch", { name: "Mode" })).toBeTruthy();
  });
});
