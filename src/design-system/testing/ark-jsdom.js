/**
 * jsdom shims and DOM-reset helper for tests that mount an Ark UI
 * select-family component (`@ark-ui/vue/select`, backed by `@zag-js/select`)
 * or its menu component (`@ark-ui/vue/menu`, backed by `@zag-js/menu`).
 * Extracted from `Select.spec.js` so `MultiSelect.spec.js` and
 * `InlineFilter.spec.js` (which mount the same select machine) and
 * `RowMenu.spec.js` (which mounts menu instead) import one shared module
 * instead of a separate copy each.
 *
 * Nothing here is portaled. An earlier version of this module and its
 * `resetArkPortals` export claimed Ark mounts select/menu content into a
 * `document.body` portal — false. Ark UI only portals when the caller
 * explicitly wraps content in its own `<Portal>` component; verified
 * against every file in `../components/selects/`, none imports or renders
 * one. Independently verified against the installed package: the compiled
 * `select-content.vue`, `select-positioner.vue`, `menu-content.vue` and
 * `menu-positioner.vue` each render a plain `ark.div` with no `Portal` or
 * `Teleport` anywhere in their own implementation. See `resetMountedDom`
 * below for what the reset actually does and why it is still needed.
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
 *   `menu.dom.mjs`) for the literal `.scrollTo(` call turns up zero matches
 *   — the only bare-`scrollTo` hits are two unrelated occurrences of the
 *   action name `scrollToHighlightedItem` in `menu.machine.mjs`, not a call
 *   to the method. `installArkJsdomShims` still stubs it unconditionally,
 *   since one function shims both machines' needs — harmless but inert when
 *   a spec mounts only `menu`.
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
 * Wipes document.body between tests. NOT a portal reset, despite this
 * module's former name for it (`resetArkPortals`) — see the file-level
 * docblock above: nothing here is portaled. SelectPositioner/MenuPositioner
 * render as an ordinary descendant of the component's own subtree, mounted
 * wherever the test attaches the wrapper (here, document.body via
 * `attachTo`), not into a separate portal target.
 *
 * The reset is still needed, for an ordinary reason: that content renders
 * unconditionally once Zag's presence machine reports `present`, gated by
 * presence rather than open/closed state — verified against the installed
 * package (select-content.vue, select-positioner.vue, menu-content.vue,
 * menu-positioner.vue): all four render unconditionally once `present`, and
 * nothing in a typical suite ever drives them back to "unmounted". A
 * wrapper left mounted (most tests in these files never call
 * wrapper.unmount()) therefore leaves its nodes in document.body for every
 * later test in the file — an assertion right after another mount would see
 * two instances' worth of nodes, not one.
 *
 * But because this works by deleting document.body's children directly
 * rather than through Vue's own unmount lifecycle, it does NOT stop
 * whatever a still-mounted wrapper's Zag machine actor is doing —
 * including any document-level listeners the machine attached (e.g. for
 * outside-click or Esc handling). Each spec file importing this also calls
 * `enableAutoUnmount(afterEach)` (from `@vue/test-utils`) so every wrapper
 * is properly unmounted through Vue's own lifecycle first; keep both — this
 * function alone does not replace that.
 */
export function resetMountedDom() {
  document.body.innerHTML = ''
}
