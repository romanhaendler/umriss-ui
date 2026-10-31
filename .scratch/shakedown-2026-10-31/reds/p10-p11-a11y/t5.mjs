import { open } from "./lib.mjs";
const s = await open(process.argv[2] || "grid", { lang: process.argv[3] || "en" });
const p = s.page;
const cdp = await p.context().newCDPSession(p);
const axf = async () => { const { result } = await cdp.send("Runtime.evaluate", { expression: "document.activeElement" }); const { nodes } = await cdp.send("Accessibility.getPartialAXTree", { objectId: result.objectId, fetchRelatives: false }); const f = nodes[0]; return JSON.stringify({ role: f.role?.value, name: f.name?.value, value: f.value?.value, desc: f.description?.value, props: (f.properties||[]).filter((q) => !["focusable","focused","editable","settable","multiline","readonly"].includes(q.name)).map((q) => q.name + "=" + JSON.stringify(q.value.value)) }); };
globalThis.axf = axf;
const keys = JSON.parse(process.argv[4]);
await p.evaluate(()=>{document.querySelector("[role=grid],[role=treegrid] tbody td, [role=treegrid] tbody td").focus();});
await p.evaluate(()=>{const g=document.querySelector("[role=grid],[role=treegrid]"); g.querySelector("tbody td").focus();});
console.log("start", await axf());
for (const k of keys) { if (k.startsWith("T:")) await p.keyboard.type(k.slice(2)); else await p.keyboard.press(k); await p.waitForTimeout(150); console.log(k.padEnd(14), await axf()); }
console.log(s.errors.join("\n"));
await s.close();
