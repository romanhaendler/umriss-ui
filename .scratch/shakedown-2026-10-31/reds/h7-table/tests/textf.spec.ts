import { test, expect, go } from "./fx";
const cnt = (p: any) => p.evaluate(() => { const t = (window as any).__t; return t.filtered.length; });
const setF = (p: any, col: string, c: any) => p.evaluate(([col, c]: any) => (window as any).__t.setFilter(col, c), [col, c]);
const names = (p: any) => p.evaluate(() => (window as any).__t.filtered.map((r: any) => r.id).join(","));

test("text filter operators on null, empty, unicode", async ({ page, logs }) => {
  await go(page, "textf");
  console.log("total", await cnt(page));
  const cases: [string, any][] = [
    ["note", { terms: [{ operator: "isEmpty" }] }],
    ["note", { terms: [{ operator: "notContains", value: "n1" }] }],
    ["note", { terms: [{ operator: "equals", value: "" }] }],
    ["note", { terms: [{ operator: "equals", value: "N1" }] }],
    ["note", { terms: [{ operator: "startsWith", value: "ü" }] }],
    ["name", { terms: [{ operator: "contains", value: "istanbul" }] }],
    ["name", { terms: [{ operator: "contains", value: "ISTANBUL" }] }],
    ["name", { terms: [{ operator: "contains", value: "ss" }] }],
    ["name", { terms: [{ operator: "contains", value: "ß" }] }],
    ["name", { terms: [{ operator: "equals", value: "äöü ß i̇stanbul" }] }],
    ["name", { terms: [{ operator: "isEmpty" }] }],
    ["name", { terms: [{ operator: "contains", value: "item 1" }, { operator: "endsWith", value: "5" }], join: "or" }],
    ["name", { terms: [{ operator: "contains", value: "item 1" }, { operator: "endsWith", value: "5" }], join: "and" }],
    ["name", { terms: [{ operator: "contains", value: "  " }] }],
    ["name", { terms: [{ operator: "contains", value: "(" }] }],
    ["name", { terms: [{ operator: "contains", value: ".*" }] }],
    // wrong types on a text column
    ["amount", { terms: [{ operator: "contains", value: "5" }] }],
    ["when", { terms: [{ operator: "contains", value: "2026" }] }],
    ["note", { terms: [] }],
    ["note", { terms: [{ operator: "contains" }] }],
  ];
  for (const [col, c] of cases) {
    await setF(page, col, null);
    await setF(page, col, c);
    await page.waitForTimeout(30);
    console.log(col, JSON.stringify(c.terms.map((t: any) => t.operator + ":" + (t.value ?? ""))), c.join ?? "", "=>", await cnt(page), (await names(page)).slice(0, 80));
    await setF(page, col, null);
  }
  console.log("logs", logs);
});
