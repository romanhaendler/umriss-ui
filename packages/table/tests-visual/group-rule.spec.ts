/* The rule at a ColumnGroup boundary stands at one device column from top to
   bottom - group head, head, body and foot draw the same pixels - at every
   zoom, and is drawn at all. A screenshot is decoded at each boundary's cells.
   The examples are the ones whose source holds a `<ColumnGroup`, so a new one
   is picked up; each is also run with a column pinned, so a group is split. */

import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { openExample } from "./navigation";

test.beforeEach(({ colorScheme }, testInfo) => {
  testInfo.skip(colorScheme === "dark", "Layout only once (light)");
});

const ROOT = fileURLToPath(new URL("../demo/examples/", import.meta.url));
const EXAMPLES: [string, string][] = readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) =>
    readdirSync(ROOT + d.name)
      .filter((f) => f.endsWith(".tsx") && readFileSync(ROOT + d.name + "/" + f, "utf8").includes("<ColumnGroup"))
      .map((f): [string, string] => [d.name.toLowerCase(), f.replace(/^\d+-/, "").replace(/\.tsx$/, "")]),
  );

for (const dpr of [0.9, 1, 1.1, 1.25, 1.5, 2])
  for (const width of [1280, 1111])
    for (const [pg, id] of EXAMPLES)
      for (const pinned of [false, true])
        test(`group rule: ${id} at ${dpr}, ${width} px${pinned ? ", split by pinning" : ""}`, async ({ browser }) => {
          test.setTimeout(120_000);
          const ctx = await browser.newContext({ deviceScaleFactor: dpr, viewport: { width, height: 900 } });
          const page = await ctx.newPage();
          await openExample(page, pg, id);
          const ex = page.locator(`[data-example="${id}"]`);
          if (pinned) {
            /* the column menu pins a column of the group */
            const columns = ex.getByRole("button", { name: "Columns" }).first();
            test.skip((await columns.count()) === 0, "no column menu");
            await columns.click();
            await page.getByRole("button", { name: /^Pin .* to start$/ }).first().click();
            await page.keyboard.press("Escape");
          }
          const table = ex.locator("table").first();
          await table.scrollIntoViewIfNeeded();
          await page.mouse.move(0, 0);
          const edges = await table.evaluate((t) =>
            Array.from(t.querySelectorAll<HTMLElement>('[class*="groupEdge"]'))
              .map((c) => {
                const r = c.getBoundingClientRect();
                const tr = c.closest("tr")!;
                const row = c.closest("thead")
                  ? tr.querySelector('[class*="headGroup"]') ? "group head" : "head"
                  : c.closest("tfoot") ? "foot" : "body";
                /* a cell scrolled out of its frame is not on screen */
                const seen = c.contains(document.elementFromPoint(r.left + 2, r.top + r.height / 2));
                /* read the rule in the cell's top padding, where no text stands beside it */
                return { x: r.left, y: r.top + 2, row, seen };
              })
              .filter((e) => e.seen && e.y > 0 && e.y < innerHeight && e.x > 8 && e.x < innerWidth - 8),
          );
          expect(edges.length).toBeGreaterThan(0);
          const png = (await page.screenshot()).toString("base64");
          const found = await page.evaluate(
            async ({ png, edges, dpr }) => {
              const img = new Image();
              img.src = "data:image/png;base64," + png;
              await img.decode();
              const cv = document.createElement("canvas");
              cv.width = img.width;
              cv.height = img.height;
              const g = cv.getContext("2d")!;
              g.drawImage(img, 0, 0);
              return edges.map((e) => {
                const y = Math.round(e.y * dpr);
                const from = Math.round(e.x * dpr) - 6;
                const d = g.getImageData(from, y, 13, 1).data;
                const lum = Array.from({ length: 13 }, (_, i) => 0.3 * d[i * 4]! + 0.59 * d[i * 4 + 1]! + 0.11 * d[i * 4 + 2]!);
                const dark = lum.map((l) => Math.max(0, Math.max(lum[0]!, lum[12]!) - l));
                /* the line and its anti-aliased edges: the darkest pixel and its neighbours (a pinned
                   edge's shadow may lie a few pixels further) */
                const peak = Math.max(...dark);
                const at = dark.indexOf(peak);
                const near = dark.map((v, i) => (Math.abs(i - at) <= 1 ? v : 0));
                const ink = near.reduce((n, v) => n + v, 0);
                return {
                  ...e,
                  peak,
                  centre: from + near.reduce((n, v, i) => n + v * i, 0) / ink,
                  profile: dark.map(Math.round).join(","),
                };
              });
            },
            { png, edges, dpr },
          );
          await ctx.close();
          const label = (e: (typeof found)[number]) => `${id} at ${dpr}: ${e.row} at x=${e.x.toFixed(2)} [${e.profile}]`;
          const seen = new Map<string, (typeof found)[number]>();
          for (const e of found) {
            expect(e.peak, `${label(e)}: the rule is drawn`).toBeGreaterThan(6);
            /* one boundary, one place in every row: head, body and foot draw it at the same device column */
            const first = seen.get(e.x.toFixed(1)) ?? e;
            expect(Math.abs(e.centre - first.centre), `${label(e)} stands off the ${first.row} row's rule (${first.profile})`).toBeLessThan(0.3);
            seen.set(e.x.toFixed(1), first);
          }
        });
