import {chromium} from "playwright";
import fs from "fs";
const full=fs.readFileSync("src/edge.full","utf8");
const lines=full.split("\n");
const items=lines.map((l,i)=>[l,i]).filter(([l])=>/^    <(NumberInput|Combobox|MultiSelect|RadioGroup|SegmentedControl|Slider|DatePicker|Input) /.test(l));
const b=await chromium.launch();
for (const [l,i] of items) {
  const src=lines.filter((x,j)=>!items.some(([_,k])=>k===j)||j===i).join("\n");
  fs.writeFileSync("src/edge.tsx",src);
  const pg=await (await b.newContext()).newPage(); const errs=[]; pg.on("pageerror",e=>errs.push(e.message.slice(0,100)));
  const w=async()=>{await pg.goto("http://localhost:4330/edge.html"); await pg.waitForTimeout(1200)};
  await w(); errs.length=0; await pg.reload(); await pg.waitForTimeout(900);
  console.log(l.trim().slice(0,70),"=>",errs[0]||"ok"); await pg.close();
}
fs.writeFileSync("src/edge.tsx",full); await b.close();
