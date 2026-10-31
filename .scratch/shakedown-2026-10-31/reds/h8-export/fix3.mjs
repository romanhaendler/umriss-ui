import fs from "node:fs";
let s = fs.readFileSync("src/main.tsx", "utf8");
s = s.replace(`import { createRoot }`, `import { useState } from "react";\nimport { createRoot }`);
s = s.replace(/  const serverState = \{ page: 1 \};\n  void serverState;\n  const t = useTable<Row>\([\s\S]*?\} as any\);\n  w\.t = t;/, `  const serve = (r: any) => {
    const m = (ROWS as Row[]).filter((x) => !r.search || x.name.toLowerCase().includes(r.search.toLowerCase()));
    const sorted = r.sort?.length ? [...m].sort((a: any, b: any) => (a[r.sort[0].column] > b[r.sort[0].column] ? 1 : -1) * (r.sort[0].direction === "asc" ? 1 : -1)) : m;
    return { rows: sorted.slice((r.page - 1) * r.pageSize, r.page * r.pageSize), count: m.length, all: sorted };
  };
  const [ans, setAns] = useState(() => serve({ search: "", sort: [], page: 1, pageSize: cfg.pageSize }));
  const t = useTable<Row>(cfg.server ? ans.rows : (ROWS as Row[]), {
    rowKey: (r) => r.id,
    pageSize: cfg.pageSize,
    virtual: cfg.virtual || undefined,
    ...(cfg.server ? ({ server: true, rowCount: ans.count, onRequest: (r: any) => { w.req = r; setAns(serve(r)); }, exportRows: async (r: any) => { w.exportReq = r; return serve(r).all; } } as any) : {}),
  } as any);
  w.t = t;`);
fs.writeFileSync("src/main.tsx", s);
