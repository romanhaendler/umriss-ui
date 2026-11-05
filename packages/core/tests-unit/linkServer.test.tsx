// @vitest-environment node
/* Link and Breadcrumb rendered on a server: `renderToString` in the node
   environment, where `document` does not exist. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { Breadcrumb, Link } from "../src";

afterEach(() => vi.restoreAllMocks());

describe("Link and Breadcrumb on a server", () => {
  it("keep a relative href and print no warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(renderToString(<Link href="/about">About</Link>)).toContain('href="/about"');
    expect(renderToString(<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Here" }]} />)).toContain('href="/"');
    expect(warn).not.toHaveBeenCalled();
  });

  it("still refuse javascript: and data: targets, with one warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const href of ["javascript:alert(1)", "data:text/html,x"]) {
      expect(renderToString(<Link href={href}>Bad</Link>)).not.toContain("href=");
    }
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
