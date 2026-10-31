import {chromium} from "playwright";
const b=await chromium.launch();
const pg=await (await b.newContext({locale:"de"})).newPage();
const errs=[]; pg.on("console",m=>{if(["error","warning"].includes(m.type()))errs.push(m.text())}); pg.on("pageerror",e=>errs.push("PE "+e.message));
await pg.goto("http://localhost:4330/?lang=de");
const sub=async()=>{await pg.click("button[type=submit]");return await pg.locator("#out").innerText()};
console.log("de FD",await sub());
const num=pg.locator("input[name=num]");
await num.fill(""); await num.click(); await pg.keyboard.type("12"); await pg.evaluate(()=>document.getElementById("parent").click());
console.log("state",await pg.locator("#state").innerText(),"field",await num.inputValue());
await pg.keyboard.press("Tab"); console.log("after blur",await num.inputValue(), "other", await pg.locator("#numfree").inputValue());
// real key typing -5 with min 0
await num.fill(""); await num.click(); await pg.keyboard.type("-5"); console.log("typed -5 min0:",await num.inputValue());
// reset
await pg.fill("input[name=input]","changed"); await pg.fill("textarea","zz");
await pg.selectOption("select[name=sel]","c"); await pg.evaluate(()=>document.querySelector("input[name=chk]").click());
await pg.evaluate(()=>document.getElementById("parent").click());
await pg.click("#reset"); await pg.waitForTimeout(200);
console.log("after reset FD",await sub()); console.log("state",await pg.locator("#state").innerText());
console.log("errs",errs);
await b.close();
