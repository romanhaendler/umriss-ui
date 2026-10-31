import {open,fillAll,F,logs} from "./drive.mjs";
import {state,active} from "./probe.mjs";
const lib=process.argv[2]; const {b,p,errs}=await open(lib);
// blur each field by focus + tab away, read touched
for(const n of ["text","notes","qty","color","city","tags","agree","plan","notify","volume","view","date","range","when","files"]){
  const el=F(p,n).locator("input:not([type=radio]),textarea,select,button,[type=radio]").first();
  if(n==="city"){await el.click();} else if(["date","range","when","tags"].includes(n)){await el.focus();} else await el.focus();
  await p.keyboard.press("Tab"); await p.waitForTimeout(80);
}
console.log("touched after tabbing through each:",await p.locator("#touched").textContent());
console.log("blur log:",JSON.stringify(await logs(p)).slice(0,600));
console.log(errs.slice(0,3));
await b.close();
