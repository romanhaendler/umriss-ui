import {chromium} from "playwright";
const b=await chromium.launch();
const pg=await (await b.newContext({locale:"en",viewport:{width:600,height:700}})).newPage();
await pg.goto("http://localhost:4330/unc.html"); await pg.waitForSelector("#sub"); await pg.waitForTimeout(500);
const sl=pg.locator("input[name=sl]");
const info=()=>pg.evaluate(()=>{const i=document.querySelector("input[name=sl]");return [i.value,i.defaultValue,i.getAttribute("value"),document.querySelector("input[name=sl]").parentElement.textContent]});
console.log("init",await info());
await sl.focus(); await pg.keyboard.press("End"); console.log("after End",await info());
await pg.screenshot({path:"shots/slider-before-reset.png",clip:{x:0,y:60,width:600,height:80}});
await pg.click("#rst"); await pg.waitForTimeout(200); console.log("after reset",await info());
await pg.screenshot({path:"shots/slider-after-reset.png",clip:{x:0,y:60,width:600,height:80}});
// hours paste in datetime
await pg.goto("http://localhost:4330/?lang=en"); await pg.waitForSelector("button[name=dt]");
await pg.locator("button[name=dt]").click(); await pg.waitForTimeout(200);
const ins=pg.locator("[role=dialog] input");
await ins.nth(0).click(); await pg.keyboard.press("Meta+A"); await pg.keyboard.insertText("14"); console.log("paste 14 in hours ->",await ins.nth(0).inputValue());
await pg.keyboard.press("Meta+A"); await pg.keyboard.insertText("14:30"); console.log("paste 14:30 in hours ->",await ins.nth(0).inputValue(),await ins.nth(1).inputValue());
await b.close();
