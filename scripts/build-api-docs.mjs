#!/usr/bin/env node
/**
 * Generates the component API reference at docs/design-system/api.md from the
 * component sources themselves.
 *
 * Generated, not written, for the same reason specs.js is: there are 69
 * exported components, and a hand-copied reference for that many would be
 * wrong within a week with nothing to notice. A test asserts this output is in
 * sync, so a stale reference fails the suite rather than shipping quietly and
 * teaching a reader the wrong prop name.
 *
 * The prose that needs judgment — how to install it, how the tokens work, what
 * the conventions are — is hand-written in docs/design-system/README.md and is
 * NOT generated. Only the mechanical surface lives here.
 *
 *   node scripts/build-api-docs.mjs           # write
 *   node scripts/build-api-docs.mjs --check   # verify in sync, exit 1 if not
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = 'src/design-system/components'
const INDEX = 'src/design-system/index.js'
const OUT = 'docs/design-system/api.md'

/**
 * Walks JavaScript source tracking strings, template literals and comments so
 * brace depth is only counted in code.
 *
 * Naive depth counting is what broke this project's artifact parser: a brace or
 * bracket inside a string literal made one section absorb the next. Every
 * scanner here has to be string-aware or it is a latent version of that bug.
 *
 * @returns the source between `open` and its matching close, exclusive.
 */
export function balanced(src, from, open = '{', close = '}') {
  const start = src.indexOf(open, from)
  if (start === -1) return null
  let depth = 0
  let i = start
  let quote = null
  while (i < src.length) {
    const c = src[i]
    const next = src[i + 1]
    if (quote) {
      if (c === '\\') i++
      else if (c === quote) quote = null
    } else if (c === '"' || c === "'" || c === '`') {
      quote = c
    } else if (c === '/' && next === '/') {
      i = src.indexOf('\n', i)
      if (i === -1) break
    } else if (c === '/' && next === '*') {
      i = src.indexOf('*/', i + 2) + 1
      if (i === 0) break
    } else if (c === open) {
      depth++
    } else if (c === close) {
      depth--
      if (depth === 0) return { body: src.slice(start + 1, i), end: i }
    }
    i++
  }
  return null
}

