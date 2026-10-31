import { openRec, axOf } from "./lib.mjs";
const [hash, sel, keysJson, lang] = [process.argv[2], process.argv[3], process.argv[4], process.argv[5] || "en"];
const s = await openRec(hash, { lang }); const p = s.page; const ax = axOf(p);
const where = () => p.evaluate(() => { const a = document.activeElement; return a === document.body ? "BODY" : a.tagName.toLowerCase() + (a.closest("[role=menu],[role=dialog],[role=listbox]") ? " in:" + a.closest("[role=menu],[role=dialog],[role=listbox]").getAttribute("role") : ""); });
await p.locator(sel).first().focus();
console.log("focus".padEnd(16), await ax());
for (const k of JSON.parse(keysJson)) { if (k.startsWith("T:")) await p.keyboard.type(k.slice(2)); else await p.keyboard.press(k); await p.waitForTimeout(200); console.log(k.padEnd(16), (await where()).padEnd(18), await ax(), JSON.stringify(await s.live())); }
console.log(s.errors.join("\n")); await s.close();
