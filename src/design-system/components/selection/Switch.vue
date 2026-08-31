<script setup>
import { computed } from 'vue'
import {
  SwitchRoot,
  SwitchControl,
  SwitchThumb,
  SwitchLabel,
  SwitchHiddenInput,
} from '@ark-ui/vue/switch'

const props = defineProps({
  /** Whether the switch is on. */
  modelValue: { type: Boolean, default: false },
  /** The visible row label. */
  label: { type: String, required: true },
  /** Optional second line under the label. */
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

// One branch per state, each setting the property it owns — never a base
// class plus an override, which is this project's recurring defect. Redline
// "Track on / off": --green-fill on, --border-field off (the bridge exposes
// the border-field token as `bg-field`; `bg-border-field` emits nothing),
// --ink-100 disabled.
const trackClass = computed(() => {
  if (props.disabled) return 'bg-ink-100'
  if (props.modelValue) return 'bg-green-fill'
  return 'bg-field'
})
</script>

<template>
  <SwitchRoot
    :checked="modelValue"
    :disabled="disabled"
    class="switch flex items-start"
    @checked-change="(details) => emit('update:modelValue', details.checked)"
  >
    <!-- Redline "Switch track" — 38x22px, radius 999px (the rounded-pill
         utility), pad 2px; geometry set in the style block below since no
         token carries it. The knob's position (data-state driven) lives
         there too. -->
    <SwitchControl data-track class="switch__track flex-none rounded-pill" :class="trackClass">
      <!-- Redline "Knob" — 18px circle on the surface colour (bg-surface),
           not the checkmark-on-green white — the two whites diverge in dark
           mode. Size and shadow have no token and are set below. -->
      <SwitchThumb data-knob class="switch__knob bg-surface rounded-pill" />
    </SwitchControl>

    <span class="switch__text min-w-0">
      <!-- Redline "Label" — 13.5/400 ink-700, 10px from the track. -->
      <SwitchLabel data-label class="switch__label block text-body text-ink-700">{{
        label
      }}</SwitchLabel>
      <span v-if="hint" data-hint class="switch__hint block text-hint text-text-meta">{{
        hint
      }}</span>
    </span>

    <SwitchHiddenInput />
  </SwitchRoot>
</template>

<style scoped>
/* Redline "Switch track" — 38x22px, pad 2px. Flex centres the knob in the
   padding box; justify-content (below) slides it between the two states,
   the same mechanism Appendix C's motion row names for this control. */
.switch__track {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 38px;
  height: 22px;
  padding: 2px;
  cursor: pointer;
}

.switch__track[data-state='checked'] {
  justify-content: flex-end;
}

.switch__track[data-disabled] {
  cursor: not-allowed;
}

/* Redline "Knob" — 18px circle; shadow 0 1px 2px rgba(16,24,40,.2). No
   shadow token is close (--sh-card is .04), so the literal is correct here
   and must not be replaced with --sh-card. */
.switch__knob {
  width: 18px;
  height: 18px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.2);
}

/* Redline "Label" — gap 10px between track and text. */
.switch__text {
  margin-left: 10px;
}

.switch[data-disabled] {
  cursor: not-allowed;
}

.switch:focus-within .switch__track {
  outline: none;
  box-shadow: var(--ring-focus);
}

.switch__hint {
  margin-top: 2px;
}

/* Redline "Row gap" — 14px between switch rows, not the 11px other selection
   rows use. Switch, unlike Radio, never composes more than one instance per
   template, so there is no internal list to hang a shared flex `gap` off
   of; the adjacent-sibling margin below reproduces the same spacing when a
   consumer stacks multiple <Switch> instances directly, with no trailing
   margin after a lone or final instance. */
.switch + .switch {
  margin-top: 14px;
}
</style>
