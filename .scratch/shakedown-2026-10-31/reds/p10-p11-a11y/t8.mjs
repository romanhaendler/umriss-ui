import { openRec } from "./lib.mjs";
const s = await openRec("read", { lang: "de" });
const names = await s.page.evaluate(() => [...document.querySelectorAll('[aria-label],[title],[aria-description]')].map(e => (e.getAttribute("aria-label")||"")+(e.title?" |title:"+e.title:"")));
console.log([...new Set(names)].join("\n"));
console.log(await s.page.locator("main").ariaSnapshot());
await s.close();
