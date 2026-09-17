/* The resting message (foundation-primitives 03).

   The point of it: the role follows the tone and is not the caller's decision.
   Whoever were allowed to set it would set it wrongly at some point - and a
   success message that cuts the screen reader off mid-sentence is just as wrong
   as an error that does not. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Alert } from "../src/components/Alert";

describe("Alert - the role follows the tone", () => {
  it("interrupts on an error", () => {
    render(<Alert tone="danger" title="Failed">Nothing was changed.</Alert>);
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("interrupts on a warning", () => {
    render(<Alert tone="warning" title="Achtung">Zwei Felder fehlen.</Alert>);
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("does not interrupt on success", () => {
    render(<Alert tone="success" title="Done">All taken over.</Alert>);
    expect(screen.queryByRole("alert")).toBeNull();
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
  });

  it("does not interrupt on neutral and accent", () => {
    const { unmount } = render(<Alert tone="neutral">As of the twelfth.</Alert>);
    expect(screen.getByRole("status").getAttribute("aria-live")).toBe("polite");
    unmount();
    render(<Alert tone="accent">Neu.</Alert>);
    expect(screen.getByRole("status").getAttribute("aria-live")).toBe("polite");
  });

  it("is neutral without a tone", () => {
    render(<Alert>Ohne Ton.</Alert>);
    expect(screen.getByRole("status")).toBeTruthy();
  });
});

describe("Alert - the build-up", () => {
  it("shows the title and the text", () => {
    render(<Alert title="As of the data">From the twelfth of August.</Alert>);
    expect(screen.getByText("As of the data")).toBeTruthy();
    expect(screen.getByText("From the twelfth of August.")).toBeTruthy();
  });

  it("manages without a title", () => {
    render(<Alert>Just one sentence.</Alert>);
    expect(screen.getByText("Just one sentence.")).toBeTruthy();
  });

  it("shows the actions", () => {
    render(
      <Alert tone="danger" title="Failed" actions={<button type="button">Again</button>}>
        Timed out.
      </Alert>,
    );
    expect(screen.getByRole("button", { name: "Again" })).toBeTruthy();
  });

  it("shows no dismiss cross as long as nobody listens for it", () => {
    render(<Alert title="Stays">Not closable.</Alert>);
    expect(screen.queryByRole("button", { name: /close/i })).toBeNull();
  });

  it("reports the dismissal", () => {
    const reported = vi.fn();
    render(
      <Alert title="Closable" onDismiss={reported}>
        Away with it.
      </Alert>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close message" }));
    expect(reported).toHaveBeenCalledTimes(1);
  });

  it("takes a label of its own for the dismissal", () => {
    render(
      <Alert onDismiss={vi.fn()} dismissLabel="Hinweis ausblenden">
        Text.
      </Alert>,
    );
    expect(screen.getByRole("button", { name: "Hinweis ausblenden" })).toBeTruthy();
  });
});
