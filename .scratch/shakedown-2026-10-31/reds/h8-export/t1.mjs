import { open, csv, sel, ROWS } from "./lib.mjs";
const h = await open();
const a = await csv(h.page);
console.log(JSON.stringify(a.slice(0, 1500)));
console.log(h.logs);
await h.close();
