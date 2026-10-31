import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { TimeInput } from "../src";

const hour = () => screen.getByRole("spinbutton", { name: "Hour" }) as HTMLInputElement;
const minute = () => screen.getByRole("spinbutton", { name: "Minute" }) as HTMLInputElement;

describe("TimeInput", () => {
  it("shows a value as hour and minute spinbuttons", () => {
    render(<TimeInput aria-label="Start" defaultValue="07:05" />);
    expect([hour().value, minute().value]).toEqual(["07", "05"]);
    expect(screen.queryByRole("spinbutton", { name: "Second" })).toBeNull();
  });

  it("shows seconds on request", () => {
    render(<TimeInput aria-label="Start" withSeconds defaultValue="07:05:09" />);
    expect((screen.getByRole("spinbutton", { name: "Second" }) as HTMLInputElement).value).toBe("09");
  });

  it("starts empty with null and reports HH:mm once a field is set", () => {
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Start" defaultValue={null} onValueChange={onValueChange} />);
    expect(hour().value).toBe("");
    fireEvent.keyDown(hour(), { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenLastCalledWith("01:00");
    fireEvent.keyDown(minute(), { key: "ArrowDown" });
    expect(onValueChange).toHaveBeenLastCalledWith("01:59");
  });

  it("tabbing through an empty field sets nothing", () => {
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Start" onValueChange={onValueChange} />);
    fireEvent.blur(hour());
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("is controlled", () => {
    const { rerender } = render(<TimeInput aria-label="Start" value="10:00" />);
    fireEvent.keyDown(hour(), { key: "ArrowUp" });
    expect(hour().value).toBe("10");
    rerender(<TimeInput aria-label="Start" value={undefined} />);
    expect(hour().value).toBe("");
  });

  it("takes a pasted time", () => {
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Start" defaultValue="00:00" onValueChange={onValueChange} />);
    fireEvent.paste(hour(), { clipboardData: { getData: () => "14:30" } });
    expect(onValueChange).toHaveBeenLastCalledWith("14:00");
  });

  it("posts HH:mm, empty as nothing, and goes back on reset", () => {
    const { container } = render(
      <form>
        <TimeInput aria-label="Start" name="start" defaultValue="08:15" />
        <TimeInput aria-label="End" name="end" />
      </form>,
    );
    const form = container.querySelector("form")!;
    expect([...new FormData(form).entries()]).toEqual([["start", "08:15"], ["end", ""]]);
    fireEvent.keyDown(screen.getAllByRole("spinbutton", { name: "Hour" })[0]!, { key: "ArrowUp" });
    expect(new FormData(form).get("start")).toBe("09:15");
    act(() => {
      form.dispatchEvent(new Event("reset", { cancelable: true }));
    });
    expect(new FormData(form).get("start")).toBe("08:15");
  });

  it("calls onBlur only when focus leaves the whole field", () => {
    const onBlur = vi.fn();
    render(<TimeInput aria-label="Start" defaultValue="08:15" onBlur={onBlur} />);
    fireEvent.blur(hour(), { relatedTarget: minute() });
    expect(onBlur).not.toHaveBeenCalled();
    fireEvent.blur(minute(), { relatedTarget: document.body });
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
