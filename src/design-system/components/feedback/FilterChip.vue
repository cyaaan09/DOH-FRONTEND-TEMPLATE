<script setup>
defineProps({
  selected: { type: Boolean, default: false },
})

// Redline "Filter chip" — a 13px checkbox-style mark inside the chip, ahead
// of the label at an 8px gap. One branch per state, each naming both
// properties it owns: selected is a white edge over a translucent white
// fill, unselected a grey edge over nothing.

defineEmits(['toggle'])
</script>

<template>
  <button
    type="button"
    class="filter-chip inline-flex items-center rounded-pill text-chip whitespace-nowrap transition-colors"
    :class="
      selected
        ? 'filter-chip--on border border-green-fill bg-green-fill text-green-on-fill'
        : 'border border-field bg-surface text-ink-600 font-medium'
    "
    :aria-pressed="selected ? 'true' : 'false'"
    @click="$emit('toggle')"
  >
    <span
      data-mark
      aria-hidden="true"
      class="filter-chip__mark flex-none"
      :class="selected ? 'filter-chip__mark--on' : 'filter-chip__mark--off'"
    />
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
 * The selected-state shadow has no utility namespace — spec §4.2.
 * BOTH states carry a 1px border. Only the unselected one did before, so a
 * chip lost 2px in each dimension the moment it was picked and the whole row
 * reflowed — the kind of defect that needs no wrong value to appear, just a
 * missing one. */
.filter-chip {
  gap: 8px;
  padding: 7px 13px;
  cursor: pointer;
  user-select: none;
}

.filter-chip__mark {
  width: 13px;
  height: 13px;
  border-radius: 4px;
  border-width: 1.8px;
  border-style: solid;
}

.filter-chip__mark--on {
  border-color: var(--green-on-fill);
  background: rgb(255 255 255 / 0.4);
}

.filter-chip__mark--off {
  border-color: var(--ink-100);
  background: transparent;
}

.filter-chip--on {
  box-shadow: 0 1px 2px rgb(20 80 40 / 0.24);
}

.filter-chip:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
