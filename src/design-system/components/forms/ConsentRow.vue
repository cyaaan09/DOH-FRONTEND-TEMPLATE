<script setup>
import Checkbox from '../selection/Checkbox.vue'

/**
 * Redline "Consent row · --surface-card-muted · 1px --divider · radius 10px ·
 * pad 12px 14px · 17px checkbox + 13px copy".
 *
 * Its own sunken block rather than another field in the grid: a certification
 * is a different kind of act from filling a value in, and the surface says so
 * before the copy does.
 */
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div data-consent class="consent">
    <Checkbox
      :model-value="modelValue"
      :label="label"
      :hint="hint"
      @update:model-value="(v) => $emit('update:modelValue', v)"
    />
  </div>
</template>

<style scoped>
.consent {
  padding: 12px 14px;
  border: 1px solid var(--divider);
  border-radius: 10px;
  background: var(--surface-card-muted);
}
</style>