/** Splits an object literal's body into top-level `key: value` entries. */
export function topLevelEntries(body) {
  const entries = []
  let depth = 0
  let quote = null
  let start = 0
  for (let i = 0; i < body.length; i++) {
    const c = body[i]
    const next = body[i + 1]
    if (quote) {
      if (c === '\\') i++
      else if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') quote = c
    else if (c === '/' && next === '/') i = body.indexOf('\n', i) - 1
    else if (c === '/' && next === '*') i = body.indexOf('*/', i + 2)
    else if ('{[('.includes(c)) depth++
    else if ('}])'.includes(c)) depth--
    else if (c === ',' && depth === 0) {
      entries.push(body.slice(start, i))
      start = i + 1
    }
  }
  if (body.slice(start).trim()) entries.push(body.slice(start))
  return entries
}

/** Collapses a JSDoc or `//` run into one line of prose. */
function cleanComment(raw) {
  return raw
    .replace(/\/\*\*?|\*\//g, '')
    .split('\n')
    .map((line) =>
      line
        .replace(/^\s*\*?\s?/, '')
        .replace(/^\s*\/\/\s?/, '')
        .trim(),
    )
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** The comment run immediately above an entry, if any. */
function leadingComment(entry) {
  const match = entry.match(/^\s*((?:\/\*[\s\S]*?\*\/|\/\/[^\n]*\n?)+)/)
  return match ? cleanComment(match[1]) : ''
}

/**
 * A prop defined by a shared helper rather than an object literal. `gapProp(12)`
 * returns { type: [Number, String], default, validator } — the reference has to
 * report what the helper produces, or five layout primitives document their most
 * important prop as an em-dash.
 */
const HELPERS = {
  gapProp: (arg) => ({
    type: '[Number, String]',
    default: `\`${arg || 12}\``,
    note: 'One of the redlined gap scale: 6, 8, 12, 14, 16, 22, 24, 32. Any other value fails the validator in dev.',
  }),
}

function helperProp(value) {
  const call = value.match(/^\s*(\w+)\((.*?)\)\s*$/s)
  return call && HELPERS[call[1]] ? HELPERS[call[1]](call[2].trim()) : null
}

function propType(value) {
  const match = value.match(/type:\s*([A-Za-z]+|\[[^\]]*\])/)
  if (!match) return '—'
  return match[1].replace(/\s+/g, ' ')
}

/**
 * Reads the value after `default:` up to the `,` or `}` that ends it.
 *
 * Splitting on a newline is not enough and was wrong in the first version:
 * `{ type: String, default: '' }` is one line, so the naive read produced
 * `'' }` and every single-line default in the reference carried a stray brace.
 * This walks to the real terminator, ignoring any that sit inside a string or
 * a nested literal — `default: () => ({ a: 1 })` ends at neither inner brace.
 */
function propDefault(value) {
  const at = value.indexOf('default:')
  if (at === -1) return value.includes('required: true') ? '(required)' : '—'

  const tail = value.slice(at + 'default:'.length)
  let depth = 0
  let quote = null
  let end = tail.length
  for (let i = 0; i < tail.length; i++) {
    const c = tail[i]
    if (quote) {
      if (c === '\\') i++
      else if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') quote = c
    else if ('{[('.includes(c)) depth++
    else if (')]}'.includes(c)) {
      if (depth === 0) {
        end = i
        break
      }
      depth--
    } else if (c === ',' && depth === 0) {
      end = i
      break
    }
  }

  const literal = tail.slice(0, end).replace(/\s+/g, ' ').trim()
  return literal ? `\`${literal}\`` : '—'
}

export function parseComponent(source, name, category) {
  const script = source.slice(source.indexOf('<script'), source.indexOf('</script>'))

  // The component's own description: the first JSDoc block in <script setup>,
  // above the first declaration.
  const doc = script.match(/\/\*\*([\s\S]*?)\*\//)
  const propsAt = script.indexOf('defineProps')
  let description =
    doc && (propsAt === -1 || script.indexOf(doc[0]) < propsAt) ? cleanComment(doc[0]) : ''

  // Pure-template components (Card, CardBody) have no <script> at all. Their
  // description is a file-level HTML comment ABOVE <template> — outside every
  // SFC block, so the compiler ignores it and, unlike a comment inside the
  // template, it cannot turn the component into a Fragment.
  if (!description) {
    const head = source.slice(0, source.indexOf('<template>'))
    const lead = head.match(/<!--([\s\S]*?)-->/)
    if (lead) description = cleanComment(lead[1])
  }

  const props = []
  if (propsAt !== -1) {
    const block = balanced(script, propsAt)
    if (block) {
      for (const entry of topLevelEntries(block.body)) {
        const key = entry.match(/(?:^|\n)\s*([A-Za-z_$][\w$]*)\s*:/)
        if (!key) continue
        const value = entry.slice(entry.indexOf(key[1]) + key[1].length).replace(/^\s*:/, '')
        const helper = helperProp(value)
        const note = leadingComment(entry)
        props.push({
          name: key[1],
          type: helper?.type ?? propType(value),
          default: helper?.default ?? propDefault(value),
          note: note || helper?.note || '',
        })
      }
    }
  }

  const emitsAt = script.indexOf('defineEmits')
  const emits =
    emitsAt === -1
      ? []
      : [...(balanced(script, emitsAt, '[', ']')?.body ?? '').matchAll(/['"]([^'"]+)['"]/g)].map(
          (m) => m[1],
        )

  const template = source.slice(source.indexOf('<template>'))
  const named = [...template.matchAll(/<slot\b[^>]*\bname="([^"]+)"/g)].map((m) => m[1])
  const hasDefault = /<slot\b(?![^>]*\bname=)/.test(template)

  return { name, category, description, props, emits, slots: { named, hasDefault } }
}

const CATEGORY_TITLES = {
  data: 'Data',
  datepicker: 'Date picker',
  disclosure: 'Disclosure',
  feedback: 'Feedback',
  files: 'File inputs',
  forms: 'Forms',
  layout: 'Layout primitives',
  notifications: 'Notifications',
  overlays: 'Overlays',
  print: 'Print',
  search: 'Search',
  selection: 'Selection controls',
  selects: 'Dropdowns',
  shell: 'App shell',
  shortcuts: 'Shortcuts',
  stepper: 'Stepper',
  surfaces: 'Surfaces',
  tabs: 'Tabs',
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) return entry === '__tests__' ? [] : walk(path)
    return path.endsWith('.vue') ? [path] : []
  })
}

export function collect() {
  const exported = new Set(
    [...readFileSync(INDEX, 'utf8').matchAll(/export \{ default as (\w+)/g)].map((m) => m[1]),
  )
  return walk(ROOT)
    .map((path) => {
      const parts = path.split('/')
      const name = parts[parts.length - 1].replace('.vue', '')
      return { path, name, category: parts[parts.length - 2] }
    })
    .filter((c) => exported.has(c.name))
    .map((c) => parseComponent(readFileSync(c.path, 'utf8'), c.name, c.category))
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
}

const escape = (text) => text.replace(/\|/g, '\\|')

export function render(components) {
  const byCategory = new Map()
  for (const c of components) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, [])
    byCategory.get(c.category).push(c)
  }

  const out = [
    '<!-- GENERATED from the component sources — do not hand-edit.',
    '     Regenerate with `node scripts/build-api-docs.mjs`.',
    '     Prose that needs judgment lives in ./README.md, which is hand-written. -->',
    '',
    '# Component API reference',
    '',
    `${components.length} components, every one exported from \`@/design-system\`.`,
    'Each entry lists only what a consumer passes in: props, events and slots.',
    'Anything undocumented here is internal and may change.',
    '',
    'For how to install, theme and compose these, start with [README.md](./README.md).',
    '',
    '## Contents',
    '',
  ]

  for (const [category, list] of byCategory) {
    const title = CATEGORY_TITLES[category] ?? category
    const anchor = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    out.push(`- [${title}](#${anchor}) — ${list.map((c) => c.name).join(', ')}`)
  }
  out.push('')

  for (const [category, list] of byCategory) {
    out.push(`## ${CATEGORY_TITLES[category] ?? category}`, '')
    for (const c of list) {
      out.push(`### ${c.name}`, '')
      if (c.description) out.push(c.description, '')

      if (c.props.length) {
        out.push('| Prop | Type | Default | Notes |', '| --- | --- | --- | --- |')
        for (const p of c.props) {
          out.push(
            `| \`${p.name}\` | ${escape(p.type)} | ${escape(p.default)} | ${escape(p.note)} |`,
          )
        }
        out.push('')
      }

      if (c.emits.length) {
        out.push(`**Emits:** ${c.emits.map((e) => `\`${e}\``).join(', ')}`, '')
      }

      const slots = [
        ...(c.slots.hasDefault ? ['default'] : []),
        ...c.slots.named.filter((s) => !s.includes('{')),
      ]
      if (slots.length) {
        out.push(`**Slots:** ${[...new Set(slots)].map((s) => `\`${s}\``).join(', ')}`, '')
      }
    }
  }
  return (
    out
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd() + '\n'
  )
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())
if (isMain) {
  const output = render(collect())
  if (process.argv.includes('--check')) {
    if (readFileSync(OUT, 'utf8') !== output) {
      console.error(`${OUT} is out of date. Run: node scripts/build-api-docs.mjs`)
      process.exit(1)
    }
    console.log(`${OUT} is in sync with the component sources.`)
  } else {
    writeFileSync(OUT, output)
    console.log(`Wrote ${OUT}`)
  }
}
