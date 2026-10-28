/* Every page runs under Trusted Types, and no HTML sink may fire.

   The document is served with `require-trusted-types-for 'script'; trusted-types
   umriss-demo`, by answering the document request itself with that header added
   - the demos' Vite configs and the dev server stay as they are. Under it a
   write to `innerHTML` (and the other HTML sinks) is refused unless it comes
   from the policy `umriss-demo`, which only the shell creates (`trustedHtml`).
   So an HTML sink in library code is a violation here, and the page that opens
   it fails: on any `securitypolicyviolation` event, or any console error that
   names Trusted Types. The message names the page, the directive and the sample.
   Like the silent-page check it stands once and runs against every demo. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export const TRUSTED_TYPES_CSP = "require-trusted-types-for 'script'; trusted-types umriss-demo";

export interface TrustedTypesProbes {
  /** How the demo opens a page (its `navigation.ts`). */
  open: (page: Page, pageId: string) => Promise<void>;
  /** The pages to check - every page of the demo. */
  pages: readonly string[];
}

export function checkTrustedTypes(p: TrustedTypesProbes): void {
  test.describe("every page runs under Trusted Types", () => {
    test.skip(({ browserName }) => browserName !== "chromium", "Trusted Types are enforced by Chromium");
    test.skip(({ colorScheme }) => colorScheme === "dark", "the page's structure, once (light)");

    for (const pageId of p.pages) {
      test(`${pageId}: no HTML sink is touched`, { tag: "@quick" }, async ({ page }) => {
        const faults: string[] = [];
        await page.route(
          (url) => url.pathname === "/" || !/\.\w+$/.test(url.pathname),
          async (route) => {
            if (route.request().resourceType() !== "document") return route.fallback();
            const response = await route.fetch();
            await route.fulfill({ response, headers: { ...response.headers(), "content-security-policy": TRUSTED_TYPES_CSP } });
          },
        );
        /* A sink that throws takes the page down, so the page never stands and
           opening it would run into the timeout: the first violation ends the
           wait, and it is the fault reported, not the timeout it caused. */
        let violated!: () => void;
        const firstViolation = new Promise<void>((resolve) => (violated = resolve));
        await page.exposeFunction("__umrissViolation", (text: string) => {
          faults.push(`violation: ${text}`);
          violated();
        });
        await page.addInitScript(() => {
          document.addEventListener("securitypolicyviolation", (e) =>
            (window as unknown as { __umrissViolation: (text: string) => void }).__umrissViolation(
              `${e.violatedDirective}: ${e.sample || e.blockedURI}`,
            ),
          );
        });
        page.on("console", (message) => {
          if (message.type() === "error" && /trusted ?(types?|html|script)/i.test(message.text())) {
            faults.push(`console: ${message.text()}`);
            violated();
          }
        });
        await Promise.race([p.open(page, pageId), firstViolation]);
        expect(faults.map((fault) => `${pageId}: ${fault}`)).toEqual([]);
      });
    }
  });
}
