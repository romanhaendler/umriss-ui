/* The role of a message follows its tone (library-audit 03).

   `Alert` always gave `warning` and `danger` `role="alert"`; the toast
   reported every tone politely through a shared `role="status"` region. An
   error therefore meant two different things on two surfaces. The table now
   stands once in `lib/` and both read it. */

import TOKENS from "../src/styles/tokens.css?raw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, useEffect } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ToastProvider, useToast } from "../src/components/Toast";
import type { ToastTone } from "../src/components/Toast";
import { DEFAULT_WORDING } from "../src/lib/language";
import { UmrissProvider } from "../src/lib/provider";

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

/* toast-refinement 02: the options. Each test drives the public hook and reads
   what a user or a caller observes - a button, a text, a reason. */
type Api = ReturnType<typeof useToast>;

function mount(config?: Parameters<typeof UmrissProvider>[0]["toast"]) {
  const apiRef: { current: Api | null } = { current: null };
  function Grab() {
    const api = useToast();
    useEffect(() => {
      apiRef.current = api;
    });
    return null;
  }
  render(
    <UmrissProvider toast={config}>
      <ToastProvider>
        <Grab />
      </ToastProvider>
    </UmrissProvider>,
  );
  const call = <T,>(fn: (a: Api) => T): T => {
    let out!: T;
    act(() => {
      out = fn(apiRef.current!);
    });
    return out;
  };
  return call;
}

describe("Toast – action and close reason", () => {
  afterEach(() => vi.useRealTimers());

  it("runs the action, then leaves with the reason action", () => {
    const call = mount();
    const onClick = vi.fn();
    const onClose = vi.fn();
    call((t) => t.toast({ title: "3 rows deleted", action: { label: "Undo", onClick }, onClose }));
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith("action");
    expect(screen.queryByText("3 rows deleted")).toBeNull();
  });

  it("reports a closed toast as dismiss, once", () => {
    const call = mount();
    const onClose = vi.fn();
    call((t) => t.toast({ title: "Saved", onClose }));
    fireEvent.click(screen.getByRole("button", { name: DEFAULT_WORDING.closeToast }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith("dismiss");
  });

  it("reports a toast whose time ran out as timeout", () => {
    vi.useFakeTimers();
    const call = mount();
    const onClose = vi.fn();
    call((t) => t.toast({ title: "Saved", duration: 1000, onClose }));
    act(() => vi.advanceTimersByTime(1000));
    expect(onClose).toHaveBeenCalledWith("timeout");
  });

  it("reports dismiss() from the caller as dismiss", () => {
    const call = mount();
    const onClose = vi.fn();
    const id = call((t) => t.toast({ title: "Saved", onClose }));
    call((t) => t.dismiss(id));
    expect(onClose).toHaveBeenCalledWith("dismiss");
    expect(screen.queryByText("Saved")).toBeNull();
  });
});

describe("Toast – loading and update", () => {
  afterEach(() => vi.useRealTimers());

  it("keeps a loading toast without a close button and without a timer", () => {
    vi.useFakeTimers();
    const call = mount({ duration: 1000 });
    call((t) => t.toast({ title: "Saving report…", tone: "loading" }));
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText("Saving report…")).toBeTruthy();
    expect(screen.queryByRole("button", { name: DEFAULT_WORDING.closeToast })).toBeNull();
    expect(screen.getByText("Saving report…").closest("[role]")?.getAttribute("role")).toBe("status");
  });

  it("turns into its outcome in place, and its time starts then", () => {
    vi.useFakeTimers();
    const call = mount({ duration: 1000 });
    const id = call((t) => t.toast({ title: "Saving report…", tone: "loading" }));
    act(() => vi.advanceTimersByTime(5000));
    call((t) => t.update(id, { title: "Report saved", tone: "success" }));
    expect(screen.queryByText("Saving report…")).toBeNull();
    expect(screen.getByText("Report saved")).toBeTruthy();
    expect(screen.getByRole("button", { name: DEFAULT_WORDING.closeToast })).toBeTruthy();
    act(() => vi.advanceTimersByTime(999));
    expect(screen.queryByText("Report saved")).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Report saved")).toBeNull();
  });

  it("starts its time afresh on a new duration", () => {
    vi.useFakeTimers();
    const call = mount({ duration: 1000 });
    const id = call((t) => t.toast({ title: "Report saved" }));
    act(() => vi.advanceTimersByTime(900));
    call((t) => t.update(id, { duration: 0 }));
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText("Report saved")).toBeTruthy();
  });

  it("moves a failed outcome into the alert region", () => {
    const call = mount();
    const id = call((t) => t.toast({ title: "Saving…", tone: "loading" }));
    call((t) => t.update(id, { title: "Not saved", tone: "danger" }));
    expect(screen.getByText("Not saved").closest("[role]")?.getAttribute("role")).toBe("alert");
  });

  it("does nothing for an id that no longer stands", () => {
    const call = mount();
    const id = call((t) => t.toast({ title: "Saved" }));
    call((t) => t.dismiss(id));
    call((t) => t.update(id, { title: "Back again" }));
    expect(screen.queryByText("Back again")).toBeNull();
  });
});

