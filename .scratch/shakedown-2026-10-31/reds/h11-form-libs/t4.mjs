import {open,fillAll,F} from "./drive.mjs";
import {active} from "./probe.mjs";
const {b,p}=await open("tanstack?onSubmit");
await fillAll(p);
await p.getByRole("button",{name:"Submit"}).click(); await p.waitForTimeout(100);
console.log(await p.evaluate(()=>[...document.querySelectorAll("[data-field] :is(input,select,textarea,button)")].filter(e=>!e.disabled).map(e=>e.closest("[data-field]").dataset.field+" "+e.tagName+" "+(e.getAttribute("aria-label")||e.type))));
console.log("checkbox html:",await F(p,"agree").evaluate(e=>e.innerHTML.slice(0,600)));
await p.waitForTimeout(800);
// focus on first invalid after delay in invalid case
await b.close();
