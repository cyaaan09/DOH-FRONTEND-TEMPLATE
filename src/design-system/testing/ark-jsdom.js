/**
 * jsdom shims and portal-reset helper for tests that mount an Ark UI
 * select-family component (`@ark-ui/vue/select`, backed by `@zag-js/select`)
 * or its menu component (`@ark-ui/vue/menu`, backed by `@zag-js/menu`).
 * Extracted from `Select.spec.js` so `MultiSelect.spec.js` and
 * `InlineFilter.spec.js` (which mount the same select machine) and
 * `RowMenu.spec.js` (which mounts menu instead) import one shared module
 * instead of a separate copy each.
 *
 * `menu`'s needs were an open question when this module was first written
 * (Task 3); Task 5 settled them empirically, then confirmed each against the
 * installed source — see `RowMenu.spec.js`'s header comment and
 * `.superpowers/sdd/2026-08-30-dropdowns-section/task-5-report.md` ("Issues
 * or concerns" #1) for the full trace:
 * - **ResizeObserver is required by `menu` too.** `@zag-js/popper`'s
 *   get-placement.mjs hardcodes `elementResize: true` in the autoUpdate
 *   options it hands to floating-ui, bypassing floating-ui's own
 *   feature-detect — this fires unconditionally for both machines, since
 *   `menu.machine.mjs` calls the same shared `getPlacement()` popper export
 *   that `select.machine.mjs` does.
 * - **`Element.scrollTo` is a `select`-only need.** Grepping the installed
 *   `@zag-js/menu` package (`menu.machine.mjs`, `menu.connect.mjs`,
 *   `menu.dom.mjs`) for `scrollTo` turns up zero matches.
 *   `installArkJsdomShims` still stubs it unconditionally, since one
 *   function shims both machines' needs — harmless but inert when a spec
 *   mounts only `menu`.
 * - **No `scrollIntoView` shim is needed for `menu`, either.**
 *   `menu.machine.mjs` does call it (`scrollToHighlightedItem`, a
 *   keyboard-only action, via `@zag-js/dom-query`'s `scrollIntoView`
 *   wrapper), but that wrapper gates on `isScrollable(rootEl)`, which reads
 *   `scrollHeight`/`clientHeight`/`scrollWidth`/`clientWidth` — always 0
 *   under jsdom's zero-layout metrics — so the gate is always false and the
 *   native (jsdom-missing) method is never actually invoked.
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
