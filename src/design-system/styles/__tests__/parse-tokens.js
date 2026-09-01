import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/**
 * Extracts `--name: value` declarations from a CSS block.
 * Comments are stripped first so commented-out tokens are not counted.
 * @returns {Map<string, string>} token name (without `--`) → trimmed value
 */
export function parseTokens(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const tokens = new Map()
  for (const match of withoutComments.matchAll(/--([\w-]+)\s*:\s*([^;}]+)/g)) {
    tokens.set(match[1], match[2].trim())
  }
  return tokens
}

/** Reads a file from src/design-system/styles/ */
export function readStyle(name) {
  // Deliberately not `new URL(..., import.meta.url)`: Vite statically
  // intercepts that exact call pattern as an asset reference and rewrites it
  // to a dev-server URL (http://localhost:...), which then fails to resolve
  // as a filesystem path under the jsdom test environment. Building the path
  // with node:path instead avoids that transform.
  const testsDir = dirname(fileURLToPath(import.meta.url))
  return readFileSync(join(testsDir, '..', name), 'utf8')
}

/**
 * Reads the design-system-conformance spec markdown
 * (docs/superpowers/specs/2026-08-29-design-system-design.md), so a test can
 * diff the spec's own Appendix code blocks against the shipped CSS files.
 * Same `node:path` reasoning as readStyle — no `new URL(..., import.meta.url)`.
 */
export function readSpec() {
  const testsDir = dirname(fileURLToPath(import.meta.url))
  return readFileSync(
    join(
      testsDir,
      '..',
      '..',
      '..',
      '..',
      'docs',
      'superpowers',
      'specs',
      '2026-08-29-design-system-design.md',
    ),
    'utf8',
  )
}

/**
 * Extracts the content of the first ```css fenced block that appears after
 * `heading` in `markdown`. Uses plain string search (indexOf), not regex, so
 * this stays simple and needs no lookbehind.
 */
export function extractCssBlockAfter(markdown, heading) {
  const headingIndex = markdown.indexOf(heading)
  if (headingIndex === -1) throw new Error(`heading not found in spec: ${heading}`)
  const fenceStart = markdown.indexOf('```css', headingIndex)
  if (fenceStart === -1) throw new Error(`no css fence after heading: ${heading}`)
  const contentStart = markdown.indexOf('\n', fenceStart) + 1
  const fenceEnd = markdown.indexOf('```', contentStart)
  if (fenceEnd === -1) throw new Error(`unterminated css fence after heading: ${heading}`)
  return markdown.slice(contentStart, fenceEnd)
}
