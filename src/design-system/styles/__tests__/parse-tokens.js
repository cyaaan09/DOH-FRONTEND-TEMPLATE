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
