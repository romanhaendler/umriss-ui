/* Radio group (foundation-primitives 02). What is checked is what a person
   observes: where the tab stop sits, where the arrow keys lead, what is
   chosen and what the screen reader is told.

   Deliberately here and not in the Playwright suite: the input lies - as
   with the Checkbox - invisibly on the drawn dot, and that is exactly what
   the two red interaction tests have been failing on since the handover
   state ("Playwright kann die versteckte Checkbox nicht klicken",
   docs/testing.md). Laying the same check down there a second time would mean
   repeating the same known failure. */

import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { RadioGroup } from "../src/components/RadioGroup";
import { FormField } from "../src/components/FormField";

const OPTIONS = [
  { value: "standard", label: "Standard", description: "Three working days." },
  { value: "express", label: "Express", description: "The next working day." },
  { value: "freight", label: "Freight", disabled: true },
  { value: "collection", label: "Collection in person" },
] as const;

type Value = (typeof OPTIONS)[number]["value"];

function Controlled({ start = "standard" as Value, onChange = vi.fn() }) {
  const [value, setValue] = useState<Value>(start);
  return (
    <RadioGroup
      options={OPTIONS}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

const radio = (name: string) => screen.getByRole("radio", { name: new RegExp(name) });

/* What the screen reader reads out in addition. jest-dom is not wired into
   the project, so this is resolved by hand. */
const descriptionOf = (element: Element): string =>
  (element.getAttribute("aria-describedby") ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
    .join(" ")
    .trim();

describe("RadioGroup – structure and roles", () => {
  it("reports itself as a radio group with its orientation", () => {
    render(<RadioGroup options={OPTIONS} value="standard" onChange={vi.fn()} />);
    const group = screen.getByRole("radiogroup");
    expect(group.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("reports horizontal orientation where it is wanted", () => {
    render(
      <RadioGroup orientation="horizontal" options={OPTIONS} value="standard" onChange={vi.fn()} />,
    );
    expect(screen.getByRole("radiogroup").getAttribute("aria-orientation")).toBe("horizontal");
  });

  it("reads the line of explanation together with the option", () => {
    // The reason this component exists instead of a segmented control.
    render(<RadioGroup options={OPTIONS} value="standard" onChange={vi.fn()} />);
    expect(descriptionOf(radio("Standard"))).toBe("Three working days.");
  });

  it("marks the chosen option", () => {
    render(<RadioGroup options={OPTIONS} value="express" onChange={vi.fn()} />);
    expect((radio("Express") as HTMLInputElement).checked).toBe(true);
    expect((radio("Standard") as HTMLInputElement).checked).toBe(false);
  });

  it("disables single options", () => {
    render(<RadioGroup options={OPTIONS} value="standard" onChange={vi.fn()} />);
    expect((radio("Freight") as HTMLInputElement).disabled).toBe(true);
  });

  it("disables the whole group", () => {
    render(<RadioGroup disabled options={OPTIONS} value="standard" onChange={vi.fn()} />);
    for (const option of OPTIONS) {
      expect((radio(option.label) as HTMLInputElement).disabled).toBe(true);
    }
  });
});

describe("RadioGroup – exactly one tab stop", () => {
  it("puts the tab stop on the chosen option", () => {
    render(<RadioGroup options={OPTIONS} value="express" onChange={vi.fn()} />);
    expect(radio("Express").getAttribute("tabindex")).toBe("0");
    expect(radio("Standard").getAttribute("tabindex")).toBe("-1");
    expect(radio("Collection in person").getAttribute("tabindex")).toBe("-1");
  });

  it("puts it on the first selectable option where nothing is chosen", () => {
    render(<RadioGroup options={OPTIONS} value={null} onChange={vi.fn()} />);
    expect(radio("Standard").getAttribute("tabindex")).toBe("0");
  });

  it("never gives disabled options a tab stop", () => {
    render(<RadioGroup options={OPTIONS} value="standard" onChange={vi.fn()} />);
    expect(radio("Freight").getAttribute("tabindex")).toBe("-1");
  });
});

describe("RadioGroup – the arrow keys move and choose", () => {
  it("chooses the next option with arrow down", () => {
    const reported = vi.fn();
    render(<Controlled onChange={reported} />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowDown" });
    expect(reported).toHaveBeenCalledWith("express");
    expect((radio("Express") as HTMLInputElement).checked).toBe(true);
  });

  it("chooses the same way with arrow right", () => {
    const reported = vi.fn();
    render(<Controlled onChange={reported} />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowRight" });
    expect(reported).toHaveBeenCalledWith("express");
  });

  it("goes back with arrow up", () => {
    const reported = vi.fn();
    render(<Controlled start="express" onChange={reported} />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowUp" });
    expect(reported).toHaveBeenCalledWith("standard");
  });

  it("skips disabled options", () => {
    /* After Express comes Freight - that one is disabled and must not be
       reachable, otherwise the keyboard lands where the mouse cannot go. */
    const reported = vi.fn();
    render(<Controlled start="express" onChange={reported} />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowDown" });
    expect(reported).toHaveBeenCalledWith("collection");
  });

  it("wraps from the end around to the beginning", () => {
    const reported = vi.fn();
    render(<Controlled start="collection" onChange={reported} />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowDown" });
    expect(reported).toHaveBeenCalledWith("standard");
  });

  it("wraps from the beginning around to the end", () => {
    const reported = vi.fn();
    render(<Controlled start="standard" onChange={reported} />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowUp" });
    expect(reported).toHaveBeenCalledWith("collection");
  });

  it("moves the focus along with the choice", () => {
    render(<Controlled />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowDown" });
    expect(document.activeElement).toBe(radio("Express"));
  });

  it("leaves other keys alone", () => {
    const reported = vi.fn();
    render(<Controlled onChange={reported} />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "a" });
    expect(reported).not.toHaveBeenCalled();
  });

  it("does nothing where no option is selectable", () => {
    const reported = vi.fn();
    render(<RadioGroup disabled options={OPTIONS} value="standard" onChange={reported} />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowDown" });
    expect(reported).not.toHaveBeenCalled();
  });
});

describe("RadioGroup – click and form field", () => {
  it("reports the choice on being clicked", () => {
    const reported = vi.fn();
    render(<Controlled onChange={reported} />);
    fireEvent.click(radio("Collection in person"));
    expect(reported).toHaveBeenCalledWith("collection");
  });

  it("takes on the description of the surrounding field", () => {
    render(
      <FormField label="Zustellung" hint="Please choose.">
        <RadioGroup options={OPTIONS} value="standard" onChange={vi.fn()} />
      </FormField>,
    );
    expect(descriptionOf(screen.getByRole("radiogroup"))).toBe("Please choose.");
  });

  it("reports itself as invalid where the field shows an error", () => {
    render(
      <FormField label="Zustellung" error="Please choose.">
        <RadioGroup options={OPTIONS} value={null} onChange={vi.fn()} />
      </FormField>,
    );
    expect(screen.getByRole("radiogroup").getAttribute("aria-invalid")).toBe("true");
  });

  it("holds the choice even without a controlled value", () => {
    render(<RadioGroup options={OPTIONS} defaultValue="express" onChange={vi.fn()} />);
    expect((radio("Express") as HTMLInputElement).checked).toBe(true);
    fireEvent.click(radio("Standard"));
    expect((radio("Standard") as HTMLInputElement).checked).toBe(true);
  });
});
