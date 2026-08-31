<script setup>
/**
 * A toggle chip with a checkbox-style mark. Both states carry a border, so selecting
 * one does not change its width and reflow the row.
 */
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
  /* Same reasoning as Button's spinner track: the mark sits ON the filled
     green, so it follows that fill's own foreground rather than white. */
  background: color-mix(in srgb, var(--green-on-fill) 40%, transparent);
}

.filter-chip__mark--off {
  border-color: var(--ink-100);
  background: transparent;
}

.filter-chip--on {
  /* Redline "Filter chip on · shadow 0 1px 2px rgba(20,80,40,.24)" — the
     same family as --sh-primary (.25). Taking the token rather than the
     literal costs 0.01 of alpha and buys the dark theme's `none`, which the
     Dark mode group's Elevation row requires of every button-like control. */
  box-shadow: var(--sh-primary);
}

.filter-chip:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
