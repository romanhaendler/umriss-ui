import { chromium, webkit } from "playwright";
import AxeBuilder from "@axe-core/playwright";
export const BASE = "http://localhost:4360/";
export async function open(hash, { lang = "en", theme = "light", browser = "chromium", w = 1200, h = 800 } = {}) {
  const b = await (browser === "webkit" ? webkit : chromium).launch();
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) errors.push(m.type() + ": " + m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  await page.goto(`${BASE}?lang=${lang}&theme=${theme}#${hash}`);
  await page.waitForSelector("main h1");
  await page.waitForTimeout(400);
  return { b, page, errors, close: () => b.close() };
}
export const focused = (page) => page.evaluate(() => {
  const a = document.activeElement; if (!a) return "none";
  const r = a.getAttribute("role") || a.tagName.toLowerCase();
  return `${r}|${(a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 40)}|${a.id ? "#" + a.id : ""}|r${a.closest("[aria-rowindex]")?.getAttribute("aria-rowindex") ?? "-"}c${a.getAttribute("aria-colindex") ?? a.closest("[aria-colindex]")?.getAttribute("aria-colindex") ?? "-"}`;
});
export async function axe(page) {
  const r = await new AxeBuilder({ page }).analyze();
  return r.violations.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes[0].target.join(" ")} :: ${v.nodes[0].failureSummary?.split("\n")[1] ?? ""}`);
}
export const REC = `(() => {
  window.__live = [];
  const sel = '[aria-live],[role=status],[role=alert],[role=log]';
  const rec = (n, why) => { const el = n.nodeType === 1 ? n : n.parentElement; const live = el && el.closest(sel); if (!live) return; if (live.id === "log") return; window.__live.push((live.getAttribute("role") || "live:" + live.getAttribute("aria-live")) + ": " + live.textContent.trim()); };
  new MutationObserver((ms) => { for (const m of ms) { rec(m.target); m.addedNodes.forEach((n) => rec(n)); } }).observe(document, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-live","role"] });
})();`;
export async function openRec(hash, o = {}) {
  const b = await (o.browser === "webkit" ? webkit : chromium).launch();
  const ctx = await b.newContext({ viewport: { width: o.w || 1200, height: o.h || 800 } });
  await ctx.addInitScript(REC);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) errors.push(m.type() + ": " + m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  await page.goto(`${BASE}?lang=${o.lang || "en"}&theme=${o.theme || "light"}${o.q || ""}#${hash}`);
  await page.waitForSelector("main h1"); await page.waitForTimeout(400);
  return { b, page, errors, close: () => b.close(), live: async (clear = true) => { const l = await page.evaluate(() => window.__live.splice(0)); return [...new Set(l)]; } };
}
export function axOf(page) {
  let cdp;
  return async () => {
    cdp ||= await page.context().newCDPSession(page);
    const { result } = await cdp.send("Runtime.evaluate", { expression: "document.activeElement" });
    const { nodes } = await cdp.send("Accessibility.getPartialAXTree", { objectId: result.objectId, fetchRelatives: false });
    const f = nodes[0];
    const props = (f.properties || []).filter((q) => !["focusable", "focused", "editable", "settable", "multiline", "readonly", "labelledby"].includes(q.name) && !(q.name === "required" && q.value.value === false) && !(q.name === "invalid" && q.value.value === "false")).map((q) => q.name + "=" + JSON.stringify(q.value.value));
    return `${f.role?.value}|${f.name?.value}|v=${f.value?.value ?? ""}|d=${f.description?.value ?? ""}|${props.join(",")}`;
  };
}
