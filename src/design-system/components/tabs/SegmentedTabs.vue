<script setup>
import {
  SegmentGroupRoot,
  SegmentGroupItem,
  SegmentGroupItemText,
  SegmentGroupItemHiddenInput,
} from '@ark-ui/vue/segment-group'

defineProps({
  /** The options to choose between, in display order. */
  options: { type: Array, required: true },
  /** The selected option. */
  modelValue: { type: String, required: true },
  /**
   * Names the group for assistive technology. NOT rendered on screen — a
   * segmented control sits under a heading that already says what it filters.
   */
  label: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <SegmentGroupRoot
    orientation="horizontal"
    :model-value="modelValue"
    :aria-label="label"
    class="segments inline-flex items-center bg-surface-muted rounded-field"
    @value-change="(details) => emit('update:modelValue', details.value)"
  >
    <SegmentGroupItem
      v-for="option in options"
      :key="option"
      :value="option"
      data-segment
      class="segments__item cursor-pointer whitespace-nowrap text-field-label rounded-tile"
      :class="
        option === modelValue
          ? 'segments__item--on bg-surface font-bold text-text-header'
          : 'bg-transparent font-medium text-text-meta'
      "
    >
      <SegmentGroupItemText>{{ option }}</SegmentGroupItemText>
      <SegmentGroupItemHiddenInput />
    </SegmentGroupItem>
  </SegmentGroupRoot>
</template>

<style scoped>
/* Redline "Segmented shell" — pad 3px, gap 6px. */
.segments {
  padding: 3px;
  gap: 6px;
}

.segments__item {
  padding: 6px 12px;
}

/* Redline "Segment on" — the lift. No shadow token carries this value:
 * --sh-card is the same geometry at half the opacity, so using it would be
 * visibly wrong. Left literal here rather than added to the frozen token
 * layer, which is diffed against the spec appendix. */
.segments__item--on {
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.08);
}

.segments__item:focus-within {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
