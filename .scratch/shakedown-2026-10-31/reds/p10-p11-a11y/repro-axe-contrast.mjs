// axe color-contrast on screen #core (light, then with the DatePicker open and the dark theme)
import { open } from "./lib.mjs";
import AxeBuilder from "@axe-core/playwright";
for (const [theme, openPicker] of [["light", false], ["light", true], ["dark", true]]) {
  const s = await open("core", { theme });
  if (openPicker) { await s.page.getByRole("button", { name: "Date", exact: true }).click(); await s.page.waitForTimeout(400); }
  const r = await new AxeBuilder({ page: s.page }).withRules(["color-contrast"]).analyze();
  for (const v of r.violations) for (const n of v.nodes) console.log(theme, openPicker ? "picker-open" : "closed", n.html.slice(0, 90).replace(/\s+/g, " "), "|", /contrast of ([\d.]+) \(foreground color: (#\w+), background color: (#\w+)/.exec(n.any[0]?.message || "")?.slice(1).join(" "));
  await s.close();
}
