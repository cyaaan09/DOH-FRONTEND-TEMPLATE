<script setup>
defineProps({
  selected: { type: Boolean, default: false },
})

defineEmits(['toggle'])
</script>

<template>
  <button
    type="button"
    class="filter-chip inline-flex items-center rounded-pill text-chip whitespace-nowrap transition-colors"
    :class="
      selected
        ? 'filter-chip--on bg-green-fill text-green-on-fill'
        : 'bg-surface border border-field text-ink-600'
    "
    :aria-pressed="selected ? 'true' : 'false'"
    @click="$emit('toggle')"
  >
    <slot />
  </button>
</template>

<style scoped>
/* Redline "Filter chip on" — 7px 13px padding, shadow. Redline "Filter chip
 * off" — white surface, 1px border-field border, ink-600 text at weight 500.
 * The selected-state shadow has no utility namespace — spec §4.2. */
.filter-chip {
  padding: 7px 13px;
  cursor: pointer;
}

.filter-chip--on {
  box-shadow: 0 1px 2px rgb(20 80 40 / 0.24);
}

.filter-chip:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
