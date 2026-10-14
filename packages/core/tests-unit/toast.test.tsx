/* The role of a message follows its tone (library-audit 03).

   `Alert` always gave `warning` and `danger` `role="alert"`; the toast
   reported every tone politely through a shared `role="status"` region. An
   error therefore meant two different things on two surfaces. The table now
   stands once in `lib/` and both read it. */

import TOKENS from "../src/styles/tokens.css?raw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StrictMode, act, useEffect, useState } from "react";
import { cleanup, fireEvent, isInaccessible, render, screen } from "@testing-library/react";
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
  const tree = (held: boolean) => (
    <UmrissProvider toast={config}>
      <ToastProvider held={held}>
        <Grab />
      </ToastProvider>
    </UmrissProvider>
  );
  const view = render(tree(false));
  const call = <T,>(fn: (a: Api) => T): T => {
    let out!: T;
    act(() => {
      out = fn(apiRef.current!);
    });
    return out;
  };
  /** Holds the toasts back, or lets them come again, as an application does
      by its prop. */
  const hold = (held: boolean) => view.rerender(tree(held));
  return Object.assign(call, { hold });
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

/* Held back: out of sight, hearing and reach, with every countdown standing
   still, and nothing lost when the hold ends. */
describe("Toast – held", () => {
  /* The exit takes as long as in a browser, so that a toast still leaving
     would be found. */
  const exit = document.createElement("style");
  exit.textContent = "* { --u-duration-exit-collapse: 200ms; }";
  afterEach(() => {
    exit.remove();
    vi.useRealTimers();
  });

  it("leaves no card in the accessibility tree and none focusable", () => {
    const call = mount();
    call((t) => t.toast({ title: "Saved", duration: 0, action: { label: "Undo", onClick: () => {} } }));
    call.hold(true);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("region")).toBeNull();
    /* jsdom focuses what a browser would not; what is out of the tree is
       out of the tab order there (the browser test presses Tab). */
    expect(screen.getAllByRole("button", { hidden: true }).every((button) => isInaccessible(button))).toBe(true);
    call.hold(false);
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
    expect(screen.getByRole("region", { name: DEFAULT_WORDING.toastRegion })).toBeTruthy();
  });

  it("stands a countdown still: a 5 s toast held at 3 s for 10 s has 2 s left", () => {
    vi.useFakeTimers();
    const call = mount();
    const onClose = vi.fn();
    call((t) => t.toast({ title: "Saved", duration: 5000, onClose }));
    act(() => vi.advanceTimersByTime(3000));
    call.hold(true);
    act(() => vi.advanceTimersByTime(10_000));
    call.hold(false);
    act(() => vi.advanceTimersByTime(1999));
    expect(screen.queryByText("Saved")).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Saved")).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith("timeout");
  });

  it("keeps a toast that arrives during the hold out of its live region, with its full duration, until the hold ends", () => {
    vi.useFakeTimers();
    const call = mount();
    call.hold(true);
    const id = call((t) => t.toast({ title: "Exported", duration: 5000 }));
    expect(typeof id).toBe("number");
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.queryByText("Exported")).toBeNull();
    call.hold(false);
    expect(screen.getByText("Exported").closest("[role]")?.getAttribute("role")).toBe("status");
    act(() => vi.advanceTimersByTime(4999));
    expect(screen.queryByText("Exported")).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Exported")).toBeNull();
  });

  it("counts a toast sent in the same handler that begins the hold as arriving during it: its text enters its live region when the hold ends", () => {
    function Send({ setHeld }: { setHeld: (held: boolean) => void }) {
      const { toast } = useToast();
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setHeld(true);
              toast({ title: "Exported", duration: 0 });
            }}
          >
            Hold and send
          </button>
          <button type="button" onClick={() => setHeld(false)}>
            End the hold
          </button>
        </>
      );
    }
    function App() {
      const [held, setHeld] = useState(false);
      return (
        <ToastProvider held={held}>
          <Send setHeld={setHeld} />
        </ToastProvider>
      );
    }
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Hold and send" }));
    const inserted: string[] = [];
    const observer = new MutationObserver((records) =>
      records.forEach((record) => record.addedNodes.forEach((node) => inserted.push(node.textContent ?? ""))),
    );
    for (const live of document.querySelectorAll("[role=status], [role=alert]")) observer.observe(live, { childList: true, subtree: true });
    fireEvent.click(screen.getByRole("button", { name: "End the hold" }));
    observer.takeRecords().forEach((record) => record.addedNodes.forEach((node) => inserted.push(node.textContent ?? "")));
    observer.disconnect();
    expect(inserted.some((text) => text.includes("Exported"))).toBe(true);
  });

  it("does not insert a toast that stood before the hold into its live region again", async () => {
    const call = mount();
    call((t) => t.toast({ title: "Saved", duration: 0 }));
    call((t) => t.toast({ title: "Not sent", tone: "danger", duration: 0 }));
    const inserted: string[] = [];
    const observer = new MutationObserver((records) =>
      records.forEach((record) => record.addedNodes.forEach((node) => inserted.push(node.textContent ?? ""))),
    );
    for (const live of document.querySelectorAll("[role=status], [role=alert]")) observer.observe(live, { childList: true, subtree: true });
    call.hold(true);
    call.hold(false);
    await act(async () => {});
    observer.disconnect();
    expect(inserted.filter((text) => text.includes("Saved") || text.includes("Not sent"))).toEqual([]);
    expect(screen.getByText("Saved")).toBeTruthy();
    expect(screen.getByText("Not sent")).toBeTruthy();
  });

  it("closes a toast dismissed during the hold at once, and it does not come back", () => {
    document.head.append(exit);
    const call = mount();
    const onClose = vi.fn();
    const before = call((t) => t.toast({ title: "Saved", duration: 0, onClose }));
    call.hold(true);
    const during = call((t) => t.toast({ title: "Exported", duration: 0, onClose }));
    call((t) => t.dismiss(before));
    call((t) => t.dismiss(during));
    expect(onClose.mock.calls).toEqual([["dismiss"], ["dismiss"]]);
    call.hold(false);
    expect(screen.queryByText("Saved")).toBeNull();
    expect(screen.queryByText("Exported")).toBeNull();
  });

  it("lets a toast already leaving when the hold begins go unseen", () => {
    document.head.append(exit);
    const call = mount();
    const id = call((t) => t.toast({ title: "Saved", duration: 0 }));
    call((t) => t.dismiss(id));
    call.hold(true);
    call.hold(false);
    expect(screen.queryByText("Saved")).toBeNull();
  });

  it("lets Alt+T through to the page while held", () => {
    const call = mount();
    const before = document.createElement("button");
    document.body.append(before);
    before.focus();
    call((t) => t.toast({ title: "Saved", duration: 0 }));
    call.hold(true);
    const passed = fireEvent.keyDown(document, { key: "†", code: "KeyT", altKey: true });
    expect(passed).toBe(true);
    expect(document.activeElement).toBe(before);
    before.remove();
  });

  it("gives a focus in the deck back where it came from when the hold begins, and the deck comes back closed", () => {
    vi.useFakeTimers();
    const call = mount();
    const before = document.createElement("button");
    document.body.append(before);
    before.focus();
    call((t) => t.toast({ title: "First", duration: 1000 }));
    call((t) => t.toast({ title: "Second", duration: 1000 }));
    fireEvent.keyDown(document, { key: "†", code: "KeyT", altKey: true });
    expect(document.activeElement).toBe(screen.getByRole("region", { name: DEFAULT_WORDING.toastRegion }));
    call.hold(true);
    expect(document.activeElement).toBe(before);
    call.hold(false);
    expect(screen.getByRole("button", { name: DEFAULT_WORDING.toastDeckCount(2) })).toBeTruthy();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText("First")).toBeNull();
    before.remove();
  });

  it("brings back what update() changed during the hold, a success counting from its end", () => {
    vi.useFakeTimers();
    const call = mount({ duration: 1000 });
    const saving = call((t) => t.toast({ title: "Saving report…", tone: "loading" }));
    const renamed = call((t) => t.toast({ title: "Draft", duration: 0 }));
    call.hold(true);
    call((t) => t.update(saving, { title: "Report saved", tone: "success" }));
    call((t) => t.update(renamed, { title: "Draft renamed" }));
    act(() => vi.advanceTimersByTime(10_000));
    call.hold(false);
    expect(screen.getByText("Report saved")).toBeTruthy();
    expect(screen.getByText("Draft renamed")).toBeTruthy();
    expect(screen.queryByText("Saving report…")).toBeNull();
    act(() => vi.advanceTimersByTime(999));
    expect(screen.queryByText("Report saved")).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Report saved")).toBeNull();
  });

  it("keeps the limit: of four arriving during the hold the oldest goes with dismiss at once, three come back", () => {
    document.head.append(exit);
    const call = mount();
    const onClose = vi.fn();
    call.hold(true);
    call((t) => t.toast({ title: "First", duration: 0, onClose }));
    for (const title of ["Second", "Third", "Fourth"]) call((t) => t.toast({ title, duration: 0 }));
    expect(onClose).toHaveBeenCalledWith("dismiss");
    call.hold(false);
    expect(screen.queryByText("First")).toBeNull();
    for (const title of ["Second", "Third", "Fourth"]) expect(screen.getByText(title)).toBeTruthy();
  });

  it("calls no onClose of a standing toast by holding", () => {
    vi.useFakeTimers();
    document.head.append(exit);
    const call = mount();
    const onClose = vi.fn();
    call((t) => t.toast({ title: "Saved", duration: 5000, onClose }));
    call((t) => t.toast({ title: "Undo it", duration: 0, onClose, action: { label: "Undo", onClick: () => {} } }));
    call.hold(true);
    act(() => vi.advanceTimersByTime(60_000));
    call.hold(false);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
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

/* jsdom has no top layer and no Popover API: these run the fallback, a plain
   fixed box inside the dialog. The setup's `showModal()` and `close()` only
   set and remove `open`; the tracker's callback is a microtask. */
describe("Toast – inside a modal dialog", () => {
  const dialogs: HTMLDialogElement[] = [];
  const dialog = () => {
    const element = document.createElement("dialog");
    document.body.append(element);
    dialogs.push(element);
    return element;
  };
  const settle = () => act(async () => {});
  const open = async (element: HTMLDialogElement) => {
    act(() => element.showModal());
    await settle();
  };
  const close = async (element: HTMLDialogElement) => {
    act(() => element.close());
    await settle();
  };
  const region = () => document.querySelector("[data-edge]")!;

  afterEach(() => {
    dialogs.splice(0).forEach((element) => element.remove());
  });

  const mountIn = (portalTarget?: HTMLElement | (() => HTMLElement | null), strict = false) => {
    const apiRef: { current: Api | null } = { current: null };
    function Grab() {
      const api = useToast();
      useEffect(() => {
        apiRef.current = api;
      });
      return null;
    }
    const tree = (
      <UmrissProvider portalTarget={portalTarget}>
        <ToastProvider>
          <Grab />
        </ToastProvider>
      </UmrissProvider>
    );
    render(strict ? <StrictMode>{tree}</StrictMode> : tree);
    return <T,>(fn: (a: Api) => T): T => {
      let out!: T;
      act(() => {
        out = fn(apiRef.current!);
      });
      return out;
    };
  };

  it("stands in a dialog opened with showModal(), before and after a toast arrives", async () => {
    const call = mountIn();
    const first = dialog();
    await open(first);
    expect(first.contains(region())).toBe(true);
    call((t) => t.toast({ title: "Saved" }));
    expect(first.contains(region())).toBe(true);
  });

  it("stands in a dialog that was open before the provider mounted", async () => {
    const first = dialog();
    first.showModal();
    mountIn();
    await settle();
    expect(first.contains(region())).toBe(true);
  });

  it("returns to the body when the dialog closes", async () => {
    const first = dialog();
    mountIn();
    await open(first);
    await close(first);
    expect(region().parentElement).toBe(document.body);
  });

  it("returns to the provider's portal target", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const first = dialog();
    mountIn(host);
    expect(host.contains(region())).toBe(true);
    await open(first);
    expect(first.contains(region())).toBe(true);
    await close(first);
    expect(host.contains(region())).toBe(true);
    host.remove();
  });

  it("finds a portal target that enters the document after the provider", () => {
    const find = () => document.getElementById("late-host");
    const call = mountIn(find);
    expect(region().parentElement).toBe(document.body);
    const host = document.createElement("div");
    host.id = "late-host";
    document.body.append(host);
    call((t) => t.toast({ title: "Saved" }));
    expect(host.contains(region())).toBe(true);
    host.remove();
  });

  it("follows the dialog opened last, and goes to the first when the second closes", async () => {
    const first = dialog();
    const second = dialog();
    mountIn();
    await open(first);
    await open(second);
    expect(second.contains(region())).toBe(true);
    await close(second);
    expect(first.contains(region())).toBe(true);
  });

  it("is given back when the dialog leaves the document while open", async () => {
    const first = dialog();
    mountIn();
    await open(first);
    act(() => first.remove());
    await settle();
    expect(document.body.contains(region())).toBe(true);
    expect(first.contains(region())).toBe(false);
  });

  it("stands in the body without a dialog, with no popover attribute", async () => {
    const call = mountIn();
    call((t) => t.toast({ title: "Saved" }));
    expect(region().parentElement).toBe(document.body);
    expect(region().hasAttribute("popover")).toBe(false);
  });

  it("runs the action and reports it when pressed inside the dialog", async () => {
    const call = mountIn();
    const first = dialog();
    await open(first);
    const onClick = vi.fn();
    const onClose = vi.fn();
    call((t) => t.toast({ title: "Failed", duration: 0, action: { label: "Retry", onClick }, onClose }));
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith("action");
  });

  it("has both live regions inside the dialog before the next message arrives", async () => {
    mountIn();
    const first = dialog();
    await open(first);
    expect(first.querySelector("[role=status]")).not.toBeNull();
    expect(first.querySelector("[role=alert]")).not.toBeNull();
  });

  it("is one region, inside the dialog, under StrictMode", async () => {
    mountIn(undefined, true);
    const first = dialog();
    await open(first);
    expect(document.querySelectorAll("[data-edge]")).toHaveLength(1);
    expect(first.contains(region())).toBe(true);
  });

  describe("when the region moves", () => {
    afterEach(() => vi.useRealTimers());

    it("does not call onClose and does not restart a countdown", async () => {
      vi.useFakeTimers();
      const call = mountIn();
      const first = dialog();
      const onClose = vi.fn();
      call((t) => t.toast({ title: "Saved", duration: 5000, onClose }));
      act(() => vi.advanceTimersByTime(3000));
      await open(first);
      expect(first.contains(region())).toBe(true);
      expect(onClose).not.toHaveBeenCalled();
      act(() => vi.advanceTimersByTime(1999));
      expect(screen.queryByText("Saved")).not.toBeNull();
      act(() => vi.advanceTimersByTime(1));
      expect(onClose).toHaveBeenCalledWith("timeout");
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("closes a deck open under the pointer, and the countdowns run again", async () => {
      vi.useFakeTimers();
      const call = mountIn();
      const first = dialog();
      call((t) => t.toast({ title: "Saved", duration: 5000 }));
      fireEvent.pointerEnter(region());
      act(() => vi.advanceTimersByTime(60_000));
      expect(screen.queryByText("Saved")).not.toBeNull();
      await open(first);
      act(() => vi.advanceTimersByTime(5000));
      expect(screen.queryByText("Saved")).toBeNull();
    });

    it("closes a deck holding the focus, and a later Escape gives nothing back", async () => {
      vi.useFakeTimers();
      const call = mountIn();
      const first = dialog();
      const before = document.createElement("button");
      document.body.append(before);
      before.focus();
      call((t) => t.toast({ title: "Saved", duration: 5000 }));
      fireEvent.keyDown(document, { code: "KeyT", altKey: true });
      expect(document.activeElement).toBe(region());
      await open(first);
      act(() => vi.advanceTimersByTime(5000));
      expect(screen.queryByText("Saved")).toBeNull();
      const elsewhere = document.createElement("button");
      document.body.append(elsewhere);
      elsewhere.focus();
      call((t) => t.toast({ title: "Again", duration: 0 }));
      fireEvent.keyDown(region(), { key: "Escape" });
      expect(document.activeElement).not.toBe(before);
      before.remove();
      elsewhere.remove();
    });

    it("reaches a toast by its id: a loading toast turns into its outcome after the dialog closed", async () => {
      vi.useFakeTimers();
      const call = mountIn();
      const first = dialog();
      await open(first);
      const id = call((t) => t.toast({ title: "Saving…", tone: "loading" }));
      await close(first);
      call((t) => t.update(id, { title: "Saved", tone: "success", duration: 1000 }));
      expect(screen.getByText("Saved")).toBeTruthy();
      expect(region().parentElement).toBe(document.body);
      act(() => vi.advanceTimersByTime(1000));
      expect(screen.queryByText("Saved")).toBeNull();
    });

    it("dismisses a toast by its id", async () => {
      const call = mountIn();
      const first = dialog();
      await open(first);
      const onClose = vi.fn();
      const id = call((t) => t.toast({ title: "Saved", duration: 0, onClose }));
      await close(first);
      call((t) => t.dismiss(id));
      expect(onClose).toHaveBeenCalledWith("dismiss");
      expect(screen.queryByText("Saved")).toBeNull();
    });

    it("leaves a toast shown with the closing dialog standing once, outside it", async () => {
      for (const toastFirst of [true, false]) {
        const call = mountIn();
        const first = dialog();
        await open(first);
        const onClose = vi.fn();
        act(() => {
          if (toastFirst) call((t) => t.toast({ title: "Saved", duration: 0, onClose }));
          first.close();
          if (!toastFirst) call((t) => t.toast({ title: "Saved", duration: 0, onClose }));
        });
        await settle();
        expect(screen.getAllByText("Saved")).toHaveLength(1);
        expect(first.contains(region())).toBe(false);
        expect(onClose).not.toHaveBeenCalled();
        cleanup();
      }
    });

    it("hands the cards standing at a move their age as a negative animation delay", async () => {
      vi.useFakeTimers();
      const call = mountIn();
      const first = dialog();
      const delay = (title: string) =>
        screen.getByText(title).closest<HTMLElement>("[data-toast]")!.parentElement!.parentElement!.style.getPropertyValue("--_delay");
      call((t) => t.toast({ title: "Older", duration: 0 }));
      act(() => vi.advanceTimersByTime(100));
      call((t) => t.toast({ title: "Newer", duration: 0 }));
      act(() => vi.advanceTimersByTime(150));
      expect(delay("Older")).toBe("");
      await open(first);
      expect(delay("Older")).toBe("-250ms");
      expect(delay("Newer")).toBe("-150ms");
      call((t) => t.toast({ title: "Latest", duration: 0 }));
      expect(delay("Latest")).toBe("");
    });

    it("lets a toast shown in the tick of a dialog that closes at once begin its entrance at the start", async () => {
      vi.useFakeTimers();
      const call = mountIn();
      const first = dialog();
      await open(first);
      act(() => {
        call((t) => t.toast({ title: "Saved", duration: 0 }));
        first.close();
      });
      await settle();
      expect(screen.getByText("Saved").closest<HTMLElement>("[data-toast]")!.parentElement!.parentElement!.style.getPropertyValue("--_delay")).toBe("-0ms");
    });

    it("lets a toast that arrived during a hold in the dialog enter a live region that stood for a frame, when the dialog closes as the hold ends", async () => {
      for (const together of [true, false]) {
        const apiRef: { current: Api | null } = { current: null };
        function Grab() {
          const api = useToast();
          useEffect(() => {
            apiRef.current = api;
          });
          return null;
        }
        const tree = (held: boolean) => (
          <ToastProvider held={held}>
            <Grab />
          </ToastProvider>
        );
        const view = render(tree(false));
        const first = dialog();
        await open(first);
        view.rerender(tree(true));
        act(() => void apiRef.current!.toast({ title: "Exported", duration: 0 }));
        /* The live regions that stood in an animation frame. */
        const stood = new Set<Element>();
        let watching = true;
        requestAnimationFrame(function watch() {
          document.querySelectorAll("[role=status], [role=alert]").forEach((live) => stood.add(live));
          if (watching) requestAnimationFrame(watch);
        });
        /* Each insertion of the text: whether it went into a live region that
           had stood in a frame before, outside the closed dialog. */
        const insertions: boolean[] = [];
        const observer = new MutationObserver((records) =>
          records.forEach((record) =>
            record.addedNodes.forEach((node) => {
              if (!node.textContent?.includes("Exported")) return;
              const live = (record.target as Element).closest("[role=status], [role=alert]");
              insertions.push(live !== null && stood.has(live) && !first.contains(live));
            }),
          ),
        );
        observer.observe(document.body, { childList: true, subtree: true });
        if (together) {
          act(() => {
            first.close();
            view.rerender(tree(false));
          });
        } else {
          await close(first);
          view.rerender(tree(false));
        }
        await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
        watching = false;
        observer.disconnect();
        expect(region().parentElement, `together: ${together}`).toBe(document.body);
        expect(screen.getByText("Exported")).toBeTruthy();
        expect(insertions.length, `together: ${together}`).toBeGreaterThan(0);
        expect(insertions.every(Boolean), `together: ${together}`).toBe(true);
        cleanup();
      }
    });

    it("keeps the same toasts in the same two regions", async () => {
      const call = mountIn();
      const first = dialog();
      call((t) => t.toast({ title: "Saved", duration: 0 }));
      call((t) => t.toast({ title: "Failed", tone: "danger", duration: 0 }));
      await open(first);
      const live = (role: string) => [...region().querySelectorAll(`[role=${role}] p`)].map((p) => p.textContent);
      expect(live("status")).toEqual(["Saved"]);
      expect(live("alert")).toEqual(["Failed"]);
    });
  });
});

describe("Toast – the top layer", () => {
  const shown = vi.fn();
  const region = () => document.querySelector("[data-edge]")!;

  afterEach(() => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover;
    shown.mockClear();
    document.querySelectorAll("dialog").forEach((element) => element.remove());
  });

  /* jsdom has no Popover API: a test that wants one supplies it. */
  const withPopoverApi = () => {
    HTMLElement.prototype.showPopover = function (this: HTMLElement) {
      /* The browser's own refusal. */
      if (!this.isConnected) throw new DOMException("Invalid on disconnected popover elements.", "InvalidStateError");
      shown(this);
    };
  };
  const tree = (
    <UmrissProvider>
      <ToastProvider>{null}</ToastProvider>
    </UmrissProvider>
  );
  const mountInDialog = async (strict = false) => {
    const element = document.createElement("dialog");
    document.body.append(element);
    render(strict ? <StrictMode>{tree}</StrictMode> : tree);
    act(() => element.showModal());
    await act(async () => {});
    return element;
  };

  it("carries no popover attribute without a dialog", async () => {
    withPopoverApi();
    render(tree);
    await act(async () => {});
    expect(region().hasAttribute("popover")).toBe(false);
    expect(shown).not.toHaveBeenCalled();
  });

  it("carries no popover attribute inside a dialog where the Popover API is missing", async () => {
    const element = await mountInDialog();
    expect(element.contains(region())).toBe(true);
    expect(region().hasAttribute("popover")).toBe(false);
  });

  it("is a manual popover, shown once, inside a dialog where the Popover API exists", async () => {
    withPopoverApi();
    const element = await mountInDialog();
    expect(element.contains(region())).toBe(true);
    expect(region().getAttribute("popover")).toBe("manual");
    expect(shown).toHaveBeenCalledTimes(1);
  });

  it("is shown inside a dialog under StrictMode without a second region", async () => {
    withPopoverApi();
    await mountInDialog(true);
    expect(document.querySelectorAll("[data-edge]")).toHaveLength(1);
    expect(region().getAttribute("popover")).toBe("manual");
    expect(shown.mock.calls.filter(([element]) => element === region()).length).toBeGreaterThan(0);
  });

  it("is not shown again once its dialog left the document while open", async () => {
    withPopoverApi();
    const element = await mountInDialog();
    act(() => {
      element.close();
      element.remove();
    });
    await act(async () => {});
    expect(document.body.contains(region())).toBe(true);
    expect(region().hasAttribute("popover")).toBe(false);
  });
});
