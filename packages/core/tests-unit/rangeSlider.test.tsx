import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { RangeSlider } from "../src";

const thumbs = () => screen.getAllByRole("slider") as HTMLInputElement[];

describe("RangeSlider", () => {
  it("shows two thumbs that keep their own names", () => {
    render(<RangeSlider aria-label="Band" name="band" defaultValue={[20, 60]} />);
    const [from, to] = thumbs();
    expect([from!.value, to!.value]).toEqual(["20", "60"]);
    expect([from!.name, to!.name]).toEqual(["bandStart", "bandEnd"]);
    expect(from!.getAttribute("aria-label")).not.toBe(to!.getAttribute("aria-label"));
  });

  it("names the posted ends apart", () => {
    render(<RangeSlider aria-label="Band" startName="lo" endName="hi" />);
    expect(thumbs().map((t) => t.name)).toEqual(["lo", "hi"]);
  });

  it("reports a pair on the step grid from min, and the thumbs never cross", () => {
    const onValueChange = vi.fn();
    render(<RangeSlider aria-label="Band" min={1} max={10} step={3} defaultValue={[4, 7]} onValueChange={onValueChange} />);
    const [from, to] = thumbs();
    fireEvent.keyDown(from!, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith([7, 7]);
    fireEvent.keyDown(from!, { key: "ArrowRight" });
    expect(from!.value).toBe("7");
    fireEvent.keyDown(to!, { key: "Home" });
    expect(to!.value).toBe("7");
    fireEvent.keyDown(to!, { key: "End" });
    expect(to!.value).toBe("10");
  });

  it("clamps a pointer change against the other thumb", () => {
    render(<RangeSlider aria-label="Band" defaultValue={[20, 60]} />);
    const [from] = thumbs();
    fireEvent.change(from!, { target: { value: "90" } });
    expect(from!.value).toBe("60");
  });

  it("is controlled by value, and undefined reads as the whole range", () => {
    const { rerender } = render(<RangeSlider aria-label="Band" value={[10, 20]} />);
    fireEvent.keyDown(thumbs()[0]!, { key: "End" });
    expect(thumbs()[0]!.value).toBe("10");
    rerender(<RangeSlider aria-label="Band" value={undefined} />);
    expect(thumbs().map((t) => t.value)).toEqual(["0", "100"]);
  });

  it("posts both ends and goes back to its default on reset", () => {
    const { container } = render(
      <form>
        <RangeSlider aria-label="Band" name="band" defaultValue={[20, 60]} />
      </form>,
    );
    fireEvent.keyDown(thumbs()[0]!, { key: "Home" });
    const form = container.querySelector("form")!;
    expect([...new FormData(form).entries()]).toEqual([["bandStart", "0"], ["bandEnd", "60"]]);
    act(() => {
      form.dispatchEvent(new Event("reset", { cancelable: true }));
    });
    expect(thumbs().map((t) => t.value)).toEqual(["20", "60"]);
  });

  it("calls onBlur only when focus leaves both thumbs", () => {
    const onBlur = vi.fn();
    render(<RangeSlider aria-label="Band" onBlur={onBlur} />);
    const [from, to] = thumbs();
    fireEvent.blur(from!, { relatedTarget: to });
    expect(onBlur).not.toHaveBeenCalled();
    fireEvent.blur(to!, { relatedTarget: document.body });
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
