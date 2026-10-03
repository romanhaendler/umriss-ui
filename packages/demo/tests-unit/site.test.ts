/* The built site's guard and its forwarders: what a search engine and a
   reader with an old link meet (.scratch/sidebar-tree, Testing Decisions,
   seam 1). */

import { describe, expect, it } from "vitest";
import { forwarderHtml, siteFaults } from "../src/tooling/site";

const HOME = "https://example.test/umriss-ui/charts/";
const page = (url: string) =>
  `<title>Installation</title><meta name="description" content="Install it." /><link rel="canonical" href="${url}" /><h1>Installation</h1>`;
const forwarder = { url: `${HOME}getting-started/`, to: `${HOME}installation/`, title: "Installation" };
const urls = [HOME, `${HOME}installation/`];
const files = new Map([
  [HOME, page(HOME)],
  [`${HOME}installation/`, page(`${HOME}installation/`)],
  [forwarder.url, forwarderHtml(forwarder)],
]);

describe("a forwarder", () => {
  const html = forwarderHtml(forwarder);

  it("names the current address as canonical and is kept out of the index", () => {
    expect(html).toContain(`<link rel="canonical" href="${forwarder.to}" />`);
    expect(html).toContain('<meta name="robots" content="noindex" />');
    expect(html).toContain("<title>Installation</title>");
  });

  it("forwards at once, carrying the anchor, and leaves a plain link for a reader without JavaScript", () => {
    expect(html).toContain('<meta http-equiv="refresh" content="0; url=/umriss-ui/charts/installation/" />');
    expect(html).toContain('location.replace("/umriss-ui/charts/installation/" + location.hash)');
    expect(html).toContain('<a href="/umriss-ui/charts/installation/">Installation</a>');
  });
});

describe("the built site's guard", () => {
  it("passes a site of sitemap pages and declared forwarders", () => {
    expect(siteFaults(urls, [forwarder], files)).toEqual([]);
  });

  it("fails on a page file that is neither in the sitemap nor a declared forwarder", () => {
    expect(siteFaults(urls, [], files)).toEqual([`${forwarder.url}: in no sitemap entry and no forwarder`]);
  });

  it("fails on a forwarder whose target is not in the sitemap", () => {
    const astray = { ...forwarder, to: `${HOME}nowhere/` };
    expect(siteFaults(urls, [astray], new Map([...files, [astray.url, forwarderHtml(astray)]]))).toEqual([
      `${astray.url}: forwards to ${astray.to}, which is not in the sitemap`,
    ]);
  });

  it("fails on a forwarder in the sitemap, and on a declared forwarder with no file", () => {
    expect(siteFaults([...urls, forwarder.url], [forwarder], files)).toContain(`${forwarder.url}: a forwarder in the sitemap`);
    const without = new Map(files);
    without.delete(forwarder.url);
    expect(siteFaults(urls, [forwarder], without)).toEqual([`${forwarder.url}: no forwarder file`]);
  });

  it("still fails on a sitemap address without its file or its head", () => {
    expect(siteFaults([...urls, `${HOME}axis/`], [forwarder], files)).toEqual([`${HOME}axis/: no file`]);
    const bare = new Map([...files, [`${HOME}installation/`, "<h1>Installation</h1>"]]);
    expect(siteFaults(urls, [forwarder], bare)).toEqual([`${HOME}installation/: no title, description, canonical`]);
  });
});
