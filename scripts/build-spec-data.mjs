#!/usr/bin/env node
/**
 * Generates src/design-system/demo/data/specs.js from spec Appendix C.
 *
 * The Component specs section IS Appendix C rendered as an accordion — the
 * artifact's own 19 group names and summaries match it line for line. Hand
 * -copying ~310 redline rows would drift from the spec the moment either
 * side changed, and nothing would notice; a test asserts this output is in
 * sync, so a stale file fails the suite rather than shipping quietly.
 *
 *   node scripts/build-spec-data.mjs           # write
 *   node scripts/build-spec-data.mjs --check   # verify in sync, exit 1 if not
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SPEC = 'docs/superpowers/specs/2026-08-29-design-system-design.md'
const OUT = 'src/design-system/demo/data/specs.js'

export function buildSpecGroups(markdown) {
  const start = markdown.indexOf('## Appendix C')
  const end = markdown.indexOf('## Appendix D')
  const section = markdown.slice(start, end)
  const groupRe = /^### (.+?)\n\n_(.+?)_\n\n\|[^\n]*\|\n\|[-|\s]*\|\n((?:\|[^\n]*\|\n)+)/gm

  const groups = []
  for (const match of section.matchAll(groupRe)) {
    const [, name, summary, body] = match
    const rows = []
    for (const line of body.trim().split('\n')) {
      const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
      if (cells.length < 2) continue
      const k = cells[0].replace(/`/g, '')
      const v = cells[1].replace(/`/g, '')
      if (!k || !v) continue
      const row = { k, v }
      // A swatch only when the value IS one colour and nothing else — a
      // value that merely mentions a hex among other CSS is not a colour row.
      if (/^#[0-9A-Fa-f]{6}$/.test(v.trim())) row.c = v.trim()
      rows.push(row)
    }
    if (rows.length) groups.push({ name: name.trim(), summary: summary.trim(), rows })
  }
  return groups
}

export function render(groups) {
  return (
    '// GENERATED from spec Appendix C — do not hand-edit.\n' +
    '// Regenerate with `node scripts/build-spec-data.mjs`.\n' +
    'export const SPEC_GROUPS = ' +
    JSON.stringify(groups, null, 2) +
    '\n'
  )
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())
if (isMain) {
  const output = render(buildSpecGroups(readFileSync(SPEC, 'utf8')))
  if (process.argv.includes('--check')) {
    const current = readFileSync(OUT, 'utf8')
    if (current !== output) {
      console.error(`${OUT} is out of sync with Appendix C. Run: node scripts/build-spec-data.mjs`)
      process.exit(1)
    }
    console.log(`${OUT} is in sync with Appendix C.`)
  } else {
    writeFileSync(OUT, output)
    console.log(`Wrote ${OUT}`)
  }
}
