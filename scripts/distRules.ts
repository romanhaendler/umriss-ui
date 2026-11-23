/* The rules of `check:dist` that read a version: the peer form, the deprecation
   marker and the changelog's "Changed" section. `0.x` follows ADR-0066, `1.0.0`
   and later ADR-0083; the version told apart decides which. */

const parse = (version: string) => {
  const [major = 0, minor = 0] = version.split(".").map(Number);
  return { major, minor };
};

/* An umriss peer is `workspace:^<major>.<minor>.0` of the package's own version
   (pnpm packs `^<major>.<minor>.0`), so a patch is accepted and a minor release
   has to move it. */
export function peerProblems(version: string, peers: Record<string, string> = {}): string[] {
  const { major, minor } = parse(version);
  const expected = `workspace:^${major}.${minor}.0`;
  return Object.entries(peers)
    .filter(([peer, range]) => peer.startsWith("@umriss-ui/") && range !== expected)
    .map(([peer, range]) => `peer ${peer} reads ${range}, expected ${expected}`);
}

/* `0.x`: a marker names `since 0.<N>`, N the package's minor or the next, so the
   release of the minor after N cannot go out while the old name stands. From
   `1.0.0` a renamed name lives to the next major: a marker names
   `since <major>.<minor>` of the package's major, and one of an earlier major
   (`since 0.<N>` included) is removed. */
export function markerProblem(version: string, line: string): string | undefined {
  if (!line.includes("@deprecated")) return undefined;
  const { major, minor } = parse(version);
  const since = /@deprecated since (\d+)\.(\d+)\b/.exec(line);
  if (!since) return `@deprecated names no "since ${major}.<N>"`;
  const [markerMajor, markerMinor] = [Number(since[1]), Number(since[2])];
  if (markerMajor !== major) return `deprecated since ${markerMajor}.${markerMinor}, the package is ${version}; remove it`;
  if (major === 0 ? markerMinor !== minor && markerMinor !== minor + 1 : markerMinor > minor + 1) {
    return `deprecated since ${markerMajor}.${markerMinor}, the package is ${version}; ${major === 0 ? "remove it" : "a marker cannot name a later minor"}`;
  }
  return undefined;
}

/* The changelog's section of this version has its heading; every top-level entry
   under its `### Changed` carries a nested `Migration:` item with text after it,
   and from `1.0.0` a `### Changed` stands only under a heading `<major>.0.0`.
   Earlier sections predate the rule. */
export function changelogProblems(version: string, changelog: string): string[] {
  const start = changelog.indexOf(`\n## ${version} – `);
  if (start < 0) return [`CHANGELOG.md: no heading for ${version}`];
  const section = changelog.slice(start + 1).split(/\n## /)[0] ?? "";
  const changed = /\n### Changed\n([\s\S]*?)(?=\n### |$)/.exec(section)?.[1] ?? "";
  const entries = changed.split(/\n(?=- )/).filter((text) => text.startsWith("- "));
  const { major } = parse(version);
  if (major >= 1 && entries.length > 0 && !/^\d+\.0\.0$/.test(version)) {
    return [`CHANGELOG.md ${version}: a "Changed" section stands only under a major heading, not under a minor or patch`];
  }
  return entries
    .filter((entry) => !/^ {2}- Migration: *\S/m.test(entry))
    .map((entry) => `CHANGELOG.md ${version}: the entry ${/\*\*[^*]+\*\*/.exec(entry)?.[0] ?? entry.slice(0, 60)} has no "Migration:" item`);
}

/* Every published manifest names Node 22 in `engines` and peers React as `^19`
   (ADR-0083). */
export function manifestProblems(manifest: { engines?: Record<string, string>; peerDependencies?: Record<string, string> }): string[] {
  const problems: string[] = [];
  if (manifest.engines?.node !== ">=22") problems.push(`engines.node reads ${manifest.engines?.node ?? "nothing"}, expected >=22`);
  for (const react of ["react", "react-dom"]) {
    if (manifest.peerDependencies?.[react] !== "^19") problems.push(`peer ${react} reads ${manifest.peerDependencies?.[react] ?? "nothing"}, expected ^19`);
  }
  return problems;
}
