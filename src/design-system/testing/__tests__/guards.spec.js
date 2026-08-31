import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findAppImports, findDarkVariants, findRawHex } from '../guards'

const COMPONENTS_DIR = 'src/design-system/components'
const DESIGN_SYSTEM_DIR = 'src/design-system'
const DEMO_DIR = 'src/design-system/demo'

/**
 * Lists .vue and .js files under the components directory. .js is included
 * because Phase 2 adds tone/variant map modules (e.g. variants.js) that can
 * carry a raw hex or a `dark:` string just as easily as a .vue file can.
 * Uses readdirSync recursive rather than fs.globSync, which does not exist
 * on Node 20 — and package.json still allows Node ^20.19.0.
 * Excludes __tests__ directories so test files are never scanned — test files
 * may contain hex fixtures or dark: assertions that would spuriously fail guards.
 */
function listComponents() {
  let entries
  try {
    entries = readdirSync(COMPONENTS_DIR, { recursive: true })
  } catch (err) {
    // ENOENT is the legitimate Phase 1 state: the directory does not exist
    // yet. Anything else (permissions, a non-directory at that path, ...) is
    // a real problem and must not be swallowed into a silent vacuous pass.
    if (err.code === 'ENOENT') return []
    throw err
  }
  // The directory exists, so it must actually contain something — zero
  // entries here means the path or filter is wrong, not that there is
  // nothing to guard.
  expect(entries.length, `${COMPONENTS_DIR} exists but is empty`).toBeGreaterThan(0)
  return entries
    .filter((name) => /\.(vue|js)$/.test(String(name)) && !String(name).includes('__tests__'))
    .map((name) => join(COMPONENTS_DIR, String(name)))
}

/**
 * Lists .vue and .js files under the demo page (chrome + sections), excluding
 * __tests__. Kept separate from listComponents(): only the dark: scan widens
 * to cover this directory, never the raw-hex scan — spec Appendix D.1's
 * INNER SURFACES captions and the Dark mode rule-card bodies quote hex
 * values as visible page content, so demo/ must stay exempt from that guard
 * (review Finding 5).
 */