describe("Toast – limit", () => {
  it("lets the oldest give way to the fourth, as dismissed", () => {
    const call = mount();
    const onClose = vi.fn();
    call((t) => t.toast({ title: "First", onClose }));
    call((t) => t.toast({ title: "Second" }));
    call((t) => t.toast({ title: "Third" }));
    call((t) => t.toast({ title: "Fourth" }));
    expect(screen.queryByText("First")).toBeNull();
    expect(onClose).toHaveBeenCalledWith("dismiss");
    for (const title of ["Second", "Third", "Fourth"]) expect(screen.getByText(title)).toBeTruthy();
  });

  it("takes the limit from the provider", () => {
    const call = mount({ limit: 1 });
    call((t) => t.toast({ title: "First" }));
    call((t) => t.toast({ title: "Second" }));
    expect(screen.queryByText("First")).toBeNull();
    expect(screen.getByText("Second")).toBeTruthy();
  });
});

/* toast-refinement 01: the deck. What is observable without layout: the
   count and its name, where the focus goes, and whether the time runs. */
describe("Toast – the deck", () => {
  afterEach(() => vi.useRealTimers());

  it("names the count on the front toast while more than one stands", () => {
    const call = mount();
    call((t) => t.toast({ title: "First" }));
    expect(screen.queryByRole("button", { name: DEFAULT_WORDING.toastDeckCount(1) })).toBeNull();
    call((t) => t.toast({ title: "Second" }));
    call((t) => t.toast({ title: "Third" }));
    const count = screen.getByRole("button", { name: DEFAULT_WORDING.toastDeckCount(3) });
    expect(count.textContent).toBe("1 / 3");
    expect(count.closest("[role=status] > *")?.textContent).toContain("Third");
  });

  it("opens by the count: the count gives way and the focus stands in the region", () => {
    const call = mount();
    call((t) => t.toast({ title: "First" }));
    call((t) => t.toast({ title: "Second" }));
    fireEvent.click(screen.getByRole("button", { name: DEFAULT_WORDING.toastDeckCount(2) }));
    expect(screen.queryByRole("button", { name: DEFAULT_WORDING.toastDeckCount(2) })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("region", { name: DEFAULT_WORDING.toastRegion }));
  });

  it("holds every countdown while the focus is inside, and runs on after", () => {
    vi.useFakeTimers();
    const call = mount();
    call((t) => t.toast({ title: "First", duration: 1000 }));
    call((t) => t.toast({ title: "Second", duration: 1000, action: { label: "Undo", onClick: () => {} } }));
    act(() => vi.advanceTimersByTime(400));
    act(() => screen.getByRole("button", { name: "Undo" }).focus());
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText("First")).toBeTruthy();
    expect(screen.getByText("Second")).toBeTruthy();
    act(() => screen.getByRole("button", { name: "Undo" }).blur());
    act(() => vi.advanceTimersByTime(599));
    expect(screen.queryByText("First")).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("First")).toBeNull();
  });

  /* Found in the browser: a click leaves the focus on the close button, the
     toast goes, and the focus goes with it without a blur - the deck stayed
     open for good. */
  it("closes again once the focused toast has gone", () => {
    const call = mount();
    call((t) => t.toast({ title: "First" }));
    call((t) => t.toast({ title: "Second" }));
    call((t) => t.toast({ title: "Third" }));
    const close = screen.getAllByRole("button", { name: DEFAULT_WORDING.closeToast }).at(-1)!;
    act(() => close.focus());
    expect(screen.queryByRole("button", { name: DEFAULT_WORDING.toastDeckCount(3) })).toBeNull();
    fireEvent.click(close);
    expect(screen.queryByText("Third")).toBeNull();
    act(() => (document.activeElement as HTMLElement).blur());
    expect(screen.getByRole("button", { name: DEFAULT_WORDING.toastDeckCount(2) })).toBeTruthy();
  });

  it("holds a toast that arrives while the deck is open", () => {
    vi.useFakeTimers();
    const call = mount();
    call((t) => t.toast({ title: "First", duration: 0, action: { label: "Undo", onClick: () => {} } }));
    act(() => screen.getByRole("button", { name: "Undo" }).focus());
    call((t) => t.toast({ title: "Second", duration: 1000 }));
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText("Second")).toBeTruthy();
  });
});

describe("Toast – Alt+T", () => {
  const before = document.createElement("button");
  afterEach(() => before.remove());

  it("moves the focus into the region, and Escape gives it back", () => {
    const call = mount();
    document.body.append(before);
    before.focus();
    call((t) => t.toast({ title: "Saved" }));
    fireEvent.keyDown(document, { key: "†", code: "KeyT", altKey: true });
    const region = screen.getByRole("region", { name: DEFAULT_WORDING.toastRegion });
    expect(document.activeElement).toBe(region);
    fireEvent.keyDown(region, { key: "Escape" });
    expect(document.activeElement).toBe(before);
  });

  it("gives nothing back once the focus has left by other means", () => {
    const call = mount();
    const elsewhere = document.createElement("input");
    document.body.append(before, elsewhere);
    before.focus();
    call((t) => t.toast({ title: "Saved", duration: 0, action: { label: "Show", onClick: () => {} } }));
    fireEvent.keyDown(document, { key: "†", code: "KeyT", altKey: true });
    act(() => elsewhere.focus());
    act(() => screen.getByRole("button", { name: "Show" }).focus());
    fireEvent.keyDown(screen.getByRole("button", { name: "Show" }), { key: "Escape" });
    expect(document.activeElement).not.toBe(before);
    elsewhere.remove();
  });

  it("does nothing while no toast stands", () => {
    mount();
    fireEvent.keyDown(document, { key: "†", code: "KeyT", altKey: true });
    expect(screen.queryByRole("region")).toBeNull();
    expect(document.activeElement).toBe(document.body);
  });
});
