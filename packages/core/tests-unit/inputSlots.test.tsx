/* Input's start and end slots (ticket 35, decision 8): a unit as text, or an
   icon or an IconButton, inside the field's frame. The layout is in the
   browser; this is the half jsdom can see - where each slot stands, what a
   text slot adds to the width and to the description, and what an icon does
   not. */

import { createRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormField, IconButton, Input } from "../src";

const wrapperOf = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe("Input's slots", () => {
  it("a text start stands before the value, inside the wrapper", () => {
    const { container } = render(<Input aria-label="Weight" start="kg" defaultValue="12" />);
    const wrapper = wrapperOf(container);
    const [first, second] = Array.from(wrapper.children);
    expect(first?.textContent).toBe("kg");
    expect(second?.tagName).toBe("INPUT");
  });

  it("a text end stands after the value", () => {
    const { container } = render(<Input aria-label="Weight" end="kg" defaultValue="12" />);
    const wrapper = wrapperOf(container);
    expect(wrapper.lastElementChild?.textContent).toBe("kg");
    expect(wrapper.querySelector("input")?.nextElementSibling?.textContent).toBe("kg");
  });

  it("an IconButton as end keeps the focus ring of the field and works as a button", () => {
    const onClick = vi.fn();
    const { container, getByRole } = render(
      <Input
        aria-label="Token"
        type="password"
        end={
          <IconButton aria-label="Show the token" onClick={onClick}>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" />
          </IconButton>
        }
      />,
    );
    const wrapper = wrapperOf(container);
    expect(wrapper.querySelector("input")?.nextElementSibling?.querySelector("button")).not.toBeNull();
    fireEvent.click(getByRole("button", { name: "Show the token" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("a text slot is part of the field's description, an icon is not", () => {
    const { getByRole, rerender } = render(<Input aria-label="Weight" start="kg" />);
    const startId = getByRole("textbox").getAttribute("aria-describedby");
    expect(startId).toBeTruthy();
    expect(document.getElementById(startId!)?.textContent).toBe("kg");

    rerender(<Input aria-label="Weight" end={<svg aria-hidden="true" />} />);
    expect(getByRole("textbox").getAttribute("aria-describedby")).toBeNull();
  });

  it("a text slot joins the caller's own description, and does not replace it", () => {
    const { getByRole } = render(
      <>
        <span id="other">Net weight</span>
        <Input aria-label="Weight" start="~" aria-describedby="other" />
      </>,
    );
    const ids = (getByRole("textbox").getAttribute("aria-describedby") ?? "").split(" ");
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe("other");
    const texts = ids.map((id) => document.getElementById(id)?.textContent ?? "");
    expect(texts).toEqual(["Net weight", "~"]);
  });

  it("a text slot counts in the field's width, with its gap; an icon does not", () => {
    const text = wrapperOf(render(<Input aria-label="Weight" chars={8} start="kg" />).container);
    expect(text.style.getPropertyValue("--_extra")).toBe("3");
    const icon = wrapperOf(render(<Input aria-label="Weight" chars={8} end={<svg />} />).container);
    expect(icon.style.getPropertyValue("--_extra")).toBe("");
  });

  it("the ref and the field's id stay on the input", () => {
    const ref = createRef<HTMLInputElement>();
    const { getByRole } = render(
      <FormField label="Weight">
        <Input ref={ref} start="kg" />
      </FormField>,
    );
    expect(ref.current).toBe(getByRole("textbox"));
    expect(getByRole("textbox").id).not.toBe("");
  });

  it("a hidden input has no slots", () => {
    const { container } = render(<Input type="hidden" name="token" value="x" start="kg" />);
    expect(container.querySelector("span")).toBeNull();
    expect(container.textContent).toBe("");
  });
});
