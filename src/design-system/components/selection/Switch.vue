<script setup>
import { computed, useId } from 'vue'
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

// Redline "Fields" (ARIA & semantics) — hint via aria-describedby. Same
// mechanism and same reason as Checkbox.vue's identical binding: the hidden
// input's own aria-labelledby (Ark's getHiddenInputProps()) wins over the
// wrapping <label> for the accessible NAME, so the hint needs its own wire
// into the description.
const hintId = `${useId()}-hint`

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
      <span
        v-if="hint"
        :id="hintId"
        data-hint
        class="switch__hint block text-hint text-text-meta"
        >{{ hint }}</span
      >
    </span>

    <!-- Redline "Switch" (ARIA & semantics) — role=switch aria-checked, not
         a checkbox. Ark's hidden input is a plain <input type="checkbox">;
         `role` appears nowhere in @zag-js/switch (see this component's
         spec §17.3 entry, "aria-checked=mixed... is expressed as an IDL
         property"). role="switch" here reaches the real input through the
         same consumer-attrs-fallthrough path Checkbox.vue's :indeterminate
         binding already proves — SwitchHiddenInput declares no `role` prop,
         so it lands in its own $attrs and Vue's fallthrough carries it onto
         the native <input> it wraps. ARIA-in-HTML explicitly permits
         role="switch" on input[type=checkbox]; the native `checked` IDL
         property then maps to aria-checked automatically. Mutation-tested:
         Switch.spec.js "announces as a switch, not a checkbox" fails if
         this attribute is removed. -->
    <SwitchHiddenInput role="switch" :aria-describedby="hint ? hintId : undefined" />
  </SwitchRoot>
</template>

<style scoped>
/* Redline "Switch" (Motion, states & z-index) — transition background 140ms
   + justify-content 140ms. justify-content is what actually slides the knob
   (see the comment below); background-color is the track fill trackClass
   sets. Both ride --t-control, the same token Meter.vue's fill-width
   transition uses — the pair is a comma-separated list, not the `all`
   shorthand, so nothing else on this element is accidentally animated. */
.switch__track {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 38px;
  height: 22px;
  padding: 2px;
  transition:
    background-color var(--t-control) ease,
    justify-content var(--t-control) ease;
}

/* Redline "Switch track" — 38x22px, pad 2px. Flex centres the knob in the
   padding box; justify-content (transitioned above) slides it between the
   two states, the same mechanism Appendix C's motion row names for this
   control. */
.switch__track[data-state='checked'] {
  justify-content: flex-end;
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

/* Appendix D's Selection controls description — "whole row clickable".
   Lives on the root, not .switch__track: a cursor declared directly on the
   track would beat the INHERITED not-allowed below regardless of
   specificity — a direct declaration on an element always wins over an
   inherited value, no matter how specific the ancestor rule that produced
   it. Matches Checkbox's identical fix and Radio's/RadioCard's existing
   row/card-level cursor. */
.switch {
  cursor: pointer;
}

.switch[data-disabled] {
  cursor: not-allowed;
}

/* Redline "Focus ring" — :focus-visible -> border var(--green-500) + ring.
   [data-focus-visible] is Zag's own isFocusVisible() heuristic (keyboard
   only, never a mouse click) landing directly on the track via
   getControlProps(); replaces :focus-within, which also matched a mouse
   click landing on the hidden input — see Checkbox.vue's identical rule for
   the mechanism.
   This does NOT add a literal border-color the way Checkbox/Radio/RadioCard
   do: the track is exactly 22px tall holding an 18px knob inside 2px
   padding on each side (redlined "Switch track" and "Knob" rows) — zero
   slack. Any added border-width would shrink that inner box below 18px and
   force the knob to overflow it, which a real border cannot do without
   also eating into the redlined 2px pad. A second, solid, zero-blur
   box-shadow reproduces the same visual — a solid edge plus the soft glow
   beyond it — without touching the box model, so the knob's travel is
   unaffected either way. */
.switch__track[data-focus-visible] {
  outline: none;
  box-shadow:
    0 0 0 1.8px var(--green-500),
    var(--ring-focus);
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
