/* The accordion at the seam a caller has (core-foundations 05): the APG
   disclosure pattern for sections - each header a button inside a heading,
   `aria-expanded` and `aria-controls` on it, the panel a region named by its
   header - with `single` and `multiple`, controlled and uncontrolled, and the
   arrow keys between the headers. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Accordion, AccordionItem } from "../src";
import type { AccordionProps } from "../src";

function Settings(props: Partial<AccordionProps>) {
  return (
    <Accordion {...props}>
      <AccordionItem value="general" title="General">
        Plant name
      </AccordionItem>
      <AccordionItem value="alarms" title="Alarms">
        Alarm limits
      </AccordionItem>
      <AccordionItem value="archive" title="Archive" disabled>
        Archive depth
      </AccordionItem>
      <AccordionItem value="users" title="Users">
        User list
      </AccordionItem>
    </Accordion>
  );
}

const header = (name: string) => screen.getByRole("button", { name });
const expanded = (name: string) => header(name).getAttribute("aria-expanded") === "true";

describe("Accordion", () => {
  it("puts each header as a button inside a heading, wired to its region", () => {
    render(<Settings defaultValue={["general"]} />);
    const button = header("General");
    expect(button.closest("h3")).not.toBeNull();
    const region = screen.getByRole("region", { name: "General" });
    expect(button.getAttribute("aria-controls")).toBe(region.id);
    expect(region.textContent).toBe("Plant name");
  });

  it("takes the heading level it is given", () => {
    render(<Settings headingLevel={4} />);
    expect(header("General").closest("h4")).not.toBeNull();
  });

  it("keeps a folded panel out of reach: inert", () => {
    const { container } = render(<Settings />);
    expect(expanded("General")).toBe(false);
    expect(container.querySelector("[inert]")).not.toBeNull();
  });

  it("single: opening one folds the other, and the open one folds on a second click", () => {
    render(<Settings type="single" defaultValue={["general"]} />);
    fireEvent.click(header("Alarms"));
    expect(expanded("Alarms")).toBe(true);
    expect(expanded("General")).toBe(false);
    fireEvent.click(header("Alarms"));
    expect(expanded("Alarms")).toBe(false);
  });

  it("multiple: sections open side by side", () => {
    render(<Settings type="multiple" />);
    fireEvent.click(header("General"));
    fireEvent.click(header("Users"));
    expect(expanded("General")).toBe(true);
    expect(expanded("Users")).toBe(true);
  });

  it("uncontrolled: reports every change as a message", () => {
    const changed = vi.fn();
    render(<Settings type="multiple" defaultValue={["general"]} onChange={changed} />);
    fireEvent.click(header("Users"));
    expect(changed).toHaveBeenCalledWith(["general", "users"]);
  });

  it("controlled: reports and waits until value follows", () => {
    const changed = vi.fn();
    const { rerender } = render(<Settings value={[]} onChange={changed} />);
    fireEvent.click(header("Alarms"));
    expect(changed).toHaveBeenCalledWith(["alarms"]);
    expect(expanded("Alarms")).toBe(false);
    rerender(<Settings value={["alarms"]} onChange={changed} />);
    expect(expanded("Alarms")).toBe(true);
  });

  it("a disabled section does not open", () => {
    render(<Settings />);
    expect(header("Archive")).toHaveProperty("disabled", true);
  });

  it("moves between the headers on the arrows, Home and End, skipping a disabled one", () => {
    render(<Settings />);
    header("General").focus();
    fireEvent.keyDown(header("General"), { key: "ArrowDown" });
    expect(document.activeElement).toBe(header("Alarms"));
    fireEvent.keyDown(header("Alarms"), { key: "ArrowDown" });
    expect(document.activeElement).toBe(header("Users"));
    fireEvent.keyDown(header("Users"), { key: "ArrowDown" });
    expect(document.activeElement).toBe(header("General"));
    fireEvent.keyDown(header("General"), { key: "ArrowUp" });
    expect(document.activeElement).toBe(header("Users"));
    fireEvent.keyDown(header("Users"), { key: "Home" });
    expect(document.activeElement).toBe(header("General"));
    fireEvent.keyDown(header("General"), { key: "End" });
    expect(document.activeElement).toBe(header("Users"));
  });

  it("does not take the arrows from a field inside a panel", () => {
    render(
      <Accordion defaultValue={["a"]}>
        <AccordionItem value="a" title="Limits">
          <input aria-label="Upper limit" />
        </AccordionItem>
        <AccordionItem value="b" title="Other">
          Text
        </AccordionItem>
      </Accordion>,
    );
    const field = screen.getByRole("textbox", { name: "Upper limit" });
    field.focus();
    fireEvent.keyDown(field, { key: "ArrowDown" });
    expect(document.activeElement).toBe(field);
  });
});
