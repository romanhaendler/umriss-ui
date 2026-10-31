import { test, expect } from "./fx";
const INSTRUMENT = () => {
  const w = window as any; w.__L = { ev: new Map<string, number>(), ro: 0, mo: 0, io: 0, intervals: new Set(), timeouts: new Set(), raf: new Set() };
  const wrap = (t: any, name: string) => { const a = t.addEventListener, r = t.removeEventListener; const keyOf = (type: string, fn: any, o: any) => `${name}:${type}:${typeof o === "object" ? !!o?.capture : !!o}`;
    const reg = new WeakMap<object, Set<string>>();
    t.addEventListener = function (type: string, fn: any, o: any) { if (fn) { const k = keyOf(type, fn, o); w.__L.ev.set(k, (w.__L.ev.get(k) ?? 0) + 1); } return a.call(this, type, fn, o); };
    t.removeEventListener = function (type: string, fn: any, o: any) { if (fn) { const k = keyOf(type, fn, o); w.__L.ev.set(k, (w.__L.ev.get(k) ?? 0) - 1); } return r.call(this, type, fn, o); }; };
  wrap(window, "window"); wrap(document, "document");
  const RO = window.ResizeObserver; window.ResizeObserver = class extends RO { constructor(cb: any) { super(cb); w.__L.ro++; } disconnect() { w.__L.ro--; super.disconnect(); } } as any;
  const MO = window.MutationObserver; window.MutationObserver = class extends MO { constructor(cb: any) { super(cb); w.__L.mo++; } disconnect() { w.__L.mo--; super.disconnect(); } } as any;
  const si = window.setInterval, ci = window.clearInterval; (window as any).setInterval = (f: any, t: any, ...a: any[]) => { const id = si(f, t, ...a); w.__L.intervals.add(id); return id; }; (window as any).clearInterval = (id: any) => { w.__L.intervals.delete(id); ci(id); };
};
const snap = (p: any) => p.evaluate(() => { const L = (window as any).__L; const ev: any = {}; L.ev.forEach((v: number, k: string) => { if (v !== 0) ev[k] = v; }); return { ev, ro: L.ro, mo: L.mo, intervals: L.intervals.size, nodes: document.querySelectorAll("*").length, bodyKids: document.body.children.length, styles: document.querySelectorAll("style, link[rel=stylesheet]").length, cls: document.documentElement.className, attrs: document.documentElement.getAttributeNames().join(), bodyStyle: document.body.getAttribute("style") }; });
for (const inner of ["live", "server", "pager", "groups", "textf"]) {
  test("leaks after unmount: " + inner, async ({ page, logs }) => {
    await page.addInitScript(INSTRUMENT);
    await page.goto("/?s=toggle&inner=" + inner); await page.waitForSelector("table");
    await page.evaluate(() => (window as any).__toggle(false)); await page.waitForTimeout(300);
    const base = await snap(page);
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => (window as any).__toggle(true)); await page.waitForSelector("table"); await page.waitForTimeout(250);
      // interact: open filter popover + search + sort + column menu
      const fb = page.getByRole("button", { name: /^Filter / }).first(); if (await fb.count()) { await fb.click(); await page.waitForTimeout(150); }
      const cm = page.getByRole("button", { name: "Columns" }); if (await cm.count()) { await cm.click(); await page.waitForTimeout(150); }
      await page.evaluate(() => (window as any).__toggle(false)); await page.waitForTimeout(300);
    }
    const end = await snap(page);
    console.log(inner, "base", JSON.stringify(base), "\n       end ", JSON.stringify(end));
    expect(end.ro - base.ro, "ResizeObserver left").toBe(0); expect(end.intervals - base.intervals).toBe(0);
    expect(JSON.stringify(end.ev), "listeners left").toBe(JSON.stringify(base.ev));
    expect(end.nodes - base.nodes, "nodes left").toBe(0);
    expect(logs).toEqual([]);
  });
}
