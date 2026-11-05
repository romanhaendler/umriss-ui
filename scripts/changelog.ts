// pnpm changelog [package] - a draft of the changelog: the subjects of the
// commits since the last "Release:" commit, per package. Prints only.
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { PACKAGES as PACKAGE_NAMES } from './ports.ts'

const PACKAGES: readonly string[] = PACKAGE_NAMES

// One subject to { text, names }, or null for "Release:" and "Merge" subjects.
// The prefix is everything before the first colon; names are lower-cased and
// split on commas and " and ". A subject without a colon names no package.
export function parseSubject(subject: string) {
  if (/^(Release:|Merge)/.test(subject)) return null
  const i = subject.indexOf(':')
  const prefix = i < 0 ? '' : subject.slice(0, i)
  const rest = (i < 0 ? subject : subject.slice(i + 1)).trim()
  const names = prefix.toLowerCase().split(/\s*,\s*|\s+and\s+/).map((s: string) => s.trim()).filter(Boolean)
  return { text: rest.charAt(0).toUpperCase() + rest.slice(1), names }
}

function main() {
  const want = process.argv[2]
  if (want && !PACKAGES.includes(want)) {
    console.error(`unknown package "${want}"; one of ${PACKAGES.join(', ')}`)
    process.exit(1)
  }

  const git = (...a: string[]) => execFileSync('git', a, { encoding: 'utf8' }).trim()
  const last = git('log', '--grep=^Release:', '-1', '--format=%H')
  const rows = git('log', '--reverse', '--format=%h\t%s', last ? `${last}..HEAD` : 'HEAD')
    .split('\n').filter(Boolean).map((l) => l.split('\t') as [string, string])

  const commits = rows.flatMap(([hash, subject]) => {
    const c = parseSubject(subject)
    return c ? [{ hash, ...c }] : []
  })
  const bullet = (c: { text: string; hash: string }) => `- ${c.text} (${c.hash})`

  for (const p of want ? [want] : PACKAGES) {
    console.log(`## ${p}\n`)
    const mine = commits.filter((c) => c.names.includes(p))
    console.log(mine.length ? mine.map(bullet).join('\n') : '(nothing)', '\n')
  }
  if (!want) {
    const rest = commits.filter((c) => !c.names.some((n: string) => PACKAGES.includes(n)))
    console.log(`## Not in a package's changelog\n`)
    console.log(rest.length ? rest.map(bullet).join('\n') : '(nothing)')
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
