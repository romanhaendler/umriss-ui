import {open,F,logs} from "./drive.mjs";
import {state} from "./probe.mjs";
const {b,p}=await open("tanstack?onBlur");
for(const n of ["tags","date","range","when","city"]){
  const t=F(p,n).locator(n==="city"?"input[role=combobox]":"button").first();
  await t.click(); await p.waitForTimeout(250);
  const s=(await state(p))[n];
  const panelOpen=await p.locator("[role=dialog],[role=listbox]").count();
  console.log(n,"panel open:",panelOpen>0,"| error shown while open:",s.msg,"| aria-invalid:",s.inv);
  await p.keyboard.press("Escape"); await p.waitForTimeout(200);
  await p.mouse.click(5,5); await p.waitForTimeout(100);
}
await p.screenshot({path:"shots/tanstack-onBlur-open.png",fullPage:true});
await b.close();
