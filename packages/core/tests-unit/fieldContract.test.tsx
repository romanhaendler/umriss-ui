/* The field contract (ADR-0081): the state prop names its callback and the callback hands over the
   finished value. Each field is held to the same four things - controlled, uncontrolled, a `value` of
   `undefined` that reads as empty, and, where `onChange(value)` was the callback, the old name that
   still works and speaks once. */

import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  Checkbox,
  Combobox,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  DateTimeRangePicker,
  FileInput,
  Input,
  MultiSelect,
  NumberInput,
  RadioGroup,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  Textarea,
} from "../src";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];
const FILE = new File(["x"], "x.txt", { type: "text/plain" });

interface Handlers {
  value?: unknown;
  defaultValue?: unknown;
  onValueChange?: (value: never) => void;
  onChange?: (value: never) => void;
}

interface Case {
  name: string;
  make: (props: Handlers) => ReactElement;
  /** Makes the field report a change. */
  act: () => void;
  /** What it reports. */
  expected: unknown;
  /** Whether `onChange(value)` was this field's callback before the contract. */
  legacy: boolean;
}

const cases: Case[] = [
  {
    name: "NumberInput",
    make: (p) => <NumberInput aria-label="f" {...(p as object)} />,
    act: () => fireEvent.change(screen.getByRole("textbox"), { target: { value: "5" } }),
    expected: 5,
    legacy: true,
  },
  {
    name: "Select",
    make: (p) => (
      <Select aria-label="f" {...(p as object)}>
        <option value="">-</option>
        <option value="a">Alpha</option>
      </Select>
    ),
    act: () => fireEvent.change(screen.getByRole("combobox"), { target: { value: "a" } }),
    expected: "a",
    legacy: false,
  },
  {
    name: "Combobox",
    make: (p) => <Combobox aria-label="f" options={OPTIONS} {...(p as object)} />,
    act: () => {
      fireEvent.click(screen.getByRole("combobox"));
      fireEvent.click(screen.getByRole("option", { name: "Beta" }));
    },
    expected: "b",
    legacy: true,
  },
  {
    name: "MultiSelect",
    make: (p) => <MultiSelect aria-label="f" options={OPTIONS} {...(p as object)} />,
    act: () => {
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(screen.getByRole("option", { name: "Alpha" }));
    },
    expected: ["a"],
    legacy: true,
  },
  {
    name: "SegmentedControl",
    make: (p) => <SegmentedControl aria-label="f" options={OPTIONS} {...(p as object)} />,
    act: () => fireEvent.click(screen.getByRole("radio", { name: "Beta" })),
    expected: "b",
    legacy: true,
  },
  {
    name: "RadioGroup",
    make: (p) => <RadioGroup aria-label="f" options={OPTIONS} {...(p as object)} />,
    act: () => fireEvent.click(screen.getByRole("radio", { name: "Beta" })),
    expected: "b",
    legacy: true,
  },
  {
    name: "Slider",
    make: (p) => <Slider aria-label="f" {...(p as object)} />,
    act: () => fireEvent.keyDown(screen.getByRole("slider"), { key: "End" }),
    expected: 100,
    legacy: true,
  },
  {
    name: "DatePicker",
    make: (p) => <DatePicker aria-label="f" clearable {...(p as object)} />,
    act: () => {
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(screen.getByRole("button", { name: "Today" }));
    },
    expected: expect.any(Date),
    legacy: true,
  },
  {
    name: "DateTimePicker",
    make: (p) => <DateTimePicker aria-label="f" {...(p as object)} />,
    act: () => {
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(screen.getByRole("button", { name: "Now" }));
    },
    expected: expect.any(Date),
    legacy: true,
  },
  {
    name: "DateRangePicker",
    make: (p) => <DateRangePicker aria-label="f" {...(p as object)} />,
    act: () => {
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(screen.getByRole("button", { name: "Today" }));
    },
    expected: { from: expect.any(Date), to: expect.any(Date) },
    legacy: true,
  },
  {
    name: "DateTimeRangePicker",
    make: (p) => <DateTimeRangePicker aria-label="f" {...(p as object)} />,
    act: () => {
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(screen.getByRole("button", { name: "Today" }));
    },
    expected: { from: expect.any(Date), to: expect.any(Date) },
    legacy: true,
  },
  {
    name: "FileInput",
    make: (p) => <FileInput {...(p as object)} />,
    act: () => {
      const input = document.querySelector<HTMLInputElement>("input[type=file]")!;
      fireEvent.change(input, { target: { files: [FILE] } });
    },
    expected: [FILE],
    legacy: true,
  },
];

afterEach(() => vi.restoreAllMocks());

