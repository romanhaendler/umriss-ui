/* The demos and scenarios of the alarms mount without a deprecation warning: a core field
   that still gets its old `onChange(value)` names the new one in development (ADR-0081). */

import { describe, expect, it, vi } from "vitest";
import { act } from "react";
import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { DEMO } from "../demo/examples";

async function mountAndUnmount(Component: ComponentType): Promise<void> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => root.render(<Component />));
  await act(async () => root.unmount());
  host.remove();
}

describe("the field contract", () => {
  it("no demo or scenario of the alarms calls a core field's deprecated name", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    try {
      for (const example of DEMO.examples) await mountAndUnmount(example.Component);
      for (const scenario of DEMO.scenarios) await mountAndUnmount(scenario.Component);
      const deprecated = warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes("is deprecated"));
      expect(deprecated).toEqual([]);
    } finally {
      warn.mockRestore();
    }
  });
});
