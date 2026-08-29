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
        : 'bg-surface border border-field text-ink-600 font-medium'
    "
    :aria-pressed="selected ? 'true' : 'false'"
    @click="$emit('toggle')"
  >
    <slot />
  </button>
</template>

<style scoped>
/* Redline "Filter chip on" — 7px 13px padding, shadow. States no weight, so
 * it keeps the chip family's bundled 700 from text-chip — an unstated value
 * is not ours to invent, so the selected state is left alone.
 * Redline "Filter chip off" — white surface, 1px border-field border,
 * ink-600 text at weight 500: font-medium overrides text-chip's bundled 700
 * on the unselected branch only, the same way Button.vue's font-bold
 * overrides text-body's bundled weight. The on/off asymmetry is intentional,
 * not a missed case — do not "even it out" by adding font-medium to both.
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
