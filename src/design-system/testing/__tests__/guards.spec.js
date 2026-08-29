import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findAppImports, findDarkVariants, findRawHex } from '../guards'

const COMPONENTS_DIR = 'src/design-system/components'
const DESIGN_SYSTEM_DIR = 'src/design-system'

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

describe('design-system components', () => {
  // Passes vacuously until phase 2 adds components, then guards every file.
  it('contain no raw hex colours and no dark: variants', () => {
    const violations = []
    for (const file of listComponents()) {
      const source = readFileSync(file, 'utf8')
      for (const hex of findRawHex(source)) violations.push(`${file}: raw hex ${hex}`)
      for (const v of findDarkVariants(source)) violations.push(`${file}: ${v}`)
    }
    expect(violations).toEqual([])
  })

  it('excludes __tests__ directories from scanning', () => {
    const components = listComponents()
    // Assert that no scanned file contains __tests__ in its path
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

  it('allows imports within the design system', () => {
    expect(findAppImports("import Chip from '../feedback/Chip.vue'")).toEqual([])
    expect(findAppImports("import { useTheme } from '@/design-system'")).toEqual([])
  })

  it('allows package imports', () => {
    expect(findAppImports("import { ref } from 'vue'")).toEqual([])
    expect(findAppImports("import { useDark } from '@vueuse/core'")).toEqual([])
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
