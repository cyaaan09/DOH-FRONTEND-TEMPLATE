/**
 * Static detectors for the design system's two governing rules.
 * Used by tests, not shipped to the browser.
 */

// 3, 4, 6 or 8 hex digits followed by a non-word char. Two-digit sequences are
// excluded so HTML entities like &#39; do not match, and a fragment such as
// #main is ignored because `m` is not a hex digit. A hex-shaped fragment like
// #abc would false-positive — acceptable, since components reference var().
const RAW_HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z])/g

// A `dark:` Tailwind variant, anchored to a class-list boundary so prose and
// identifiers containing "dark" are not flagged. Written with a capture group
// rather than a lookbehind, which is not portable across JS engines.
// Catches stacked variants like md:dark:bg-black by including : in boundaries.
// Includes # for arbitrary values like dark:bg-[#fff].
const DARK_VARIANT = /(?:^|["'\s:])(dark:[\w[\]/.,%()#-]+)/g

/**
 * @param {string} source file contents
 * @returns {string[]} raw hex colour literals found
 */
export function findRawHex(source) {
  const results = []
  for (const match of source.matchAll(RAW_HEX)) {
    // Exclude HTML entities like &#8217; which are preceded by &
    if (match.index > 0 && source[match.index - 1] === '&') {
      continue
    }
    results.push(match[0])
  }
  return results
}

/**
 * @param {string} source file contents
 * @returns {string[]} `dark:` variant utilities found
 */
export function findDarkVariants(source) {
  return [...source.matchAll(DARK_VARIANT)].map((match) => match[1])
}

// An import whose specifier resolves into the app's own components
// directory. Matches the '@/components/...' alias, the bare
// 'src/components/...' path, and any relative path ending in a
// '../components/' segment — preceded by the keyword `from`, `import` or
// `require` (with an optional call-paren), so beyond a static from-clause
// this also catches: a dynamic specifier passed to defineAsyncComponent, an
// awaited dynamic specifier, a side-effect specifier with a stylesheet
// sub-path, a bare directory specifier with no sub-path at all (the
// trailing sub-path is optional), and a specifier passed to a CommonJS-style
// loader call. Lazy component loading is the dominant idiom future
// components will use, so the dynamic forms must be covered, not just
// static from-clauses. Written with a capture group rather than a
// lookbehind, which is not portable across JS engines.
//
// NOTE for maintainers: avoid writing a literal matching specifier (the
// keyword immediately followed by a quoted components path) anywhere in
// this file's own source, including in comments — the design-system-wide
// import-direction test below scans every .js file, itself included, and a
// literal example here would trip its own guard.
const APP_IMPORT =
  /(?:from|import|require)\s*\(?\s*['"]((?:@\/components|src\/components|(?:\.\.\/)+components)(?:\/[^'"]*)?)['"]/g

/**
 * @param {string} source file contents
 * @returns {string[]} import specifiers that reach into src/components
 */
export function findAppImports(source) {
  return [...source.matchAll(APP_IMPORT)].map((match) => match[1])
}
