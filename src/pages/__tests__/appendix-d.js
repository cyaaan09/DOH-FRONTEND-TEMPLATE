/**
 * Parses spec Appendix D — demo page content — into per-section content
 * expectations: description, sub-block labels (+ notes where the source
 * gives one), and rule-card titles/bodies. Not a test itself (no describe/
 * it), same convention as parse-tokens.js: a plain helper that happens to
 * live in a __tests__ directory.
 *
 * Exists so appendix-d-content.spec.js can check every section's rendered
 * text against the spec from one data-driven test, instead of hand-written
 * per-section assertions that would have to be kept in lockstep with the
 * spec by hand — which is exactly how the plan's own rule-card extraction
 * drifted in the first place (spec Appendix D, "typeRules": "Missed by the
 * original rule-card extraction — its regex did not match this array's
 * shape").
 */

const HEADING_RE = /^#### (.+)$/gm
const RULE_BULLET_RE = /^- \*\*(.+?)\*\* — (.+)$/gm
const LABEL_BULLET_RE = /^- `([^`]+)`$/gm
const TABLE_ROW_RE = /^\|\s*`([^`]+)`\s*\|\s*(.+?)\s*\|$/gm
const NO_NOTE = '*(none)*'

// Sections whose "**Rule cards:**" block is the artifact's own template
// ("{{ rule.title }} — {{ rule.body }}"), not literal data — the real cards
// live in the like-named array under "#### Rule-card data". Dark mode is the
// one section whose rule cards are spelled out directly under its own
// heading, so it needs no entry here.
const RULE_ARRAY_BY_TITLE = {
  'Containers & surfaces': 'containerRules',
  Chips: 'chipRules',
  Tabs: 'tabRules',
  'Toasts & inline notices': 'toastRules',
  'Type scale': 'typeRules',
  'Tokens for handoff': 'handoffRules',
}

/** Splits the Appendix D region into { headingText -> bodyText } chunks on every "#### " heading. */
function splitIntoChunks(region) {
  const matches = [...region.matchAll(HEADING_RE)]
  const chunks = new Map()
  matches.forEach((match, i) => {
    const start = match.index + match[0].length
    const end = i + 1 < matches.length ? matches[i + 1].index : region.length
    chunks.set(match[1].trim(), region.slice(start, end))
  })
  return chunks
}

function parseRuleBullets(text) {
  return [...text.matchAll(RULE_BULLET_RE)].map((m) => ({ title: m[1], body: m[2] }))
}

function parseLabelBullets(text) {
  return [...text.matchAll(LABEL_BULLET_RE)].map((m) => m[1])
}

/** Parses a `| \`Label\` | Note |` table into [{ label, note }], "*(none)*" becoming ''. */
function parseNoteTable(text) {
  return [...text.matchAll(TABLE_ROW_RE)].map((m) => {
    const note = m[2].trim()
    return { label: m[1], note: note === NO_NOTE ? '' : note }
  })
}

function parseDescription(text) {
  const match = /\*\*Description:\*\*\s*(.+)/.exec(text)
  return match ? match[1].trim() : null
}

/** Parses one main per-section block (e.g. the "#### Chips" chunk, not the D.1 tone table). */
function parseMainChunk(body) {
  const subIdx = body.indexOf('**Sub-blocks:**')
  const ruleIdx = body.indexOf('**Rule cards:**')
  const subText = subIdx === -1 ? '' : body.slice(subIdx, ruleIdx === -1 ? undefined : ruleIdx)
  const ruleText = ruleIdx === -1 ? '' : body.slice(ruleIdx)
  return {
    description: parseDescription(body),
    subBlocks: parseLabelBullets(subText).map((label) => ({ label, note: '' })),
    rules: parseRuleBullets(ruleText),
  }
}

/**
 * @param {string} markdown full spec file contents
 * @param {{id: string, title: string}[]} sections the section manifest (spec Appendix D order)
 * @returns {{id: string, title: string, description: string|null, subBlocks: {label: string, note: string}[], rules: {title: string, body: string}[]}[]}
 */
export function parseAppendixD(markdown, sections) {
  const start = markdown.indexOf('## Appendix D — demo page content')
  if (start === -1) throw new Error('Appendix D heading not found in spec')
  const chunks = splitIntoChunks(markdown.slice(start))

  const ruleArrays = {}
  for (const arrayName of new Set(Object.values(RULE_ARRAY_BY_TITLE))) {
    const chunk = chunks.get(arrayName)
    if (chunk === undefined) throw new Error(`rule array not found in spec: ${arrayName}`)
    const rules = parseRuleBullets(chunk)
    if (rules.length === 0) throw new Error(`rule array parsed to zero entries: ${arrayName}`)
    ruleArrays[arrayName] = rules
  }

  const chipToneChunk = chunks.get('Chips → the five tone sub-blocks')
  const foundationsGroupChunk = chunks.get('Foundations → the six scale groups')
  if (chipToneChunk === undefined) throw new Error('D.1 Chips tone table not found in spec')
  if (foundationsGroupChunk === undefined) throw new Error('D.1 Foundations scale-group table not found in spec')
  const chipTones = parseNoteTable(chipToneChunk)
  const foundationsGroups = parseNoteTable(foundationsGroupChunk)
  if (chipTones.length === 0) throw new Error('D.1 Chips tone table parsed to zero rows')
  if (foundationsGroups.length === 0) throw new Error('D.1 Foundations scale-group table parsed to zero rows')

  return sections.map(({ id, title }) => {
    const chunk = chunks.get(title)
    if (chunk === undefined) throw new Error(`Appendix D has no section heading for "${title}"`)
    const parsed = parseMainChunk(chunk)

    let subBlocks = parsed.subBlocks
    if (title === 'Chips') subBlocks = [...subBlocks, ...chipTones]
    if (title === 'Foundations') subBlocks = foundationsGroups

    let rules = parsed.rules
    if (rules.length === 1 && rules[0].title === '{{ rule.title }}') {
      const arrayName = RULE_ARRAY_BY_TITLE[title]
      if (!arrayName) throw new Error(`"${title}" has a placeholder Rule cards block but no array mapping`)
      rules = ruleArrays[arrayName]
    }

    return { id, title, description: parsed.description, subBlocks, rules }
  })
}
