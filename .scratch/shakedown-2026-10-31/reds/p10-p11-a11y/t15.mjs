import { open } from "./lib.mjs";
for (const theme of ["light","dark"]) {
const s = await open("read", { theme, w: 1000, h: 420 }); const p = s.page;
let n = 0; const want = new Set([1,5,7,13,14,15,28,29]);
for (let i = 1; i <= 29; i++) { await p.keyboard.press("Tab"); if (want.has(i)) await p.screenshot({ path: `shots/read-tab${i}-${theme}.png`, clip: undefined }); }
await s.close(); }
