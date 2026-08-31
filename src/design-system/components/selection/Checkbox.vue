<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { CheckboxRoot, CheckboxControl, CheckboxLabel, CheckboxHiddenInput } from '@ark-ui/vue/checkbox'

const props = defineProps({
  /** Whether the box is checked. Ignored while `indeterminate` is true. */
  modelValue: { type: Boolean, default: false },
  /** The visible row label. */
  label: { type: String, required: true },
  /** Optional second line under the label. */
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  /**
   * Renders the mixed state. Exposed to assistive technology through the
   * native hidden input's `indeterminate` property, not an aria-checked
   * attribute — see Checkbox.spec.js "exposes the mixed state...".
   */
  indeterminate: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

// Ark models the tri-state as a value of true | false | 'indeterminate'.
const checked = computed(() => (props.indeterminate ? 'indeterminate' : props.modelValue))

// One branch per state, each setting every property it owns — never a base
// class plus an override, which is this project's recurring defect.
const boxClass = computed(() => {
  if (props.disabled) return 'bg-surface-disabled border-soft text-ink-200'
  if (props.indeterminate || props.modelValue)
    return 'bg-green-fill border-green-fill text-green-on-fill'
  return 'bg-surface border-ink-100 text-transparent'
})

// Ark keeps the native hidden input's `checked` DOM property in sync on every
// render, but `indeterminate` has no HTML attribute, so it only updates
// through @zag-js/vue's change-triggered watcher (`track()` wraps Vue's
// `watch()` without `immediate: true` — see @zag-js/vue/dist/track.mjs). A
// checkbox that *mounts* already indeterminate never gets that watcher fired
// — there is no prior value to change from — so `input.indeterminate` stays
// false and a screen reader announces it as merely unchecked. Owning the
// sync here for both mount and later prop changes means this does not depend
// on Ark's internal timing at all.
const hiddenInputRef = ref(null)
function syncIndeterminate() {
  const el = hiddenInputRef.value?.$el
  if (el) el.indeterminate = props.indeterminate
}
onMounted(syncIndeterminate)
watch(() => props.indeterminate, syncIndeterminate)
</script>

<template>
  <CheckboxRoot
    :checked="checked"
    :disabled="disabled"
    class="checkbox flex items-start"
    @checked-change="(details) => emit('update:modelValue', details.checked === true)"
  >
    <!-- Redline "Checkbox" — 17x17 from the shared control token, radius 5px,
         1.8px border set in the style block below. -->
    <CheckboxControl
      data-box
      class="checkbox__box grid h-check w-check flex-none place-items-center rounded-check border"
      :class="boxClass"
    >
      <!-- Redlines "Checkbox on" and "Indeterminate" — 10px/700 glyph, a dash
           for mixed. Decorative: the control itself carries the state. -->
      <span data-glyph aria-hidden="true" class="checkbox__glyph font-bold">{{
        indeterminate ? '–' : '✓'
      }}</span>
    </CheckboxControl>

    <span class="checkbox__text min-w-0">
      <!-- Redline "Label" — 13.5/400 ink-700, 10px from the box. -->
      <CheckboxLabel data-label class="checkbox__label block text-body text-ink-700">{{
        label
      }}</CheckboxLabel>
      <span v-if="hint" data-hint class="checkbox__hint block text-hint text-text-meta">{{
        hint
      }}</span>
    </span>

    <CheckboxHiddenInput ref="hiddenInputRef" />
  </CheckboxRoot>
</template>

<style scoped>
/* Redline "Checkbox" — 1.8px border. No border-width utility carries it. */
.checkbox__box {
  border-width: 1.8px;
  cursor: pointer;
}

/* Redline "Label" — gap 10px between box and text. */
.checkbox__text {
  margin-left: 10px;
}

/* Redlines "Checkbox on" / "Indeterminate" — glyph 10px. */
.checkbox__glyph {
  font-size: 10px;
  line-height: 1;
}

.checkbox[data-disabled] {
  cursor: not-allowed;
}

.checkbox:focus-within .checkbox__box {
  outline: none;
  box-shadow: var(--ring-focus);
}

.checkbox__hint {
  margin-top: 2px;
}
</style>
