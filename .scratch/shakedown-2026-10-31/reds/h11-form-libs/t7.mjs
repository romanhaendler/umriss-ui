import {open,F,logs,pickers} from "./drive.mjs";
import {state,active} from "./probe.mjs";
const {b,p,errs}=await open("tanstack?onChange");
const t=F(p,"text").locator("input");
await t.fill("taken"); await p.waitForTimeout(500); await t.blur();
console.log("async+blur:",(await state(p)).text);
await t.fill("blur"); await t.blur(); await p.waitForTimeout(300);
console.log("onBlur field validator:",(await state(p)).text);
await t.fill("okay"); await p.waitForTimeout(400);
console.log("cleared:",(await state(p)).text);
// qty clear -> null
const q=F(p,"qty").locator("input"); await q.fill("7"); await q.fill(""); await q.blur();
console.log("qty cleared:",(await state(p)).qty);
// combobox clear
const cb=F(p,"city").locator("input[role=combobox]"); await cb.click(); await cb.fill("Al"); await p.locator("[role=listbox] [role=option]").first().click(); await p.waitForTimeout(100);
console.log("city set",await cb.inputValue()); await cb.fill(""); await p.waitForTimeout(100); await p.keyboard.press("Tab");
console.log("city cleared:",(await state(p)).city, "val", await cb.inputValue());
// array
await p.getByRole("button",{name:"add email"}).click(); await p.waitForTimeout(100);
await p.locator("[data-field=emails] input").nth(1).fill("x"); await p.locator("[data-field=emails] input").nth(1).blur(); await p.waitForTimeout(100);
console.log("array err:",await p.locator("[data-field=emails]").innerText());
console.log(errs);
await b.close();
