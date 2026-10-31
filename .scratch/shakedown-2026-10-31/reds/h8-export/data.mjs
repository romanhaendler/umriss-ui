const NAMES = ["Alpha", "beta, gamma", 'say "hi"', "line\nbreak", "=SUM(A1)", "+plus", "-minus", "@at", "Ünï çödé", "emoji 😀", "  padded  ", "tab\there", "Zeta", "alpha", "ÄPFEL", "apfel", "10", "9", "x;y", ""];
const ODD = [0, -0, 1e21, 1e-7, 0.1 + 0.2, 1234567.891, -5, 1.5, null, NaN, Infinity, 100, 7, 7.0, 0.5, 1e6, 12345678901234567890, 3, 2, 1];
export const ROWS = Array.from({ length: 40 }, (_, i) => ({
  id: "R" + String(i + 1).padStart(3, "0"),
  name: NAMES[i % NAMES.length] + (i >= 20 ? " #" + i : ""),
  qty: ODD[i % ODD.length],
  price: Math.round(((i * 37) % 101) * 13.37 * 100) / 100,
  when: new Date(2026, 2, 1 + (i % 28), (i * 7) % 24, (i * 13) % 60, i % 3 === 0 ? 30 : 0),
  day: new Date(2026, 0, 1 + ((i * 5) % 40)),
  ok: i % 3 === 0 ? true : i % 3 === 1 ? false : (i % 2 ? true : false),
  note: i % 4 === 0 ? null : i % 4 === 1 ? "" : "note " + (i % 5),
  tags: ["t" + (i % 3), "u" + (i % 2)],
  obj: { a: i },
  score: (i * 11) % 100,
  grp: ["north", "south", "east"][i % 3],
  sub: i % 2 ? "x" : "y",
}));
export const TREE = [
  { id: "A", name: "Root A", qty: 10, kids: [{ id: "A1", name: "A one", qty: 4, kids: [{ id: "A1a", name: "A one a", qty: 1 }, { id: "A1b", name: "A one b", qty: 3 }] }, { id: "A2", name: "A two", qty: 6 }] },
  { id: "B", name: "Root B", qty: 5, kids: [{ id: "B1", name: "B one", qty: 5 }] },
  { id: "C", name: "Root C", qty: 2 },
];
const base = (i, name, extra = {}) => ({ id: "X" + i, name, qty: 1, price: 1, when: new Date(2026, 3, 1, 0, 0, 0), day: new Date(2026, 3, 1), ok: true, note: "n", tags: [], obj: {}, score: 1, grp: "g", sub: "s", ...extra });
export const HOSTILE = [
  base(1, "ctrl\u0001\u0008\u000b\u001f x"),
  base(2, "lone \ud800 surrogate"),
  base(3, "<tag> & \"q\" 'a' ]]>"),
  base(4, "x".repeat(40000)),
  base(5, "ls ps  nel\u0085"),
  base(6, "\tTabbed"),
  base(7, " =NBSP formula"),
  base(8, "  =spaces formula"),
  base(9, "\"=quoted"),
  base(10, "line1\r\nline2\rline3"),
  base(11, "0123456789012345678901234567890"),
  base(12, "1e3"),
  base(13, "TRUE"),
  base(14, "2026-03-17"),
  base(15, "﻿bom"),
];
