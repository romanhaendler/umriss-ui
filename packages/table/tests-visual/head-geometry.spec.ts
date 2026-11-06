/* Every example of the demo, driven through the head's states (sorted up and
   down, a multi-sort with ranks, every resizable column at its least width);
   after each state every head is measured and every rule is applied to it. A
   rule is one entry of RULES: it gets a head's parts and returns what is off. */

import { test, type Locator } from "@playwright/test";
import { EXAMPLE_ADDRESSES } from "./pages";
import { openExample } from "./navigation";

test.beforeEach(({ colorScheme }, testInfo) => {
  testInfo.skip(colorScheme === "dark", "Layout only once (light)");
});

type Box = { left: number; right: number; top: number; bottom: number };
/** One head: its cell and the parts that stand in it (absent parts are null). */
type Head = {
  name: string;
  cell: Box;
  /** The cell inside its border and padding. */
  content: Box;
  /** The inner edges of every clipping ancestor in which the cell itself stands whole. */
  clips: { name: string; left: number; right: number }[];
  parts: { label: Box | null; rank: Box | null; arrow: Box | null; funnel: Box | null; sortButton: Box | null };
  /** Of a column head over a plain row: the ink of its label and of the column's values, left and right edge. */
  align: { right: boolean; labelInk: { left: number; right: number } | null; valueInk: { left: number; right: number } | null } | null;
};
/** A rule returns one line per miss: part and distance in px. */
type Rule = (head: Head) => string[];

const TOLERANCE = 0.5;

const RULES: Rule[] = [
  /* The sort button, its focus ring with it, ends within its cell's edges. */
  ({ cell, parts: { sortButton: b } }) => {
    if (!b) return [];
    const out: string[] = [];
    if (cell.left - b.left > TOLERANCE) out.push(`sort button reaches ${(cell.left - b.left).toFixed(1)}px past the cell's left edge`);
    if (b.right - cell.right > TOLERANCE) out.push(`sort button reaches ${(b.right - cell.right).toFixed(1)}px past the cell's right edge`);
    return out;
  },

  /* Every part stands inside the cell's content box, vertically inside the cell and inside every clipping ancestor. */
  ({ content, cell, clips, parts }) =>
    Object.entries(parts).flatMap(([k, b]) => {
      if (!b || k === "sortButton") return [];
      const out: string[] = [];
      if (content.left - b.left > TOLERANCE) out.push(`${k} reaches ${(content.left - b.left).toFixed(1)}px past the content box's left edge`);
      if (b.right - content.right > TOLERANCE) out.push(`${k} reaches ${(b.right - content.right).toFixed(1)}px past the content box's right edge`);
      if (cell.top - b.top > TOLERANCE || b.bottom - cell.bottom > TOLERANCE) out.push(`${k} leaves the cell vertically`);
      for (const c of clips) {
        if (c.left - b.left > TOLERANCE) out.push(`${k} is cut ${(c.left - b.left).toFixed(1)}px by ${c.name} on the left`);
        if (b.right - c.right > TOLERANCE) out.push(`${k} is cut ${(b.right - c.right).toFixed(1)}px by ${c.name} on the right`);
      }
      return out;
    }),

  /* No two parts overlap. */
  ({ parts: { label, rank, arrow, funnel } }) => {
    const list = Object.entries({ label, rank, arrow, funnel }).flatMap(([k, b]) => (b ? [[k, b] as const] : []));
    const out: string[] = [];
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const [ka, a] = list[i]!;
        const [kb, b] = list[j]!;
        const o = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        if (o > TOLERANCE) out.push(`${ka} and ${kb} overlap by ${o.toFixed(1)}px`);
      }
    return out;
  },

  /* A left-aligned head's label starts where its values start; a right-aligned head's last part ends where they end. */
  ({ parts, align }) => {
    if (!align?.labelInk || !align.valueInk) return [];
    if (!align.right) {
      const d = align.labelInk.left - align.valueInk.left;
      return Math.abs(d) > TOLERANCE ? [`label starts ${d.toFixed(1)}px off the values' left edge`] : [];
    }
    const end = Math.max(...[parts.label, parts.rank, parts.arrow, parts.funnel].flatMap((b) => (b ? [b.right] : [])));
    const d = end - align.valueInk.right;
    return Math.abs(d) > TOLERANCE ? [`last part ends ${d.toFixed(1)}px off the values' right edge`] : [];
  },
];

