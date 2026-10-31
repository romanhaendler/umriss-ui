import { openRec, axOf } from "./lib.mjs";
const s = await openRec("read", { lang: "en" }); const p = s.page; const ax = axOf(p);
await p.getByRole("button", { name: "Columns" }).focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
console.log((await p.locator("[role=dialog]:visible").last().ariaSnapshot()).split("\n").slice(0, 40).join("\n"));
for (let i = 0; i < 14; i++) { await p.keyboard.press("Tab"); console.log("Tab", i + 1, await ax()); }
await s.close();
