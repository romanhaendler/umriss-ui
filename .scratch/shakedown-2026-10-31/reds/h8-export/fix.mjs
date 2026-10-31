import fs from "node:fs";
let s = fs.readFileSync("lib.mjs", "utf8").split("\n");
const i = s.findIndex((l) => l.startsWith("export function quote"));
s[i] = 'export function quote(s, sep) { return s.includes(sep) || /["\\r\\n]/.test(s) ? `"${s.replace(/"/g, \'""\')}"` : s; }';
fs.writeFileSync("lib.mjs", s.join("\n"));
