import { openRec } from "./lib.mjs";
const s = await openRec("core", { lang: "de" }); const p = s.page;
console.log(await p.locator("main").ariaSnapshot());
console.log(s.errors.join("\n"));
await s.close();
