/* `value={undefined}` beside a `defaultValue` is an uncontrolled field: the default shows, React does not warn;
   without a default the field stays controlled and empty (ADR-0081). */

import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input, NumberInput, Select, Textarea } from "../src";

afterEach(() => vi.restoreAllMocks());

describe("value undefined with a defaultValue", () => {
  it("shows the default in Input, Textarea, Select and NumberInput without a warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <>
        <Input aria-label="a" value={undefined} defaultValue="abc" />
        <Textarea aria-label="b" value={undefined} defaultValue="def" />
        <Select aria-label="c" value={undefined} defaultValue="y">
          <option value="x">X</option>
          <option value="y">Y</option>
        </Select>
        <NumberInput aria-label="d" value={undefined} defaultValue={7} />
      </>,
    );
    expect((screen.getByLabelText("a") as HTMLInputElement).value).toBe("abc");
    expect((screen.getByLabelText("b") as HTMLInputElement).value).toBe("def");
    expect((screen.getByLabelText("c") as HTMLInputElement).value).toBe("y");
    expect((screen.getByLabelText("d") as HTMLInputElement).value).toBe("7");
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("stays controlled and empty without a default", () => {
    render(<Input aria-label="a" value={undefined} onChange={() => {}} />);
    expect((screen.getByLabelText("a") as HTMLInputElement).value).toBe("");
  });
});
