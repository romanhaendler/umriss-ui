import { openRec } from "./lib.mjs";
const s = await openRec("read", { lang: "de" }); const p = s.page;
for (const n of ["Role filtern", "Capacity filtern", "Team filtern"]) {
  await p.getByRole("button", { name: n }).focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
  console.log("=== " + n); console.log((await p.locator("[role=dialog]:visible").last().ariaSnapshot()).split("\n").slice(0, 30).join("\n"));
  await p.keyboard.press("Escape"); await p.waitForTimeout(200);
}
await s.close();
