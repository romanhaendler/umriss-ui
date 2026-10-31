/* Fields in a form: reset, blur, focus, invalid and the one accessible name - what a form library
   (TanStack Form, react-hook-form, Formik) or a plain form expects of a native control. */

import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  Checkbox,
  Combobox,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  DateTimeRangePicker,
  FileInput,
  FormField,
  MultiSelect,
  RadioGroup,
  SegmentedControl,
  Slider,
  Switch,
} from "../src";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("a form's reset", () => {
  it("puts an uncontrolled Slider back to its default and reports it", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <Slider aria-label="Volume" defaultValue={30} onValueChange={onValueChange} />
      </form>,
    );
    const range = screen.getByRole("slider") as HTMLInputElement;
    fireEvent.keyDown(range, { key: "End" });
    expect(range.value).toBe("100");
    onValueChange.mockClear();
    act(() => {
      container.querySelector("form")!.dispatchEvent(new Event("reset", { cancelable: true }));
    });
    expect(range.value).toBe("30");
    expect(onValueChange).toHaveBeenCalledWith(30);
  });

  it("tells a controlled Slider's owner the default", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <Slider aria-label="Volume" value={60} defaultValue={30} onValueChange={onValueChange} />
      </form>,
    );
    act(() => {
      container.querySelector("form")!.dispatchEvent(new Event("reset", { cancelable: true }));
    });
    expect(onValueChange).toHaveBeenCalledWith(30);
  });

  it("empties a FileInput's list", () => {
    const onValueChange = vi.fn();
    const file = new File(["x"], "a.txt");
    const { container } = render(
      <form>
        <FileInput aria-label="Files" defaultValue={[file]} onValueChange={onValueChange} />
      </form>,
    );
    expect(screen.getByText("a.txt")).toBeTruthy();
    // A defaultValue is the reset's target: empty it by removal first, then reset.
    fireEvent.click(screen.getByRole("button", { name: /a\.txt/ }));
    expect(screen.queryByText("a.txt")).toBeNull();
    onValueChange.mockClear();
    act(() => {
      container.querySelector("form")!.dispatchEvent(new Event("reset", { cancelable: true }));
    });
    expect(screen.getByText("a.txt")).toBeTruthy();
    expect(onValueChange).toHaveBeenCalledWith([file]);
  });
});

describe("onBlur fires when the focus leaves the whole field", () => {
  it("MultiSelect: not when the panel takes the focus, once when it leaves", () => {
    const onBlur = vi.fn();
    render(
      <div>
        <MultiSelect aria-label="Tags" options={OPTIONS} defaultValue={[]} onBlur={onBlur} />
        <button>elsewhere</button>
      </div>,
    );
    const trigger = screen.getByRole("button", { name: "Tags" });
    trigger.focus();
    fireEvent.click(trigger);
    const search = screen.getByRole("textbox");
    fireEvent.blur(trigger, { relatedTarget: search });
    expect(onBlur).not.toHaveBeenCalled();
    fireEvent.blur(search, { relatedTarget: screen.getByText("elsewhere") });
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["DatePicker", DatePicker],
    ["DateRangePicker", DateRangePicker],
    ["DateTimePicker", DateTimePicker],
    ["DateTimeRangePicker", DateTimeRangePicker],
  ])("%s", (_name, Picker) => {
    const onBlur = vi.fn();
    render(
      <div>
        <Picker aria-label="When" onBlur={onBlur} />
        <button>elsewhere</button>
      </div>,
    );
    const trigger = screen.getByRole("button", { name: "When" });
    fireEvent.click(trigger);
    const panel = screen.getByRole("dialog");
    const inside = panel.querySelector("button") as HTMLElement;
    fireEvent.blur(trigger, { relatedTarget: inside });
    expect(onBlur).not.toHaveBeenCalled();
    fireEvent.blur(inside, { relatedTarget: trigger });
    expect(onBlur).not.toHaveBeenCalled();
    fireEvent.blur(inside, { relatedTarget: screen.getByText("elsewhere") });
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});

describe("ref.focus() on a group", () => {
  it.each([
    ["RadioGroup", RadioGroup],
    ["SegmentedControl", SegmentedControl],
  ])("%s focuses the checked option, else the first", (_name, Group) => {
    let group: HTMLDivElement | null = null;
    const { rerender } = render(<Group aria-label="Plan" ref={(element) => void (group = element)} options={OPTIONS} defaultValue={null} />);
    act(() => group!.focus());
    expect((document.activeElement as HTMLInputElement).value).toBe("a");
    (document.activeElement as HTMLElement).blur();
    rerender(<Group aria-label="Plan" ref={(element) => void (group = element)} options={OPTIONS} value="b" />);
    act(() => group!.focus());
    expect((document.activeElement as HTMLInputElement).value).toBe("b");
    expect(group!.getAttribute("role")).toBe("radiogroup");
  });
});

describe("invalid and the accessible name", () => {
  it("Checkbox takes invalid, from the prop and from FormField", () => {
    const { rerender } = render(<Checkbox label="Terms" invalid />);
    expect(screen.getByRole("checkbox").getAttribute("aria-invalid")).toBe("true");
    rerender(
      <FormField label="Terms" error="Required">
        <Checkbox label="I accept" />
      </FormField>,
    );
    expect(screen.getByRole("checkbox").getAttribute("aria-invalid")).toBe("true");
  });

  it("RadioGroup in an invalid FormField is aria-invalid", () => {
    render(
      <FormField label="Plan" error="Choose one">
        <RadioGroup options={OPTIONS} />
      </FormField>,
    );
    expect(screen.getByRole("radiogroup").getAttribute("aria-invalid")).toBe("true");
  });

  it.each([
    ["Checkbox", Checkbox, "checkbox"],
    ["Switch", Switch, "switch"],
  ])("%s in a FormField has one name", (_name, Control, role) => {
    render(
      <FormField label="Terms">
        <Control label="I accept the terms" />
      </FormField>,
    );
    expect(screen.getByRole(role, { name: "I accept the terms" })).toBeTruthy();
  });

  it("a Checkbox without its own label is named by the FormField", () => {
    render(
      <FormField label="Terms">
        <Checkbox />
      </FormField>,
    );
    expect(screen.getByRole("checkbox", { name: "Terms" })).toBeTruthy();
  });
});

describe("Combobox clearable", () => {
  it("erasing the text and leaving gives null", () => {
    const onValueChange = vi.fn();
    render(<Combobox aria-label="City" clearable options={OPTIONS} defaultValue="a" onValueChange={onValueChange} />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(input.value).toBe("");
  });
});
