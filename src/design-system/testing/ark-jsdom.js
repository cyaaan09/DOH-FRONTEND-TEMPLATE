/**
 * jsdom shims and portal-reset helper for tests that mount an Ark UI
 * select-family component (`@ark-ui/vue/select`, backed by `@zag-js/select`).
 * Extracted from `Select.spec.js` so `MultiSelect.spec.js` — and later
 * `InlineFilter.spec.js`, which mounts the same select machine — import one
 * shared module instead of a third copy of this block. `RowMenu` sits on
 * `@zag-js/menu` instead: it shares select's dependency on `@zag-js/popper`
 * (so `installArkJsdomShims`'s ResizeObserver half will apply there too),
 * but its own scroll-into-view effect is keyboard-only and goes through
 * `scrollIntoView`, not `Element.scrollTo` — confirm what that needs, if
 * anything, against the installed source rather than assuming this module's
 * current shims are a complete fit.
 */

/**
 * jsdom implements neither of these, and Zag's select machine calls both
 * during ordinary interaction, not anything specific to one component:
 * - ResizeObserver drives floating-ui's autoUpdate while the panel is open
 *   (@zag-js/popper's get-placement.mjs hardcodes `elementResize: true` in
 *   the autoUpdate options it hands to floating-ui, so this fires
 *   unconditionally, not only when a component opts in).
 * - Element.scrollTo runs unconditionally when the panel closes
 *   (select.machine.mjs, the "open" state's exit action scrollContentToTop),
 *   to reset scroll position for next time.
 * Unstubbed, the first rejects a promise jsdom can't fulfil; the second
 * throws synchronously inside the click handler and silently swallows the
 * value-change emit that should follow it. Verified against the installed
 * @zag-js/select and @zag-js/popper source — this is a jsdom API gap, not a
 * behaviour to design around, so it is shimmed here rather than routed
 * around in the component. Call once per spec file, before any component
 * mounts (idempotent, so re-importing across files is harmless).
 */
export function installArkJsdomShims() {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
  if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = () => {}
  }
}

/**
 * Ark mounts a select/menu content's portal into document.body as soon as
 * the component mounts, gated by a presence machine rather than by
 * open/closed state — verified against the installed package
 * (select-content.vue, select-positioner.vue): both render unconditionally
 * once `present`, and nothing in a typical suite ever drives them back to
 * "unmounted". A wrapper left attached (most tests never call
 * wrapper.unmount()) therefore leaves its portaled nodes in document.body
 * for every later test in the file — an assertion right after another
 * mount would see two instances' worth of nodes, not one. Call this in an
 * `afterEach` so each test's document-level queries see only its own
 * instance.
 */
export function resetArkPortals() {
  document.body.innerHTML = ''
}
