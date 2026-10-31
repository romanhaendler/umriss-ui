import {chromium} from "playwright";
const b=await chromium.launch();
const pg=await (await b.newContext({locale:"en",viewport:{width:900,height:1800}})).newPage();
await pg.goto("http://localhost:4330/?lang=en");
await pg.screenshot({path:"shots/form-en.png",fullPage:true});
const btn=pg.getByRole("button").filter({hasText:"Jan"});
console.log(await pg.evaluate(()=>[...document.querySelectorAll("form button, form input")].map(e=>e.tagName+"|"+(e.name||"")+"|"+e.type+"|"+(e.getAttribute("aria-label")||"")+"|"+(e.textContent||e.value).slice(0,30)).join("\n")));
await b.close();
