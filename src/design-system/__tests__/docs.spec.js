import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { collect, render } from '../../../scripts/build-api-docs.mjs'

/**
 * The consumer docs are only worth having if they are true. Two ways they stop
 * being true, and one test each:
 *
 *   - the generated reference goes stale when a prop changes, and
 *   - the hand-written guide names a component that does not exist.
 *
 * The second is the one that actually misleads a reader: a wrong prop default
 * is a puzzle, but `import { Stack }` is a crash on their first attempt. It has
 * already happened once in this guide, and this test is why it did not ship.
 */
const read = (path) => readFileSync(path, 'utf8')
const INDEX = read('src/design-system/index.js')
const GUIDE = read('docs/design-system/README.md')
const API = read('docs/design-system/api.md')

const exported = new Set([
  ...[...INDEX.matchAll(/export \{ default as (\w+)/g)].map((m) => m[1]),
  ...[...INDEX.matchAll(/export \{ (\w+) \}/g)].map((m) => m[1]),
])

describe('design system documentation', () => {
  it('keeps the generated reference in sync with the components', () => {
    // Regenerate with: node scripts/build-api-docs.mjs
    expect(API).toBe(render(collect()))
  })

  it('documents every exported component', () => {
    const documented = new Set([...API.matchAll(/^### (\w+)$/gm)].map((m) => m[1]))
    const components = [...exported].filter((name) => !['useTheme', 'GAPS'].includes(name))
    expect(components.filter((name) => !documented.has(name))).toEqual([])
  })

  it('gives every component a description, not just a props table', () => {
    // A reference entry with no prose tells a reader the prop names they could
    // have read off the source anyway. The description is the part that says
    // which component to reach for.
    expect(collect().filter((c) => !c.description).map((c) => c.name)).toEqual([])
  })

  it('never names a component the design system does not export', () => {
    // Every identifier the guide imports from @/design-system, in any example.
    const imported = [...GUIDE.matchAll(/import \{([^}]+)\} from '@\/design-system'/g)]
      .flatMap((m) => m[1].split(','))
      .map((name) => name.trim())
      .filter(Boolean)
    expect(imported.length).toBeGreaterThan(0)
    expect(imported.filter((name) => !exported.has(name))).toEqual([])
  })

  it('links only to files that exist', () => {
    const links = [...GUIDE.matchAll(/\]\((\.\.?\/[^)#]+)\)/g)].map((m) => m[1])
    expect(links.length).toBeGreaterThan(0)
    for (const target of links) {
      const path = target.startsWith('../')
        ? `docs/${target.slice(3)}`
        : `docs/design-system/${target.slice(2)}`
      expect(() => read(path), `broken link: ${target}`).not.toThrow()
    }
  })
})
