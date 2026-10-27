// pnpm changelog [package] - a draft of the changelog: the subjects of the
// commits since the last "Release:" commit, per package. Prints only.
import { execFileSync } from 'node:child_process'

const PACKAGES = ['core', 'charts', 'table', 'schedule', 'calculation', 'dashboard', 'alarms']
const want = process.argv[2]
if (want && !PACKAGES.includes(want)) {
  console.error(`unknown package "${want}"; one of ${PACKAGES.join(', ')}`)
  process.exit(1)
}

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim()
const last = git('log', '--grep=^Release:', '-1', '--format=%H')
const rows = git('log', '--reverse', '--format=%h\t%s', last ? `${last}..HEAD` : 'HEAD')
  .split('\n').filter(Boolean).map((l) => l.split('\t'))

const commits = rows.flatMap(([hash, subject]) => {
  const m = /^([a-z][a-z, ]*):\s+(.*)$/.exec(subject)
  if (!m || m[1] === 'Release') return []
  const text = m[2][0].toUpperCase() + m[2].slice(1)
  return [{ hash, text, names: m[1].split(',').map((s) => s.trim()) }]
})
const bullet = (c) => `- ${c.text} (${c.hash})`

for (const p of want ? [want] : PACKAGES) {
  console.log(`## ${p}\n`)
  const mine = commits.filter((c) => c.names.includes(p))
  console.log(mine.length ? mine.map(bullet).join('\n') : '(nothing)', '\n')
}
if (!want) {
  const rest = commits.filter((c) => !c.names.some((n) => PACKAGES.includes(n)))
  console.log(`## Not in a package's changelog\n`)
  console.log(rest.length ? rest.map(bullet).join('\n') : '(nothing)')
}
