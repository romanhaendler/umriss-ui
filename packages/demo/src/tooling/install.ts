/* The install command - one, derived from the manifest (facade-defects).

   Every place that tells a reader how to install a package takes it from
   here: the Installation page, the `llms.txt` line, the landing pages and the
   front page - and the front page's tiles say from the same peers what a
   package needs. A new peer in a manifest therefore changes every instruction at
   once, and none of them can forget one.

   npm, because it is the lowest common denominator; the README keeps its pnpm
   quick start for contributors. Only the umriss peers are named - React is the
   application's own, and the prose says which version.

   It runs in the browser and in Node alike, which is why it imports nothing. */

/** What the command is read from: a package's `package.json`. */
export interface InstallManifest {
  name: string;
  peerDependencies?: Readonly<Record<string, string>>;
}

/** The peers in the order they are named: core, the base of all, first. A
    peer not listed here follows them, in the manifest's order. */
const ORDER = ["@umriss-ui/core", "@umriss-ui/charts"];

/** The umriss peers of a manifest, core first. */
function umrissPeers(peerDependencies: Readonly<Record<string, string>> = {}): string[] {
  const rank = (peer: string) => {
    const at = ORDER.indexOf(peer);
    return at === -1 ? ORDER.length : at;
  };
  return Object.keys(peerDependencies)
    .filter((peer) => peer.startsWith("@umriss-ui/"))
    .sort((a, b) => rank(a) - rank(b));
}

/** `npm install <name> <umriss peers…>`, from the package's manifest. */
export function installCommand({ name, peerDependencies }: InstallManifest): string {
  return ["npm install", name, ...umrissPeers(peerDependencies)].join(" ");
}

/** What a package needs, as the front page's tile says it
    (.scratch/site-front-page): "stands alone", "needs core", "needs core and
    charts" - from the same peers as the install command. */
export function dependencyLine({ peerDependencies }: InstallManifest): string {
  const names = umrissPeers(peerDependencies).map((peer) => peer.slice("@umriss-ui/".length));
  return names.length === 0 ? "stands alone" : `needs ${names.join(" and ")}`;
}
