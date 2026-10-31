import { open } from "./lib.mjs";
const s = await open(process.argv[2]||"grid", {lang: process.argv[3]||"en"});
console.log(await s.page.evaluate(() => {
  const g = document.querySelector("[role=grid],[role=treegrid]");
  const attrs = (e) => [...e.attributes].filter(a=>a.name!=="class"&&a.name!=="style").map(a => a.name + "=" + a.value.slice(0,40)).join(" ");
  const out = ["GRID " + attrs(g), "wrapper: " + attrs(g.parentElement)];
  const r = g.querySelector("tbody tr");
  out.push("ROW " + attrs(r));
  for (const c of r.children) out.push("  " + c.tagName + " " + attrs(c));
  const h = g.querySelectorAll("thead tr")[0]; out.push("HEAD1 " + attrs(h)); for (const c of h.children) out.push("  " + c.tagName + " " + attrs(c));
  const h2 = g.querySelectorAll("thead tr")[1]; out.push("HEAD2 " + attrs(h2)); for (const c of h2.children) out.push("  " + c.tagName + " " + attrs(c));
  out.push("LIVE: " + [...document.querySelectorAll("[aria-live],[role=status],[role=alert]")].map(e => attrs(e)+" => '"+e.textContent+"'").join(" || "));
  return out.join("\n");
}));
await s.close();
