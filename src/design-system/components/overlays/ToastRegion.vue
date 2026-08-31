<script setup>
import { Toaster } from '@ark-ui/vue/toast'
import Toast from './Toast.vue'

defineProps({
  /**
   * The store from Ark's `createToaster`. The artifact's numbers are
   * `{ placement: 'bottom-end', gap: 10, offsets: '16px', duration: 5000,
   * max: 3 }` — bottom-right, newest on top, 5s auto-dismiss, and the
   * "Three at most" rule the section itself states.
   */
  toaster: { type: Object, required: true },
  /**
   * Position the region inside the nearest positioned ancestor instead of
   * the viewport. Real apps want the default (fixed); the demo needs it
   * contained inside its "App surface" panel.
   */
  contained: { type: Boolean, default: false },
  dismissLabel: { type: String, default: 'Dismiss' },
})
</script>

<template>
  <Toaster
    v-slot="toast"
    data-toast-region
    class="toastregion"
    :class="{ 'toastregion--contained': contained }"
    :toaster="toaster"
  >
    <Toast :toast="toast" :dismiss-label="dismissLabel" />
  </Toaster>
</template>

<style scoped>
/* Redline "Toast region" — 372px wide, never closer than 16px to either
   edge of whatever contains it. Ark supplies placement, gap and the
   aria-live region; width is ours. */
.toastregion {
  width: 372px;
  max-width: calc(100% - 32px);
}

/* Ark writes `position: fixed` and MAX_Z_INDEX as INLINE styles from
   getGroupPlacementStyle, so containment cannot be expressed by ordinary
   specificity — overriding a third party's inline style is the one case
   !important is the correct tool rather than a smell. --z-popover (12) is
   the artifact's own value for this region inside the demo surface. */
.toastregion--contained {
  position: absolute !important;
  z-index: var(--z-popover) !important;
}
</style>
