import {open,fillAll,F} from "./drive.mjs";
import {active} from "./probe.mjs";
for(const lib of ["tanstack?onSubmit","rhf","formik?glue"]){
const {b,p}=await open(lib);
await p.getByRole("button",{name:"Submit"}).click(); await p.waitForTimeout(700);
console.log(lib,"pristine: focus ->",await active(p));
await fillAll(p);
// clear plan: reload-less trick: use fresh page where all but plan are filled
await b.close();
}
// plan first-invalid
for(const lib of ["tanstack?onSubmit","rhf","formik?glue"]){
const {b,p}=await open(lib);
await F(p,"text").locator("input").fill("hello"); await F(p,"qty").locator("input:not([aria-hidden])").fill("5"); await F(p,"color").locator("select").selectOption("b");
const cb=F(p,"city").locator("input[role=combobox]"); await cb.click(); await cb.fill("Be"); await p.locator("[role=listbox] [role=option]").filter({hasText:"Beta"}).click();
await F(p,"tags").locator("button").first().click(); await p.getByRole("dialog").getByText("Alpha").first().click(); await p.keyboard.press("Escape");
await F(p,"agree").locator("input").check();
await p.getByRole("button",{name:"Submit"}).click(); await p.waitForTimeout(700);
console.log(lib,"first invalid is plan: focus ->",await active(p));
await b.close();}
