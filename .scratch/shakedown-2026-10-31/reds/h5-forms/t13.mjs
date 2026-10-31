import {chromium} from "playwright";
const b=await chromium.launch();
const pg=await (await b.newContext({locale:"en",viewport:{width:900,height:1400}})).newPage();
const errs=[]; pg.on("console",m=>{if(["error","warning"].includes(m.type()))errs.push(m.text())}); pg.on("pageerror",e=>errs.push("PE "+e.message));
await pg.goto("http://localhost:4330/?lang=en");
const many=pg.locator("button[name=many]");
let t=Date.now(); await many.click(); await pg.waitForSelector("[role=listbox], [role=dialog]"); console.log("open ms",Date.now()-t);
console.log(await pg.evaluate(()=>[...document.querySelectorAll("[role=dialog] button,[role=dialog] input,[role=listbox]")].slice(0,8).map(e=>e.tagName+"|"+e.textContent.slice(0,25)+"|"+(e.placeholder||"")).join("\n")), "options in DOM:", await pg.locator("[role=option]").count());
await pg.screenshot({path:"shots/many-open.png"});
const search=pg.locator("[role=dialog] input[type=text], [role=dialog] input[type=search], [role=dialog] input").first();
t=Date.now(); await search.fill("Option 99"); await pg.waitForTimeout(300); console.log("filter ms",Date.now()-t,"options",await pg.locator("[role=option]").count());
const all=pg.getByRole("button",{name:/select all/i}); console.log("select-all buttons",await all.count(), await pg.evaluate(()=>[...document.querySelectorAll("[role=dialog] button")].map(x=>x.textContent).join("|")));
await pg.evaluate(()=>window.log.length=0);
if (await all.count()) { await all.first().click(); await pg.waitForTimeout(500);
 console.log("after select-all while filtered, many count:",await pg.evaluate(()=>JSON.stringify(window.log.filter(x=>x[0]=="many"))), "expected 111 (Option 99, 990-999, 9900-9999)"); }
const none=pg.getByRole("button",{name:/select none/i}); 
console.log("errs",errs); await b.close();
