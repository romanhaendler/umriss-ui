import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "../src";

describe("Button loading", () => {
  it("keeps focus: aria-disabled, not disabled", () => {
    const { rerender } = render(<Button>Save</Button>);
    const button = screen.getByRole("button");
    button.focus();
    rerender(<Button loading>Save</Button>);
    expect(document.activeElement).toBe(button);
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.getAttribute("aria-busy")).toBe("true");
  });

  it("ignores clicks, and a submit does not post", () => {
    const onClick = vi.fn();
    const onSubmit = vi.fn((event: { preventDefault(): void }) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading onClick={onClick}>
          Save
        </Button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("still locks a disabled button with disabled", () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
  });
});
