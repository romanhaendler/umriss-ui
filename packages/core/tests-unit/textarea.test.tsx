/* The caller's onInput adds behaviour instead of taking it away
   (library-audit 04).

   `Textarea` set its own `onInput` and spread `...rest` afterwards. Whoever
   listened thereby overwrote the library's listener - the counter stood still
   and the field no longer grew along. The measurements themselves stand in
   measure.test.ts; here it is only about their still being called. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Textarea } from "../src/components/Textarea";

describe("Textarea with an onInput of its own", () => {
  it("calls the caller's onInput and counts all the same", () => {
    const onInput = vi.fn();
    render(<Textarea aria-label="Notiz" maxLength={10} showCount onInput={onInput} />);
    fireEvent.input(screen.getByRole("textbox", { name: "Notiz" }), { target: { value: "abc" } });
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(screen.getByText("7")).toBeTruthy();
  });

  it("grows along all the same", () => {
    render(<Textarea aria-label="Notiz" autoGrow onInput={() => undefined} />);
    const field = screen.getByRole("textbox", { name: "Notiz" }) as HTMLTextAreaElement;
    // A value that only the re-measuring overwrites again.
    field.style.height = "123px";
    fireEvent.input(field, { target: { value: "abc\ndef" } });
    expect(field.style.height).not.toBe("123px");
  });
});
