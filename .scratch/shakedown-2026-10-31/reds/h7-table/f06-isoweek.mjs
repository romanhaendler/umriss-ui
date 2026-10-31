// F6: table group "week" label: compare the library's formula (copied from table/src/model/grouping.ts) with the ISO-8601 week.
function lib(y, m, d) { const wd = new Date(Date.UTC(y, m, d)).getUTCDay(); const thursday = new Date(Date.UTC(y, m, d + 3 - ((wd + 6) % 7))); const ty = thursday.getUTCFullYear(); const ft = new Date(Date.UTC(ty, 0, 4));
  return 1 + Math.round((thursday - ft) / 86400000 / 7 - ((((ft.getUTCDay() + 6) % 7) - 3) / 7)); }
function iso(y, m, d) { const t = new Date(Date.UTC(y, m, d)); const dayNum = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - dayNum + 3); const fy = new Date(Date.UTC(t.getUTCFullYear(), 0, 4)); return 1 + Math.round(((t - fy) / 86400000 - 3 + ((fy.getUTCDay() + 6) % 7)) / 7); }
let bad = 0, n = 0; for (let y = 2020; y <= 2030; y++) for (let day = 0; day < 365; day++) { n++; if (lib(y, 0, 1 + day) !== iso(y, 0, 1 + day)) bad++; }
console.log("days where the label differs from ISO week:", bad, "of", n);
console.log("2026-03-30 (a Monday): library", lib(2026, 2, 30), "ISO", iso(2026, 2, 30)); console.log("2024-12-30: library", lib(2024, 11, 30), "ISO", iso(2024, 11, 30));
process.exit(bad ? 1 : 0);
