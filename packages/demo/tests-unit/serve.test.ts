/* What `pnpm start` answers: the front page, a page two levels deep, a
   Markdown twin and a rendered document load; an unknown path is a 404; `/`
   reaches the front page. */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { siteServer } from "../src/tooling/serve";

const BASE = "/umriss-ui/";
let dir: string;
let server: Server;
let origin: string;

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "site-"));
  mkdirSync(join(dir, "core", "button"), { recursive: true });
  mkdirSync(join(dir, "standards"));
  mkdirSync(join(dir, "\u20ac"));
  writeFileSync(join(dir, "\u20ac", "index.html"), "euro");
  writeFileSync(join(dir, "index.html"), "front");
  writeFileSync(join(dir, "core", "button", "index.html"), "button");
  writeFileSync(join(dir, "core", "button.md"), "# Button");
  writeFileSync(join(dir, "standards", "index.html"), "standards");
  writeFileSync(join(dir, "404.html"), "nothing here");
  server = siteServer(dir, BASE);
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.close();
  rmSync(dir, { recursive: true, force: true });
});

describe("the documentation server", () => {
  it("answers the front page, a page two levels deep, its Markdown twin and a document", async () => {
    for (const [path, body] of [["", "front"], ["core/button/", "button"], ["core/button.md", "# Button"], ["standards/", "standards"]] as const) {
      const response = await fetch(`${origin}${BASE}${path}`);
      expect([path, response.status, await response.text()]).toEqual([path, 200, body]);
    }
    expect((await fetch(`${origin}${BASE}core/button.md`)).headers.get("content-type")).toContain("text/markdown");
  });

  it("answers an unknown path, and a path outside the site, with the 404 page", async () => {
    for (const path of [`${BASE}core/nothing/`, "/elsewhere", `${BASE}%2e%2e/secret`]) {
      const response = await fetch(`${origin}${path}`);
      expect([path, response.status, await response.text()]).toEqual([path, 404, "nothing here"]);
    }
  });

  it("forwards / to the front page", async () => {
    const response = await fetch(`${origin}/`, { redirect: "manual" });
    expect([response.status, response.headers.get("location")]).toEqual([302, BASE]);
  });

  it("forwards the base without its slash, and a directory without its slash by its encoded address", async () => {
    for (const [path, to] of [[BASE.slice(0, -1), BASE], [`${BASE}%E2%82%AC`, `${BASE}%E2%82%AC/`], [`${BASE}standards`, `${BASE}standards/`]] as const) {
      const response = await fetch(`${origin}${path}`, { redirect: "manual" });
      expect([path, response.status, response.headers.get("location")]).toEqual([path, 301, to]);
    }
  });

  it("answers a path the file system refuses with 400 and keeps serving", async () => {
    expect((await fetch(`${origin}${BASE}core%00`)).status).toBe(400);
    expect((await fetch(`${origin}${BASE}`)).status).toBe(200);
  });
});
