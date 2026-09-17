/* The root provider (consumable-package 02).

   The most important block stands first: **without a provider** everything
   behaves as before. That is not an edge condition but the promise the
   step-by-step adoption of the library hangs on - one component from each sort
   that reads configuration at all.

   The `density` prop and the `data-density` attribute were German until
   english-and-umriss-ui 31 - `dichte` and `data-dichte`, the last public
   German left in the library. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { UmrissProvider, useDensityFor } from "../src/lib/provider";
import { Popover } from "../src/components/Popover";
import { ToastProvider, useToast } from "../src/components/Toast";
import { Input } from "../src/components/Input";
import { Spinner } from "../src/components/Spinner";

/* An anchor with a panel on it - the smallest case at which the portal target
   can be observed. */
function PopoverSample({ id = "probe" }: { id?: string }) {
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={anchor} type="button">
        Anker
      </button>
      <Popover open onOpenChange={() => {}} anchorRef={anchor} id={id}>
        <span data-content>Content</span>
      </Popover>
    </>
  );
}

function ToastSample({ duration }: { duration?: number }) {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast({ title: "Gespeichert", duration })}>
      Melden
    </button>
  );
}

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

describe("Without a provider – the checked normal case", () => {
  it("labels an input as before", () => {
    render(<Input value="etwas" onChange={() => {}} clearable onClear={() => {}} />);
    expect(screen.getByLabelText("Clear input")).toBeTruthy();
  });

  it("leaves a state indicator as before", () => {
    render(<Spinner />);
    expect(screen.getByLabelText("Loading")).toBeTruthy();
  });

  it("portals an overlay to the body as before", () => {
    render(<PopoverSample />);
    const content = document.querySelector("[data-content]");
    expect(content?.closest("body")).toBe(document.body);
    // Not rendered into the test environment's body, but portalled.
    expect(document.getElementById("probe")?.parentElement).toBe(document.body);
  });

  it("dismisses a toast after the preset five seconds", () => {
    vi.useFakeTimers();
    try {
      render(
        <ToastProvider>
          <ToastSample />
        </ToastProvider>,
      );
      act(() => {
        screen.getByText("Melden").click();
      });
      expect(screen.getByText("Gespeichert")).toBeTruthy();
      act(() => {
        vi.advanceTimersByTime(4900);
      });
      expect(screen.queryByText("Gespeichert")).toBeTruthy();
      act(() => {
        vi.advanceTimersByTime(200);
      });
      /* The countdown has run out. jsdom does not know the token of the exit
         duration, so the exit has no duration here: the toast is gone rather
         than withdrawing. The duration itself is checked by toast.test.tsx. */
      expect(screen.queryByText("Gespeichert")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not touch the theme attribute", () => {
    render(<Spinner />);
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});

describe("Theme", () => {
  it("sets the attribute the tokens listen to", async () => {
    render(
      <UmrissProvider theme="dark">
        <Spinner />
      </UmrissProvider>,
    );
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("dark"));
  });

  it("leaves the attribute alone where no theme is given", async () => {
    document.documentElement.dataset.theme = "light";
    render(
      <UmrissProvider>
        <Spinner />
      </UmrissProvider>,
    );
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("light"));
  });

  it("puts back on teardown what stood there before", async () => {
    document.documentElement.dataset.theme = "light";
    const { unmount } = render(
      <UmrissProvider theme="dark">
        <Spinner />
      </UmrissProvider>,
    );
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("dark"));
    unmount();
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});

describe('Theme "system" – following means subscribing', () => {
  let dark = false;
  const listeners = new Set<() => void>();

  beforeEach(() => {
    dark = false;
    listeners.clear();
    /* `matches` as a getter, not as a value: a real MediaQueryList reads the
       state anew on every access, and that is exactly what the listener relies
       on. A frozen value would have checked a promise here that the browser
       does not make at all. */
    vi.stubGlobal("matchMedia", (query: string) => ({
      get matches() {
        return query.includes("dark") && dark;
      },
      media: query,
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("takes the setting at the start", async () => {
    dark = true;
    render(
      <UmrissProvider theme="system">
        <Spinner />
      </UmrissProvider>,
    );
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("dark"));
  });

  it("takes a change at runtime along", async () => {
    render(
      <UmrissProvider theme="system">
        <Spinner />
      </UmrissProvider>,
    );
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("light"));

    act(() => {
      dark = true;
      listeners.forEach((fn) => fn());
    });
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("unsubscribes again on teardown", async () => {
    const { unmount } = render(
      <UmrissProvider theme="system">
        <Spinner />
      </UmrissProvider>,
    );
    await waitFor(() => expect(listeners.size).toBe(1));
    unmount();
    expect(listeners.size).toBe(0);
  });
});

describe("Portal target", () => {
  it("portals into the configured container", () => {
    const target = document.createElement("div");
    target.id = "eigener-container";
    document.body.appendChild(target);
    try {
      render(
        <UmrissProvider portalTarget={target}>
          <PopoverSample id="im-container" />
        </UmrissProvider>,
      );
      expect(document.getElementById("im-container")?.parentElement).toBe(target);
    } finally {
      target.remove();
    }
  });

  it("evaluates a function on opening", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    try {
      render(
        <UmrissProvider portalTarget={() => target}>
          <PopoverSample id="aus-funktion" />
        </UmrissProvider>,
      );
      expect(document.getElementById("aus-funktion")?.parentElement).toBe(target);
    } finally {
      target.remove();
    }
  });

  it("lets the dialog rule take precedence", () => {
    /* A panel portalling out of a dialog to a container at the body would lie
       behind the dialog. The rule of the popover seam therefore beats the
       setting. */
    const target = document.createElement("div");
    document.body.appendChild(target);
    try {
      render(
        <UmrissProvider portalTarget={target}>
          <dialog open data-dialog>
            <PopoverSample id="im-dialog" />
          </dialog>
        </UmrissProvider>,
      );
      const panel = document.getElementById("im-dialog");
      expect(panel?.closest("dialog")).toBeTruthy();
      expect(panel?.parentElement).not.toBe(target);
    } finally {
      target.remove();
    }
  });
});

describe("Setting for toasts", () => {
  it("sets the default display duration", () => {
    vi.useFakeTimers();
    try {
      render(
        <UmrissProvider toast={{ duration: 1000 }}>
          <ToastProvider>
            <ToastSample />
          </ToastProvider>
        </UmrissProvider>,
      );
      act(() => {
        screen.getByText("Melden").click();
      });
      act(() => {
        vi.advanceTimersByTime(1100);
      });
      /* Gone after the default. jsdom does not know the token of the exit
         duration, so the exit has no duration here - the toast is gone rather
         than leaving (toast.test.tsx checks the duration). */
      expect(screen.queryByText("Gespeichert")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("lets the individual toast beat the default", () => {
    vi.useFakeTimers();
    try {
      render(
        <UmrissProvider toast={{ duration: 1000 }}>
          <ToastProvider>
            <ToastSample duration={9000} />
          </ToastProvider>
        </UmrissProvider>,
      );
      act(() => {
        screen.getByText("Melden").click();
      });
      act(() => {
        vi.advanceTimersByTime(1100);
      });
      expect(document.querySelector("[class*=itemWrapLeaving]")).toBeNull();
      expect(screen.queryByText("Gespeichert")).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("Wording through the root provider", () => {
  it("reaches the component that uses the entry", () => {
    render(
      <UmrissProvider language={{ wording: { clearInput: "Clear input" } }}>
        <Input value="etwas" onChange={() => {}} clearable onClear={() => {}} />
      </UmrissProvider>,
    );
    expect(screen.getByLabelText("Clear input")).toBeTruthy();
  });

  it("falls back on the default for the entries left out", () => {
    render(
      <UmrissProvider language={{ wording: { clearInput: "Clear input" } }}>
        <Spinner />
      </UmrissProvider>,
    );
    expect(screen.getByLabelText("Loading")).toBeTruthy();
  });
});

/* Reads the density the way a component with a density of its own reads it. */
function DensitySample({
  own,
  fallback,
}: {
  own?: Parameters<typeof useDensityFor>[0];
  fallback: Parameters<typeof useDensityFor>[1];
}) {
  return <span data-probe={useDensityFor(own, fallback)} />;
}
const read = () => document.querySelector("[data-probe]")?.getAttribute("data-probe");

/* library-audit 07: the setting was dead. `Density` and `useDensity` existed,
   nobody read them - a provider with `density="compact"` changed nothing. Since
   then the attribute stands beside `data-theme`, and a component reads the
   setting with `useDensityFor` as the default of its `density`. A compact set of
   tokens does not exist with that; that is work package B.13.

   The two readers this was checked against - table and alarm list - have stood
   in @umriss-ui/table since umriss-table 14 and carry their cases there
   (`breiten.test.tsx`, `alarmList.test.tsx`). What stays here is what
   @umriss-ui/core promises itself: the attribute, and the hook through which
   every component reads the setting. The delicate case stays the first one: a
   component that is compact of its own accord must not be pulled to "regular"
   by a provider that says nothing. */
describe("Density", () => {
  afterEach(() => {
    delete document.documentElement.dataset.density;
  });

  it("writes data-density where a density is configured, and puts it back on teardown", () => {
    const { unmount } = render(
      <UmrissProvider density="compact">
        <span />
      </UmrissProvider>,
    );
    expect(document.documentElement.dataset.density).toBe("compact");
    unmount();
    expect(document.documentElement.dataset.density).toBeUndefined();
  });

  it("writes nothing where nothing is configured", () => {
    render(
      <UmrissProvider>
        <span />
      </UmrissProvider>,
    );
    expect(document.documentElement.dataset.density).toBeUndefined();
  });

  it("gives a component below it the configured density", () => {
    render(
      <UmrissProvider density="compact">
        <DensitySample fallback="regular" />
      </UmrissProvider>,
    );
    expect(read()).toBe("compact");
  });

  it("gives the component's own default without a provider", () => {
    render(<DensitySample fallback="regular" />);
    expect(read()).toBe("regular");
  });

  it("lets a density at the component beat the setting", () => {
    render(
      <UmrissProvider density="compact">
        <DensitySample own="regular" fallback="regular" />
      </UmrissProvider>,
    );
    expect(read()).toBe("regular");
  });

  it("leaves a component that is compact of its own accord compact under a provider that says nothing", () => {
    render(
      <UmrissProvider>
        <DensitySample fallback="compact" />
      </UmrissProvider>,
    );
    expect(read()).toBe("compact");
  });

  it("makes a compact component regular under comfortable", () => {
    render(
      <UmrissProvider density="comfortable">
        <DensitySample fallback="compact" />
      </UmrissProvider>,
    );
    expect(read()).toBe("regular");
  });
});
