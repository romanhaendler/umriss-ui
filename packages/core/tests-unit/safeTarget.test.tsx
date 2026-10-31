/* Link targets: `Link` and `Breadcrumb` write an `href` only for a safe scheme. */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumb, Link } from "../src";
import { isSafeTarget } from "../src/lib/safeTarget";

describe("isSafeTarget", () => {
  it.each(["https://a.test/x", "http://a.test", "mailto:a@b.test", "tel:+4930", "/path", "../up", "#frag", "page.html"])("lets %s through", (href) => {
    expect(isSafeTarget(href)).toBe(true);
  });
  it.each(["javascript:alert(1)", "JaVaScRiPt:alert(1)", " javascript:alert(1)", "java\tscript:alert(1)", "vbscript:x", "data:text/html,<b>x</b>"])("refuses %s", (href) => {
    expect(isSafeTarget(href)).toBe(false);
  });
});

describe("Link", () => {
  it("keeps a safe href", () => {
    render(<Link href="https://a.test/">ok</Link>);
    expect(screen.getByText("ok").getAttribute("href")).toBe("https://a.test/");
  });
  it("drops an unsafe href and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <>
        <Link href="javascript:alert(1)">bad</Link>
        <Link href="data:text/html,x">worse</Link>
      </>,
    );
    expect(screen.getByText("bad").hasAttribute("href")).toBe(false);
    expect(screen.getByText("worse").hasAttribute("href")).toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

describe("Breadcrumb", () => {
  it("drops an unsafe href", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Evil", href: "javascript:alert(1)" }, { label: "Here" }]} />);
    /* A hidden copy of the trail measures the widths, so a label appears twice. */
    for (const one of screen.getAllByText("Evil")) expect(one.closest("a")?.hasAttribute("href") ?? false).toBe(false);
    expect(screen.getAllByText("Home").some((one) => one.closest("a")?.getAttribute("href") === "/")).toBe(true);
  });
});