describe.each(cases)("$name", ({ make, act: change, expected, legacy, name }) => {
  it("reports through onValueChange when controlled", () => {
    const onValueChange = vi.fn();
    render(make({ value: undefined, onValueChange }));
    change();
    expect(onValueChange).toHaveBeenCalledWith(expected);
  });

  it("reports through onValueChange when uncontrolled", () => {
    const onValueChange = vi.fn();
    render(make({ onValueChange }));
    change();
    expect(onValueChange).toHaveBeenCalledWith(expected);
  });

  it("reads a value of undefined as empty, without a crash or a React warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(make({ value: undefined, onValueChange: vi.fn() }));
    rerender(make({ value: undefined, onValueChange: vi.fn() }));
    expect(error).not.toHaveBeenCalled();
  });

  if (legacy) {
    it("still reports through the old onChange and says once that it is going", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const onChange = vi.fn();
      render(make({ onChange }));
      change();
      expect(onChange).toHaveBeenCalledWith(expected);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0]![0]).toContain(`${name} onChange(value)`);
      expect(warn.mock.calls[0]![0]).toContain("onValueChange");
    });
  }
});

describe("a field that starts uncontrolled and is later given a value", () => {
  it("is warned of once, in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(<RadioGroup aria-label="f" options={OPTIONS} onValueChange={vi.fn()} />);
    rerender(<RadioGroup aria-label="f" options={OPTIONS} value="a" onValueChange={vi.fn()} />);
    rerender(<RadioGroup aria-label="f" options={OPTIONS} value="b" onValueChange={vi.fn()} />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain("controlled and uncontrolled");
  });
});

describe("a controlled field with a value that goes away", () => {
  it("stays controlled and reads empty (RadioGroup, Combobox)", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(<RadioGroup aria-label="f" options={OPTIONS} value="a" onValueChange={vi.fn()} />);
    rerender(<RadioGroup aria-label="f" options={OPTIONS} value={undefined} onValueChange={vi.fn()} />);
    expect((screen.getByRole("radio", { name: "Alpha" }) as HTMLInputElement).checked).toBe(false);
    expect(error).not.toHaveBeenCalled();
  });

  it("keeps the label of a chosen value, and loses it with the value (Combobox)", () => {
    const { rerender } = render(<Combobox aria-label="f" options={OPTIONS} value="a" onValueChange={vi.fn()} />);
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("Alpha");
    rerender(<Combobox aria-label="f" options={[]} value="a" onValueChange={vi.fn()} />);
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("Alpha");
    rerender(<Combobox aria-label="f" options={[]} value={undefined} onValueChange={vi.fn()} />);
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("");
  });
});

describe("a field that starts from defaultValue", () => {
  it("shows it and keeps what is chosen after", () => {
    render(<Combobox aria-label="f" options={OPTIONS} defaultValue="a" />);
    const box = screen.getByRole("combobox") as HTMLInputElement;
    expect(box.value).toBe("Alpha");
    fireEvent.click(box);
    fireEvent.click(screen.getByRole("option", { name: "Beta" }));
    expect(box.value).toBe("Beta");
  });

  it("is a number in NumberInput", () => {
    render(<NumberInput aria-label="f" defaultValue={1234} />);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("1,234");
  });

  it("is a date in the pickers", () => {
    render(<DatePicker aria-label="f" defaultValue={new Date(2026, 5, 10)} />);
    expect(screen.getByRole("button").textContent).toContain("2026");
  });

  it("is a set of values in MultiSelect and files in FileInput", () => {
    const { unmount } = render(<MultiSelect aria-label="f" options={OPTIONS} defaultValue={["a"]} />);
    expect(screen.getByRole("button", { name: "Remove Alpha" })).toBeTruthy();
    unmount();
    render(<FileInput defaultValue={[FILE]} />);
    expect(screen.getByText("x.txt")).toBeTruthy();
  });
});

describe("the native-backed fields", () => {
  it("hand over the finished value beside the event, and say nothing about it", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    const { rerender } = render(<Input aria-label="f" defaultValue="" onChange={onChange} onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "x" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0].target.value).toBe("x");
    expect(onValueChange).toHaveBeenCalledWith("x");

    rerender(<Textarea aria-label="f" defaultValue="" onChange={onChange} onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "y" } });
    expect(onValueChange).toHaveBeenLastCalledWith("y");

    rerender(<Checkbox aria-label="f" onChange={onChange} onCheckedChange={onValueChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onValueChange).toHaveBeenLastCalledWith(true);
    expect(onChange).toHaveBeenCalledTimes(3);

    rerender(<Switch aria-label="f" defaultChecked onChange={onChange} onCheckedChange={onValueChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onValueChange).toHaveBeenLastCalledWith(false);
    expect(warn).not.toHaveBeenCalled();
  });

  it("read null and undefined as empty text", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <>
        <Input aria-label="a" value={null} onValueChange={vi.fn()} />
        <Textarea aria-label="b" value={undefined} onValueChange={vi.fn()} />
      </>,
    );
    expect((screen.getByLabelText("a") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("b") as HTMLTextAreaElement).value).toBe("");
    expect(error).not.toHaveBeenCalled();
  });

  it("start from defaultChecked and defaultValue", () => {
    render(<Checkbox aria-label="c" defaultChecked />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
  });
});
