/* The toast's counter name, shortcut hint and focus after an action; the
   announcer's reset between tests. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ToastProvider, useToast } from "../src/components/Toast";
import { announce, resetAnnouncer } from "../src/lib/announce";
import { DEFAULT_WORDING } from "../src/lib/language";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function Probe() {
  const { toast } = useToast();
  return (
    <button
      type="button"
      onClick={() => {
        toast({ title: "One", duration: 0 });
        toast({ title: "Two", duration: 0, action: { label: "Undo", onClick: () => {} } });
      }}
    >
      Go
    </button>
  );
}

describe("toast", () => {
  it("names the counter with its visible text", () => {
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    const count = screen.getByRole("button", { name: /show all/ });
    expect(count.getAttribute("aria-label")).toContain(count.textContent);
  });

  it("names each close button by its toast", () => {
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(screen.getByRole("button", { name: `${DEFAULT_WORDING.closeToast}: One` })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close message: Two" })).toBeTruthy();
  });

  it("shows the Alt+T shortcut as visible text", () => {
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(screen.getByText(DEFAULT_WORDING.toastShortcutHint)).toBeTruthy();
  });

  it("gives the focus back to where Tab came from when an action closes the toast", () => {
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    );
    const go = screen.getByRole("button", { name: "Go" });
    fireEvent.click(go);
    const undo = screen.getByRole("button", { name: "Undo" });
    undo.focus();
    fireEvent.focus(undo, { relatedTarget: go });
    fireEvent.click(undo);
    expect(document.activeElement).not.toBe(document.body);
  });
});

describe("resetAnnouncer", () => {
  it("drops a waiting announcement and empties the regions", () => {
    vi.useFakeTimers();
    announce("old");
    vi.advanceTimersByTime(150);
    const region = document.querySelector("[data-umriss-announcer]")!;
    expect(region.textContent).toBe("old");
    announce("waiting");
    resetAnnouncer();
    vi.advanceTimersByTime(500);
    expect(region.textContent).toBe("");
    document.querySelectorAll("[data-umriss-announcer]").forEach((r) => r.remove());
  });
});
