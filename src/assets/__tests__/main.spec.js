import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Regression test for the Phase 1 review finding: base.css was imported
 * with no layer, so its unlayered normal declarations beat every Tailwind
 * layer (theme, base, components, utilities) — not just preflight. A link
 * rendered `--green-text` instead of `--ink-600`, a `font-mono` input
 * silently rendered in the sans font, and `input:focus{outline:none}`
 * would have killed every `focus:outline-*` utility.
 *
 * base.css must be imported into `layer(base)` explicitly. That keeps it
 * winning over Tailwind preflight — both share `@layer base` and ours is
 * imported later within that layer — while later layers (components,
 * utilities) correctly continue to win over it.
 */
function readMainCss() {
  // Deliberately not `new URL(..., import.meta.url)` for the asset path
  // itself: Vite statically intercepts that call pattern and rewrites it
  // to a dev-server URL, which does not resolve as a filesystem path under
  // the jsdom test environment. node:path avoids that transform.
  const testsDir = dirname(fileURLToPath(import.meta.url))
  return readFileSync(join(testsDir, '..', 'main.css'), 'utf8')
}

describe('main.css layering', () => {
  const css = readMainCss()

  it('imports base.css into layer(base), not unlayered', () => {
    expect(css).toMatch(
      /@import\s+['"][^'"]*\/design-system\/styles\/base\.css['"]\s+layer\(base\)\s*;/,
    )
  })

  it('does not import base.css without a layer', () => {
    // A bare import (no `layer(...)` before the semicolon) is the exact
    // regression: unlayered rules beat every @layer, including utilities.
    const bareImport = /@import\s+['"][^'"]*\/design-system\/styles\/base\.css['"]\s*;/
    expect(bareImport.test(css)).toBe(false)
  })

  it('imports tokens and theme before base, so bridged vars resolve', () => {
    // Only the @import statements themselves, not prose mentions of these
    // filenames elsewhere in the file (e.g. this file's own header comment).
    const imported = [
      ...css.matchAll(/@import\s+['"][^'"]*\/design-system\/styles\/([\w.]+)['"]/g),
    ].map((match) => match[1])
    const order = ['tokens.css', 'tokens.dark.css', 'theme.css', 'base.css'].map((name) =>
      imported.indexOf(name),
    )
    expect(order.every((i) => i !== -1)).toBe(true)
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })
})
