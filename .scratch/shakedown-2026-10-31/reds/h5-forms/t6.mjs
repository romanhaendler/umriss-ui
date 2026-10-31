import {chromium} from "playwright";
const b=await chromium.launch();
const pg=await (await b.newContext()).newPage();
await pg.goto("http://localhost:4330/");
console.log(await pg.evaluate(()=>{const d=document.querySelector("input[name=rg]").parentElement.querySelector("span");const c=getComputedStyle(d);return [d.className,c.borderRadius,getComputedStyle(document.documentElement).getPropertyValue("--u-radius-full"),getComputedStyle(document.documentElement).getPropertyValue("--u-radius-md")]}));
await b.close();
