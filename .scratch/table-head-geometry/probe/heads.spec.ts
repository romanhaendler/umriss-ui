import { test, type Page, type Locator } from "@playwright/test";
import { appendFileSync } from "node:fs";
import { EXAMPLE_ADDRESSES } from "../../../packages/table/tests-visual/pages.ts";
import { openExample } from "../../../packages/table/tests-visual/navigation.ts";

const OUT = process.env.OUT!;

/* Every head part must stand inside its cell's content box, inside every clipping ancestor,
   and apart from its neighbours; the sort button (its ring is inset) inside the cell. */
async function faults(root: Locator, state: string): Promise<string[]> {
  return root.evaluate((rootEl, state) => {
    const out: string[] = [];
    const T = 0.5;
    for (const th of Array.from(rootEl.querySelectorAll<HTMLTableCellElement>("thead th"))) {
      const r = th.getBoundingClientRect();
      if (r.width === 0) continue;
      const cs = getComputedStyle(th);
      const box = {
        left: r.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft),
        right: r.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight),
        top: r.top, bottom: r.bottom,
      };
      const name = (th.querySelector('[class*="headLabel"]')?.textContent ?? th.textContent ?? "").trim() || "(blank)";
      const cls = Array.from(th.classList).map((c) => c.replace(/^_|_[a-z0-9]+_\d+$/g, "")).join(".");
      const parts: [string, Element | null][] = [
        ["label", th.querySelector('[class*="headLabel"]')],
        ["rank", th.querySelector('[class*="sortRank"]')],
        ["arrow", th.querySelector('[class*="sortIndicator"] svg')],
        ["filter", th.querySelector('button:not([class*="sortButton"])')],
      ];
      const boxes = parts.filter(([, el]) => el).map(([k, el]) => [k, el!.getBoundingClientRect()] as const).filter(([, b]) => b.width > 0);
      const at = `${state} | "${name}" [${cls}] w=${r.width.toFixed(1)}`;
      for (const [k, b] of boxes) {
        if (k === "label" && th.scope === "colgroup") continue;
        if (b.left < box.left - T || b.right > box.right + T) out.push(`${at}: ${k} ${b.left.toFixed(1)}–${b.right.toFixed(1)} leaves content box ${box.left.toFixed(1)}–${box.right.toFixed(1)}`);
        if (b.top < box.top - T || b.bottom > box.bottom + T) out.push(`${at}: ${k} leaves the cell vertically`);
        /* clipping ancestors, when the cell itself is fully visible in them */
        for (let a = th.parentElement; a && a !== document.body; a = a.parentElement) {
          const s = getComputedStyle(a);
          if (s.overflowX === "visible" && s.overflowY === "visible") continue;
          const ar = a.getBoundingClientRect();
          const inner = { left: ar.left + a.clientLeft, right: ar.left + a.clientLeft + a.clientWidth };
          if (r.left < inner.left - T || r.right > inner.right + T) break;
          if (b.left < inner.left - T || b.right > inner.right + T) out.push(`${at}: ${k} cut by ${a.tagName}.${a.className}`);
        }
      }
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const [ka, a] = boxes[i]!, [kb, b] = boxes[j]!;
          const ov = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          if (ov > T) out.push(`${at}: ${ka} and ${kb} overlap by ${ov.toFixed(1)}px`);
        }
      /* alignment: the label's ink against the values' ink in the first body row of plain cells */
      const headRow = th.parentElement as HTMLTableRowElement;
      const isColRow = !headRow.hasAttribute("data-head-group");
      const ink = (el: Element) => {
        const rs: DOMRect[] = [];
        const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) {
          const p = n.parentElement!; const pr = p.getBoundingClientRect();
          if (!n.textContent!.trim() || pr.width <= 1 || pr.height <= 1 || p.closest("table") !== el.closest("table")) continue;
          const rg = document.createRange(); rg.selectNodeContents(n);
          for (const q of Array.from(rg.getClientRects())) if (q.width > 0) rs.push(new DOMRect(Math.max(q.left, pr.left), q.top, Math.min(q.right, pr.right) - Math.max(q.left, pr.left), q.height));
        }
        for (const g of Array.from(el.querySelectorAll("svg, img, input"))) { const q = g.getBoundingClientRect(); if (q.width > 1 && g.closest("table") === el.closest("table")) rs.push(q); }
        return rs.length ? { left: Math.min(...rs.map((q) => q.left)), right: Math.max(...rs.map((q) => q.right)) } : null; };
      const labelEl = th.querySelector('[class*="headLabel"]') ?? (th.scope === "colgroup" ? th : null);
      const right = cs.textAlign === "right" || th.className.includes("numeric");
      if (isColRow && labelEl && th.scope === "col") {
        const body = Array.from(th.closest("table")!.tBodies).flatMap((b) => Array.from(b.rows)).filter((tr) => tr.cells.length === headRow.cells.length && !tr.className.includes("group")).slice(0, 3);
        const head = ink(labelEl);
        for (const tr of body) {
          const cell = tr.cells[th.cellIndex];
          const v = cell && cell.textContent!.trim() ? ink(cell) : null;
          if (!head || !v) continue;
          const d = right ? head.right - v.right : head.left - v.left;
          const end = Math.max(...boxes.filter(([k]) => k !== "arrow" || th.getAttribute("aria-sort") !== "none").map(([, b]) => b.right));
          if (right && Math.abs(end - v.right) > T) out.push(`${at}: ALIGN right edge of the head's last visible part vs value off by ${(end - v.right).toFixed(1)}px`);
          if (Math.abs(d) > T) out.push(`${at}: ALIGN ${right ? "right" : "left"} edge of label vs value "${cell!.textContent!.trim().slice(0, 20)}" off by ${d.toFixed(1)}px`);
          break;
        }
      }
      if (th.scope === "colgroup") {
        const head = ink(th);
        const mid = (r.left + r.right) / 2;
        if (head && Math.abs((head.left + head.right) / 2 - mid) > T) out.push(`${at}: ALIGN group label off centre by ${((head.left + head.right) / 2 - mid).toFixed(1)}px`);
      }
      const btn = th.querySelector('[class*="sortButton"]');
      if (btn) {
        const b = btn.getBoundingClientRect();
        if (b.left < r.left - T || b.right > r.right + T) out.push(`${at}: sort button (focus ring) ${b.left.toFixed(1)}–${b.right.toFixed(1)} leaves the cell ${r.left.toFixed(1)}–${r.right.toFixed(1)}`);
      }
    }
    return out;
  }, state);
}

