import {open} from "./lib.mjs";
const {browser,page}=await open("tbl");
console.log(await page.evaluate(()=>[...document.querySelectorAll("tbody tr:first-child button, tbody tr:first-child [role=button]")].map(b=>b.outerHTML.slice(0,200))));
await browser.close();
