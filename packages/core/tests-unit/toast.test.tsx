/* The role of a message follows its tone (library-audit 03).

   `Alert` always gave `warning` and `danger` `role="alert"`; the toast
   reported every tone politely through a shared `role="status"` region. An
   error therefore meant two different things on two surfaces. The table now
   stands once in `lib/` and both read it. */

import TOKENS from "../src/styles/tokens.css?raw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ToastProvider, useToast } from "../src/components/Toast";
import type { ToastTone } from "../src/components/Toast";
import { DEFAULT_WORDING } from "../src/lib/language";

function Trigger({ tone }: { tone: ToastTone }) {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast({ title: "Saved", tone, duration: 0 })}>
      Report
    </button>
  );
}

const roleOfMessage = (tone: ToastTone) => {
  render(
    <ToastProvider>
      <Trigger tone={tone} />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Report" }));
  return screen.getByText("Saved").closest("[role]")?.getAttribute("role");
};

/* library-audit 07: the leaving duration stood there twice - 210 in Toast.tsx,
   200ms in the stylesheet. Now the component reads the token, and this test
   reads it too: out of tokens.css, not as a second number here.

   jsdom inherits no custom properties. The rule `*` therefore sets the token
   on every element, instead of setting it at the root and hoping for the
   cascade. */
describe("Toast – leaving", () => {
  const TOKEN = "--u-duration-exit-collapse";
  const value = () => {
    const match = new RegExp(`${TOKEN}\\s*:\\s*([\\d.]+)ms`).exec(TOKENS);
    if (!match) throw new Error(`${TOKEN} does not stand in tokens.css`);
    return Number(match[1]);
  };

  let style: HTMLStyleElement | null = null;
  afterEach(() => {
    style?.remove();
    style = null;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const report = () => {
    function Probe() {
      const { toast } = useToast();
      return (
        <button type="button" onClick={() => toast({ title: "Away with it", duration: 0 })}>
          Report
        </button>
      );
    }
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Report" }));
    fireEvent.click(screen.getByRole("button", { name: DEFAULT_WORDING.closeToast }));
  };

  it("takes the message away after the duration of the token, not before", () => {
    vi.useFakeTimers();
    style = document.createElement("style");
    style.textContent = `* { ${TOKEN}: ${value()}ms; }`;
    document.head.append(style);
    report();
    act(() => vi.advanceTimersByTime(value() - 1));
    expect(screen.queryByText("Away with it")).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Away with it")).toBeNull();
  });

  it("takes it away immediately under reduced motion", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) => ({ matches: query.includes("reduce"), media: query }) as MediaQueryList,
    );
    report();
    expect(screen.queryByText("Away with it")).toBeNull();
  });
});

/* Review finding: a live region that comes into the document with its text
   already in it is often not read out at all by a screen reader - with
   `status` all the more. The two regions therefore stand before the first
   message arrives, and the message is hung into the region of its tone. */
describe("Toast – live regions", () => {
  it("both stand before the first message arrives", () => {
    render(
      <ToastProvider>
        <span />
      </ToastProvider>,
    );
    expect(document.querySelector('[role="status"]')).not.toBeNull();
    expect(document.querySelector('[role="alert"]')).not.toBeNull();
  });
});

describe("Toast – role by tone", () => {
  it("reports an error as alert", () => {
    expect(roleOfMessage("danger")).toBe("alert");
  });

  it("reports a warning as alert", () => {
    expect(roleOfMessage("warning")).toBe("alert");
  });

  it("reports a neutral message as status", () => {
    expect(roleOfMessage("neutral")).toBe("status");
  });

  it("reports a success as status", () => {
    expect(roleOfMessage("success")).toBe("status");
  });
});
