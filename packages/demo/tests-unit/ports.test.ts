/* The browser suite's port arithmetic (scripts/ports.ts): UMRISS_PORT_BASE plus
   the package's offset, 4173 when unset, and a refusal of a server that
   answers for another checkout. */
import { spawn } from "node:child_process";
import { describe, expect, it } from "vitest";
import { CHECKOUT_HEADER, PACKAGES, portOf, reusable } from "../../../scripts/ports.ts";

describe("portOf", () => {
  it("defaults to 4173 for core and counts up per package", () => {
    expect(PACKAGES.map((p) => portOf(p, {}))).toEqual([4173, 4174, 4175, 4176, 4177, 4178, 4179]);
  });

  it("adds each package's offset to the base", () => {
    expect(portOf("core", { UMRISS_PORT_BASE: "4400" })).toBe(4400);
    expect(portOf("alarms", { UMRISS_PORT_BASE: "4400" })).toBe(4406);
  });

  it("rejects a base that is no port", () => {
    expect(() => portOf("core", { UMRISS_PORT_BASE: "abc" })).toThrow(/UMRISS_PORT_BASE/);
    expect(() => portOf("core", { UMRISS_PORT_BASE: "80" })).toThrow(/UMRISS_PORT_BASE/);
  });

  it("rejects an unknown package", () => {
    expect(() => portOf("nope", {})).toThrow(/unknown package/);
  });
});

describe("reusable", () => {
  /* servedBy blocks the event loop on curl, so the server is another process. */
  const serve = (checkout: string | undefined) =>
    new Promise<{ port: number; close: () => void }>((resolve) => {
      const child = spawn(process.execPath, [
        "-e",
        `const s=require("http").createServer((q,r)=>{if(${JSON.stringify(checkout)})r.setHeader(${JSON.stringify(CHECKOUT_HEADER)},${JSON.stringify(checkout)});r.end("ok")}).listen(0,()=>console.log(s.address().port))`,
      ]);
      child.stdout.once("data", (d) => resolve({ port: Number(d), close: () => child.kill() }));
    });

  it("starts a server where none runs", async () => {
    const { port, close } = await serve("/a");
    close();
    await new Promise((r) => setTimeout(r, 200));
    expect(reusable(port, "/a")).toBe(false);
  });

  it("reuses the server of this checkout", async () => {
    const { port, close } = await serve("/a");
    try {
      expect(reusable(port, "/a")).toBe(true);
    } finally {
      close();
    }
  });

  it("refuses the server of another checkout, naming both paths", async () => {
    const { port, close } = await serve("/other");
    try {
      expect(() => reusable(port, "/mine")).toThrow(/\/other.*\/mine/);
    } finally {
      close();
    }
  });
});
