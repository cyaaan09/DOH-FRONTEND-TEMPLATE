import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findDarkVariants, findRawHex } from '../guards'

const COMPONENTS_DIR = 'src/design-system/components'

/**
 * Lists .vue files under the components directory.
 * Uses readdirSync recursive rather than fs.globSync, which does not exist
 * on Node 20 — and package.json still allows Node ^20.19.0.
 */
function listComponents() {
  try {
    return readdirSync(COMPONENTS_DIR, { recursive: true })
      .filter((name) => String(name).endsWith('.vue'))
      .map((name) => join(COMPONENTS_DIR, String(name)))
  } catch {
    return [] // directory does not exist yet
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
})