/** Every head of the example with the boxes of its parts. */
const measure = (root: Locator): Promise<Head[]> =>
  root.evaluate((el) => {
    const box = (e: Element | null) => {
      const r = e?.getBoundingClientRect();
      return r && r.width > 0 ? { left: r.left, right: r.right, top: r.top, bottom: r.bottom } : null;
    };
    return Array.from(el.querySelectorAll<HTMLTableCellElement>("thead th")).flatMap((th) => {
      const cell = box(th);
      if (!cell) return [];
      const label = th.querySelector('[class*="headLabel"]');
      const cs = getComputedStyle(th);
      const content = {
        left: cell.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft),
        right: cell.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight),
        top: cell.top,
        bottom: cell.bottom,
      };
      const clips: { name: string; left: number; right: number }[] = [];
      for (let a = th.parentElement; a && a !== document.body; a = a.parentElement) {
        const s = getComputedStyle(a);
        if (s.overflowX === "visible" && s.overflowY === "visible") continue;
        const ar = a.getBoundingClientRect();
        const left = ar.left + a.clientLeft;
        const right = left + a.clientWidth;
        if (cell.left < left - 0.5 || cell.right > right + 0.5) break;
        clips.push({ name: `${a.tagName}.${a.className}`, left, right });
      }
      /* The edges of what is drawn by an element's text, in this table only,
         skipping what is hidden for assistive technology or clipped to nothing. */
      const ink = (e: Element) => {
        const rs: { left: number; right: number }[] = [];
        const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) {
          const p = n.parentElement!;
          const pr = p.getBoundingClientRect();
          if (!n.textContent!.trim() || pr.width <= 1 || pr.height <= 1 || p.closest("table") !== e.closest("table") || p.closest('[aria-hidden="true"]')) continue;
          const rg = document.createRange();
          rg.selectNodeContents(n);
          for (const q of Array.from(rg.getClientRects())) if (q.width > 0) rs.push({ left: Math.max(q.left, pr.left), right: Math.min(q.right, pr.right) });
        }
        return rs.length ? { left: Math.min(...rs.map((q) => q.left)), right: Math.max(...rs.map((q) => q.right)) } : null;
      };
      let align: { right: boolean; labelInk: { left: number; right: number } | null; valueInk: { left: number; right: number } | null } | null = null;
      const headRow = th.parentElement as HTMLTableRowElement;
      if (label && th.scope === "col" && !headRow.hasAttribute("data-head-group")) {
        const rows = Array.from(th.closest("table")!.tBodies)
          .flatMap((b) => Array.from(b.rows))
          .filter((tr) => tr.cells.length === headRow.cells.length && !tr.className.includes("group"));
        /* Indents of row groups and tree rows and a badge's pill belong to the cell and only push text inwards:
           the column's own edge is the outermost one among the rows. */
        const tableHasLevels = !!th.closest("table")!.querySelector("tr[aria-level], [data-tree-depth], [aria-level]");
        const inks = rows.slice(0, 30).flatMap((tr) => {
          const c = tr.cells[th.cellIndex];
          /* A grouped or tree table indents its first column; a badge's pill, a meter, an icon and a filled chip are the cell's own too. */
          const own = c?.querySelector('[class*="badge"], [role="meter"], svg') || (c && Array.from(c.querySelectorAll("*")).some((n) => getComputedStyle(n).backgroundColor !== "rgba(0, 0, 0, 0)")) || tableHasLevels;
          const i = c?.textContent?.trim() && !own ? ink(c) : null;
          return i ? [i] : [];
        });
        align = {
          right: cs.textAlign === "right" || th.className.includes("numeric"),
          labelInk: ink(label),
          valueInk: inks.length ? { left: Math.min(...inks.map((i) => i.left)), right: Math.max(...inks.map((i) => i.right)) } : null,
        };
      }
      return [
        {
          name: (label?.textContent ?? th.textContent ?? "").trim() || "(blank)",
          cell,
          content,
          clips,
          align,
          parts: {
            label: box(label),
            rank: box(th.querySelector('[class*="sortRank"]')),
            arrow: box(th.querySelector('[class*="sortIndicator"] svg')),
            funnel: box(th.querySelector('[class*="filterButton"]')),
            sortButton: box(th.querySelector('[class*="sortButton"]')),
          },
        },
      ];
    });
  });

for (const { pageId, exampleId, name } of EXAMPLE_ADDRESSES) {
  test(name, async ({ page }) => {
    test.setTimeout(90_000); // every head in every state: a table of many heads takes its time
    const faults = new Set<string>();
    const ex = page.locator(`[data-example="${exampleId}"]`);
    /* A click that cannot land is a finding (a part covers the button), not something to swallow. */
    const click = async (loc: Locator, state: string, modifiers?: "Shift"[]) => {
      try {
        await loc.click({ timeout: 3000, modifiers });
      } catch (e) {
        faults.add(`${state} | click blocked: ${String(e).split("\n")[0]}`);
      }
    };
    const check = async (state: string) => {
      /* A turning arrow is wider than itself mid-turn: measure when the motion has ended. */
      await ex.evaluate(() =>
        Promise.race([
          Promise.all(document.getAnimations().map((a) => (a.effect?.getComputedTiming().iterations === Infinity ? 0 : a.finished.catch(() => {})))),
          new Promise((done) => setTimeout(done, 1000)),
        ]),
      );
      for (const head of await measure(ex)) for (const rule of RULES) for (const f of rule(head)) faults.add(`${state} | "${head.name}": ${f}`);
    };
    await openExample(page, pageId, exampleId);
    if ((await ex.locator("table thead").count()) === 0) return;

    await check("initial");
    const sorts = ex.locator('thead th[aria-sort] button[class*="sortButton"]');
    const n = await sorts.count();
    for (let i = 0; i < n; i++) {
      await click(sorts.nth(i), "sorted ascending");
      await check("sorted ascending");
      await click(sorts.nth(i), "sorted descending");
      await check("sorted descending");
    }
    for (let i = 0; i < n; i++) await click(sorts.nth(i), "multi-sort with ranks", ["Shift"]);
    await check("multi-sort with ranks");

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
    if (g) await check("all columns at their least width");

    if (faults.size) throw new Error(`${name}:\n${[...faults].join("\n")}`);
  });
}
