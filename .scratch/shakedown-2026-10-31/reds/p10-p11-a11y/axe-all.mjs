import { open, axe } from "./lib.mjs";
for (const screen of ["read","grid","gridrow","virtual","grouped","groupedvirtual","tree","treegrid","core"]) for (const theme of ["light","dark"]) for (const lang of ["en","de"]) {
  const s = await open(screen, { theme, lang });
  const v = await axe(s.page);
  console.log(screen, theme, lang, v.length ? "\n  " + v.join("\n  ") : "clean", s.errors.length ? "\n  CONSOLE " + s.errors.join(" | ") : "");
  await s.close();
}