for (const { pageId, exampleId, name } of EXAMPLE_ADDRESSES) {
  test(name, async ({ page }) => {
    const found = new Set<string>();
    const note = (list: string[]) => list.forEach((f) => found.add(f));
    await openExample(page, pageId, exampleId);
    const ex = page.locator(`[data-example="${exampleId}"]`);
    if ((await ex.locator("table thead").count()) === 0) return;
    note(await faults(ex, "initial"));
    const heads = ex.locator('thead th[aria-sort] button[class*="sortButton"]');
    const n = await heads.count();
    for (let i = 0; i < n; i++) {
      await heads.nth(i).click().catch(() => {});
      note(await faults(ex, "sorted asc"));
      await heads.nth(i).click().catch(() => {});
      note(await faults(ex, "sorted desc"));
    }
    for (let i = 0; i < n; i++) await heads.nth(i).click({ modifiers: ["Shift"] }).catch(() => {});
    note(await faults(ex, "multi-sort ranks"));
    /* every resizable column dragged to its least width */
    const grips = ex.locator('thead th [class*="grip"]');
    const g = await grips.count();
    for (let i = 0; i < g; i++) {
      const b = await grips.nth(i).boundingBox();
      if (!b) continue;
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down();
      await page.mouse.move(b.x - 600, b.y + b.height / 2, { steps: 4 });
      await page.mouse.up();
    }
    if (g) note(await faults(ex, "multi-sort ranks, all narrowed"));
    if (found.size) appendFileSync(OUT, `## ${name}\n${[...found].map((f) => `- ${f}`).join("\n")}\n`);
  });
}
