/* Removable label (foundation-primitives 04). What is tested is the
   behaviour, not the appearance: who carries the tab stop, what the arrow
   keys do, what removes, and where the focus goes afterwards.

   The expected remove labels are the shipped German wording (`removeTag` and
   `remove` of the wording catalogue) and stay German until ticket 13 moves
   them. */

import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Tag, TagGroup } from "../src/components/Tag";

const START = ["Backend", "Frontend", "Design"];

function Group({ onRemove = vi.fn() }: { onRemove?: (label: string) => void }) {
  const [labels, setLabels] = useState(START);
  return (
    <TagGroup aria-label="Areas">
      {labels.map((label) => (
        <Tag
          key={label}
          onRemove={() => {
            setLabels((current) => current.filter((l) => l !== label));
            onRemove(label);
          }}
        >
          {label}
        </Tag>
      ))}
    </TagGroup>
  );
}

const tag = (label: string) => screen.getByText(label).closest("[data-tag]") as HTMLElement;

describe("Tag – without removing it is a label", () => {
  it("carries no tab stop", () => {
    render(<Tag>Text only</Tag>);
    expect(screen.getByText("Text only").closest("[data-tag]")).toBeNull();
  });

  it("shows no remove key", () => {
    render(<Tag>Text only</Tag>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows no remove key when disabled either", () => {
    // Disabled means: visible, but not operable.
    render(
      <Tag disabled onRemove={vi.fn()}>
        Disabled
      </Tag>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("Tag – removing", () => {
  it("reports the removal on a click on the cross", () => {
    const reported = vi.fn();
    render(<Group onRemove={reported} />);
    fireEvent.click(screen.getByRole("button", { name: /Remove Frontend/ }));
    expect(reported).toHaveBeenCalledWith("Frontend");
    expect(screen.queryByText("Frontend")).toBeNull();
  });

  it("removes with Backspace", () => {
    const reported = vi.fn();
    render(<Group onRemove={reported} />);
    fireEvent.keyDown(tag("Backend"), { key: "Backspace" });
    expect(reported).toHaveBeenCalledWith("Backend");
  });

  it("removes with the Delete key", () => {
    const reported = vi.fn();
    render(<Group onRemove={reported} />);
    fireEvent.keyDown(tag("Design"), { key: "Delete" });
    expect(reported).toHaveBeenCalledWith("Design");
  });

  it("leaves other keys alone", () => {
    const reported = vi.fn();
    render(<Group onRemove={reported} />);
    fireEvent.keyDown(tag("Backend"), { key: "a" });
    expect(reported).not.toHaveBeenCalled();
  });

  it("names the remove key after its content where that is text", () => {
    render(<Group />);
    expect(screen.getByRole("button", { name: "Remove Backend" })).toBeTruthy();
  });

  it("falls back to a plain label with non-textual content", () => {
    /* Otherwise "Remove [object Object]" would stand there. */
    render(
      <Tag onRemove={vi.fn()}>
        <strong>Backend</strong>
      </Tag>,
    );
    expect(screen.getByRole("button", { name: "Remove" })).toBeTruthy();
  });

  it("accepts a label of its own", () => {
    render(
      <Tag onRemove={vi.fn()} removeLabel="Deselect the Backend area">
        Backend
      </Tag>,
    );
    expect(screen.getByRole("button", { name: "Deselect the Backend area" })).toBeTruthy();
  });
});

describe("Tag – the group carries the navigation", () => {
  it("holds exactly one tab stop for the whole group", () => {
    /* The reason the group exists: a filter bar with five entries must not be
       five stops in the tab order. */
    render(<Group />);
    const stops = START.map((label) => tag(label).tabIndex).filter((value) => value === 0);
    expect(stops).toHaveLength(1);
  });

  it("puts the stop on the first tag to begin with", () => {
    render(<Group />);
    expect(tag("Backend").tabIndex).toBe(0);
    expect(tag("Frontend").tabIndex).toBe(-1);
  });

  it("takes the stop along to wherever the arrow keys lead", () => {
    render(<Group />);
    tag("Backend").focus();
    fireEvent.keyDown(screen.getByRole("list"), { key: "ArrowRight" });
    expect(tag("Frontend").tabIndex).toBe(0);
    expect(tag("Backend").tabIndex).toBe(-1);
  });

  it("takes the stop along when a tag is focused directly", () => {
    render(<Group />);
    fireEvent.focus(tag("Design"), { bubbles: true });
    expect(tag("Design").tabIndex).toBe(0);
  });

  it("gives a single tag outside a group a tab stop", () => {
    render(<Tag onRemove={vi.fn()}>Alone</Tag>);
    expect((screen.getByText("Alone").closest("[data-tag]") as HTMLElement).tabIndex).toBe(0);
  });

  it("keeps the remove key out of the tab order", () => {
    /* Otherwise there would be two stops per tag - the tag carries the stop,
       the cross is the gesture for it. */
    render(<Group />);
    expect(screen.getByRole("button", { name: /Remove Backend/ }).getAttribute("tabindex")).toBe(
      "-1",
    );
  });

  it("travels with the right arrow", () => {
    render(<Group />);
    tag("Backend").focus();
    fireEvent.keyDown(screen.getByRole("list"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(tag("Frontend"));
  });

  it("travels with the left arrow", () => {
    render(<Group />);
    tag("Frontend").focus();
    fireEvent.keyDown(screen.getByRole("list"), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(tag("Backend"));
  });

  it("wraps around at the ends", () => {
    render(<Group />);
    tag("Design").focus();
    fireEvent.keyDown(screen.getByRole("list"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(tag("Backend"));
  });

  it("jumps to the edges with Home and End", () => {
    render(<Group />);
    tag("Frontend").focus();
    fireEvent.keyDown(screen.getByRole("list"), { key: "End" });
    expect(document.activeElement).toBe(tag("Design"));
    fireEvent.keyDown(screen.getByRole("list"), { key: "Home" });
    expect(document.activeElement).toBe(tag("Backend"));
  });

  it("reports itself as a list with entries", () => {
    render(<Group />);
    expect(screen.getByRole("list").getAttribute("aria-label")).toBe("Areas");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
