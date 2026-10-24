// @vitest-environment node
/* The toast provider rendered on a server: `renderToString` in the node
   environment, where `HTMLDialogElement` and `document` do not exist. */

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { ToastProvider } from "../src";

describe("ToastProvider on a server", () => {
  it("renders its children to a string", () => {
    const html = renderToString(
      <ToastProvider>
        <p>Content</p>
      </ToastProvider>,
    );
    expect(html).toContain("Content");
  });
});