function listDemoFiles() {
  let entries
  try {
    entries = readdirSync(DEMO_DIR, { recursive: true })
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
  expect(entries.length, `${DEMO_DIR} exists but is empty`).toBeGreaterThan(0)
  return entries
    .filter((name) => /\.(vue|js)$/.test(String(name)) && !String(name).includes('__tests__'))
    .map((name) => join(DEMO_DIR, String(name)))
}

/** Every .vue and .js file in the design system, excluding test files. */
function listDesignSystemFiles() {
  try {
    return readdirSync(DESIGN_SYSTEM_DIR, { recursive: true })
      .map((name) => String(name))
      .filter((name) => /\.(vue|js)$/.test(name) && !name.includes('__tests__'))
      .map((name) => join(DESIGN_SYSTEM_DIR, name))
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
}

describe('findRawHex', () => {
  it('catches 3, 6 and 8 digit hex colours', () => {
    expect(findRawHex('color: #fff')).toEqual(['#fff'])
    expect(findRawHex('color: #1E2532')).toEqual(['#1E2532'])
    expect(findRawHex('color: #1E253280')).toEqual(['#1E253280'])
  })

  it('catches hex inside a style attribute', () => {
    expect(findRawHex('<div style="background:#177236">')).toEqual(['#177236'])
  })

  it('allows var() references', () => {
    expect(findRawHex('color: var(--ink-900)')).toEqual([])
  })

  it('allows anchor hrefs and HTML entities', () => {
    expect(findRawHex('<a href="#main">')).toEqual([])
    expect(findRawHex('&#39;')).toEqual([])
  })

  it('excludes numeric HTML entities', () => {
    expect(findRawHex('&#8217;')).toEqual([])
    expect(findRawHex('&#160;')).toEqual([])
  })

  it('catches genuine hex colours not preceded by &', () => {
    expect(findRawHex('color: #8217ab')).toEqual(['#8217ab'])
  })
})

describe('findRawColorFunctions', () => {
  it('catches a raw colour on every property that paints one', () => {
    expect(findRawColorFunctions('a { background: rgb(255 255 255 / 0.75); }')).toHaveLength(1)
    expect(findRawColorFunctions('a { border-color: rgba(1, 2, 3, 0.5); }')).toHaveLength(1)
    // The one that made the first version of this guard vacuous.
    expect(
      findRawColorFunctions('a { border-bottom: 1px solid rgb(16 24 40 / 0.06); }'),
    ).toHaveLength(1)
    expect(findRawColorFunctions('a { outline: 2px solid rgba(0,0,0,.2); }')).toHaveLength(1)
    expect(findRawColorFunctions('a { color: rgb(0 0 0); }')).toHaveLength(1)
  })

  it('leaves box-shadow alone', () => {
    // Deliberately out of scope: a neutral dark shadow reads as nothing on a
    // dark surface rather than as the wrong colour, and the redline gives
    // its shadow literals no token.
    expect(findRawColorFunctions('a { box-shadow: 0 1px 2px rgba(16,24,40,.08); }')).toEqual([])
  })

  it('allows a themed colour-mix', () => {
    expect(
      findRawColorFunctions(
        'a { background: color-mix(in srgb, var(--surface) 75%, transparent); }',
      ),
    ).toEqual([])
    // even when the mix names an rgb() explicitly
    expect(
      findRawColorFunctions('a { color: color-mix(in srgb, rgb(1 2 3) 50%, transparent); }'),
    ).toEqual([])
  })

  it('allows var() references', () => {
    expect(findRawColorFunctions('a { background: var(--surface); }')).toEqual([])
  })
})

describe('findDarkVariants', () => {
  it('catches a dark: utility in a class attribute', () => {
    expect(findDarkVariants('class="bg-surface dark:bg-black"')).toEqual(['dark:bg-black'])
  })

  it('catches stacked dark: variants', () => {
    expect(findDarkVariants('class="md:dark:bg-black"')).toEqual(['dark:bg-black'])
    expect(findDarkVariants('class="hover:dark:text-white"')).toEqual(['dark:text-white'])
    expect(findDarkVariants('class="group-hover:dark:bg-black"')).toEqual(['dark:bg-black'])
  })

  it('captures the full utility with arbitrary values', () => {
    expect(findDarkVariants('class="dark:bg-[#fff]"')).toEqual(['dark:bg-[#fff]'])
  })

  it('allows the word dark outside a variant', () => {
    expect(findDarkVariants('const isDark = true')).toEqual([])
    expect(findDarkVariants('// dark mode is a palette swap')).toEqual([])
  })
})

/**
 * A colour written as rgb()/rgba() slipped past the raw-hex scan entirely,
 * which is how a white schematic header, a white spinner track and a white
 * chip mark all survived into the dark theme. This finds the ones used as a
 * COLOUR — background, color, border-color — where a light literal on a dark
 * surface is visibly wrong. box-shadow is deliberately out of scope: a
 * neutral dark shadow reads as nothing on a dark surface rather than as the
 * wrong colour, and the redline gives its literals no token.
 */
export function findRawColorFunctions(source) {
  const found = []
  // Anchor on a DECLARATION start so the property name is known, rather than
  // scanning loosely for rgb(: that is what let `border-bottom` slip through
  // a first version of this and made the whole guard vacuous.
  const re =
    /(?:^|[;{])\s*((?:background|border|outline|color|fill|stroke)[a-z-]*)\s*:\s*([^;{}]*?\brgba?\([^)]*\)[^;{}]*)/gm
  for (const match of source.matchAll(re)) {
    // color-mix(in srgb, var(--token) …) is themed, not a literal.
    if (match[2].includes('color-mix')) continue
    found.push(`${match[1]}: ${match[2].trim()}`)
  }
  return found
}

/**
 * Files whose rgb()/rgba() is genuinely theme-agnostic. Each needs a reason:
 * the default assumption is that a literal colour is wrong in the other
 * theme until someone says why it is not.
 */
const RAW_COLOR_ALLOWED = {
  'demo/chrome/SwatchGrid.vue':
    'a hairline drawn OVER an arbitrary swatch colour — it must be a neutral ' +
    'translucent black regardless of theme, and no token can express that',
  'demo/chrome/SpecTables.vue': 'same: a swatch tile border over an arbitrary redline colour',
}

describe('design-system components', () => {
  // Passes vacuously until phase 2 adds components, then guards every file.
  it('contain no raw hex colours and no dark: variants', () => {
    const violations = []
    for (const file of listComponents()) {
      const source = readFileSync(file, 'utf8')
      for (const hex of findRawHex(source)) violations.push(`${file}: raw hex ${hex}`)
    }
    // The dark: scan alone widens to the demo page (chrome + sections): about
    // 1,100 lines of markup there sat outside listComponents() and were never
    // scanned at all (review Finding 5). The raw-hex scan stays
    // components-only — see listDemoFiles() above for why.
    for (const file of [...listComponents(), ...listDemoFiles()]) {
      const source = readFileSync(file, 'utf8')
      for (const v of findDarkVariants(source)) violations.push(`${file}: ${v}`)
    }
    expect(violations).toEqual([])
  })

  it('write no colour as a raw rgb()/rgba(), or say why', () => {
    // The hex scan never saw these. A white literal is invisible in light
    // mode and glaring in dark, which is exactly how three of them shipped:
    // a schematic header, a spinner track and a chip mark.
    const violations = []
    for (const file of [...listComponents(), ...listDemoFiles()]) {
      const relative = file.slice(file.indexOf('design-system/') + 'design-system/'.length)
      if (RAW_COLOR_ALLOWED[relative]) continue
      const source = readFileSync(file, 'utf8')
      for (const c of findRawColorFunctions(source)) violations.push(`${relative}: ${c}`)
    }
    expect(violations).toEqual([])
  })

  it('keeps the raw-colour allowlist honest', () => {
    // An entry for a file that no longer has one is a lie the next reader
    // would trust.
    const all = [...listComponents(), ...listDemoFiles()]
    for (const [relative, reason] of Object.entries(RAW_COLOR_ALLOWED)) {
      const file = all.find((f) => f.endsWith(relative))
      expect(file, `allowlisted file not found: ${relative}`).toBeDefined()
      expect(
        findRawColorFunctions(readFileSync(file, 'utf8')).length,
        `${relative} no longer has a raw colour — drop it from the allowlist`,
      ).toBeGreaterThan(0)
      expect(reason.length).toBeGreaterThan(20)
    }
  })

  it('widens the dark: scan to the demo directory but keeps the raw-hex scan components-only', () => {
    // Anchor to a known demo file (mirrors the __tests__-exclusion proof
    // below): the dark: scan must see it, the raw-hex scan must not, even
    // though demo/ genuinely contains hex text (Appendix D.1 swatch
    // captions) that would trip the hex guard if it were ever widened too.
    const knownDemoFile = join(DEMO_DIR, 'chrome/DemoCard.vue')
    expect(readdirSync(join(DEMO_DIR, 'chrome'))).toContain('DemoCard.vue')

    const demoFiles = listDemoFiles()
    expect(demoFiles).toContain(knownDemoFile)
    for (const file of demoFiles) {
      expect(file).not.toMatch(/__tests__/)
    }

    expect(listComponents()).not.toContain(knownDemoFile)
  })

  it('excludes __tests__ directories from scanning', () => {
    // A vacuous version of this test would pass even if listComponents()
    // returned an empty list. Anchor it to a test file that is known to
    // exist on disk, and assert it is both present on disk and absent from
    // the scanned list — that only holds if the __tests__ filter actually
    // ran.
    const knownTestFile = join(COMPONENTS_DIR, 'feedback/__tests__/Chip.spec.js')
    expect(readdirSync(join(COMPONENTS_DIR, 'feedback/__tests__'))).toContain('Chip.spec.js')

    const components = listComponents()
    expect(components).not.toContain(knownTestFile)
    for (const file of components) {
      expect(file).not.toMatch(/__tests__/)
    }
  })
})

describe('findAppImports', () => {
  it('catches an alias import from the app components directory', () => {
    expect(findAppImports("import Foo from '@/components/Foo.vue'")).toEqual([
      '@/components/Foo.vue',
    ])
  })

  it('catches a relative import that climbs into app components', () => {
    expect(findAppImports("import Foo from '../../components/Foo.vue'")).toEqual([
      '../../components/Foo.vue',
    ])
  })

  // Lazy component loading (defineAsyncComponent + dynamic import) is the
  // dominant idiom future components will use, so these six forms are the
  // realistic violations a `from`-clause-only regex would miss.
  it('catches a dynamic import wrapped in defineAsyncComponent', () => {
    expect(findAppImports("defineAsyncComponent(() => import('@/components/Foo.vue'))")).toEqual([
      '@/components/Foo.vue',
    ])
  })

  it('catches an awaited dynamic import', () => {
    expect(findAppImports("await import('../../components/Foo.vue')")).toEqual([
      '../../components/Foo.vue',
    ])
  })

  it('catches a side-effect import', () => {
    expect(findAppImports("import '@/components/styles.css'")).toEqual(['@/components/styles.css'])
  })

  it('catches a bare import with no sub-path', () => {
    expect(findAppImports("import '@/components'")).toEqual(['@/components'])
  })

  it('catches a require() call', () => {
    expect(findAppImports("require('@/components/Foo')")).toEqual(['@/components/Foo'])
  })

  it('catches the bare src/components path form', () => {
    expect(findAppImports("import Foo from 'src/components/Foo.vue'")).toEqual([
      'src/components/Foo.vue',
    ])
  })

  it('allows imports within the design system', () => {
    expect(findAppImports("import Chip from '../feedback/Chip.vue'")).toEqual([])
    expect(findAppImports("import { useTheme } from '@/design-system'")).toEqual([])
  })

  it('allows package imports', () => {
    expect(findAppImports("import { ref } from 'vue'")).toEqual([])
    expect(findAppImports("import { useDark } from '@vueuse/core'")).toEqual([])
  })

  it('allows a composable import that merely starts with @/comp', () => {
    expect(findAppImports("import { useThing } from '@/composables/useThing'")).toEqual([])
  })

  it('does not false-positive on a sibling directory named components-legacy', () => {
    expect(findAppImports("import Foo from '@/components-legacy/x'")).toEqual([])
  })

  it('allows prose mentioning "components"', () => {
    expect(findAppImports('// this file renders several components internally')).toEqual([])
  })
})

describe('design-system import direction', () => {
  // Spec §3.1: app code may import the design system; the design system may
  // never import app code, or it cannot be lifted into a package.
  it('never imports from src/components', () => {
    const violations = []
    for (const file of listDesignSystemFiles()) {
      const source = readFileSync(file, 'utf8')
      for (const spec of findAppImports(source)) violations.push(`${file}: ${spec}`)
    }
    expect(violations).toEqual([])
  })
})
