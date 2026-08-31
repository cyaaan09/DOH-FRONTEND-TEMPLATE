<script setup>
import { computed } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectTrigger,
  SelectPositioner,
  SelectContent,
  SelectItem,
  SelectItemText,
} from '@ark-ui/vue/select'
import { createListCollection } from '@ark-ui/vue/collection'

const props = defineProps({
  /** The options to choose between, in display order. */
  options: { type: Array, required: true },
  /** The selected option, or '' when nothing is chosen. */
  modelValue: { type: String, default: '' },
  /** Shown in the trigger while nothing is chosen. */
  placeholder: { type: String, required: true },
  /**
   * Names the control for assistive technology. NOT rendered — the page draws
   * its own visible field label above the control.
   */
  label: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

const collection = computed(() => createListCollection({ items: props.options }))
const selected = computed(() => (props.modelValue ? [props.modelValue] : []))
</script>

<template>
  <SelectRoot
    :collection="collection"
    :model-value="selected"
    :positioning="{ gutter: 6, sameWidth: true }"
    @value-change="(details) => emit('update:modelValue', details.value[0] ?? '')"
  >
    <!-- Redline "Panel" — top 44px against a 38px trigger, so a 6px gutter.
         Zag defaults this to 8, which would render the panel 2px too low.
         sameWidth: true sizes the panel to the trigger's own width rather
         than its longest option's — the redline "Value" row is ellipsis,
         which only ever engages against a trigger-width panel, and every
         option label's min-w-0 flex-1 truncate is otherwise dead code. -->
    <SelectControl>
      <!-- Redline "Trigger" — 38px, radius 9px, 1px field border, gap 8px.
           `h-field` supplies the height — see the style block below. -->
      <SelectTrigger
        data-trigger
        :aria-label="label"
        class="select__trigger flex h-field w-full items-center gap-2 rounded-field border border-field bg-surface px-3 text-left"
      >
        <!-- Redline "Value" vs "Placeholder" — one class per property per branch. -->
        <span
          data-value
          class="select__value min-w-0 flex-1 truncate text-body"
          :class="modelValue ? 'text-ink-900 font-medium' : 'text-ink-500 font-normal'"
          >{{ modelValue || placeholder }}</span
        >
        <!-- Redline "Caret · decorative" — hidden from the accessible name. -->
        <span data-caret aria-hidden="true" class="select__caret text-ink-300">▾</span>
      </SelectTrigger>
    </SelectControl>

    <SelectPositioner class="select__positioner">
      <!-- Redline "Panel" and "Panel max-h" — radius 12, pad 6, hairline, 246px. -->
      <SelectContent class="select__panel rounded-panel border border-hairline bg-surface p-1.5">
        <SelectItem
          v-for="option in options"
          :key="option"
          :item="option"
          class="select__option flex items-center gap-2 rounded-control text-body"
          :class="
            option === modelValue
              ? 'bg-green-tint text-green-text font-bold'
              : 'text-ink-700 font-normal'
          "
        >
          <SelectItemText class="min-w-0 flex-1 truncate">{{ option }}</SelectItemText>
          <!-- Redline "Option selected" — the check is 12px/700. -->
          <span v-if="option === modelValue" aria-hidden="true" class="text-hint font-bold">✓</span>
        </SelectItem>
      </SelectContent>
    </SelectPositioner>
  </SelectRoot>
</template>

<style scoped>
/* Height comes from the `h-field` utility on the element, matching
 * TextField and SearchField — Appendix D calls this "the same 38px shell
 * as a text field", so it must be the same token, not a repeated literal. */
.select__trigger {
  cursor: pointer;
}

/* Redline "Open trigger" — green border plus the focus ring. Ark sets
 * data-state="open" on the trigger, so one selector covers the whole state. */
.select__trigger[data-state='open'] {
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}

.select__trigger:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

/* Redline "Caret" — 9px glyph; the type scale has no step this small. */
.select__caret {
  font-size: 9px;
}

/* Redline "Panel shadow" and "Panel max-h" — 246px without a filter. */
.select__panel {
  box-shadow: var(--sh-panel);
  max-height: 246px;
  overflow-y: auto;
}

/* Redline "Motion, states & z-index" — Dropdown / menu z-index 12. Zag's
 * positioner sets zIndex: var(--z-index) inline; undefined, that declaration
 * is invalid and falls back to auto, which only paints correctly by
 * accident while nothing else on the page is positioned. */
.select__positioner {
  --z-index: var(--z-popover);
}

/* Redline "Option" — pad 9px 10px. */
.select__option {
  padding: 9px 10px;
  cursor: pointer;
}

/* Appendix C "Keyboard & focus" mandates arrow navigation, and "Motion,
 * states & z-index" requires a visible indicator on every focusable. Zag
 * sets data-highlighted on the item under the cursor or arrow keys. The
 * :not() is load-bearing, not defensive: Zag also sets data-state="checked"
 * on the selected item, and this rule wins over the bg-green-tint utility
 * regardless of specificity — Vue's scoped styles are unlayered, Tailwind's
 * utilities live in @layer utilities, and unlayered rules beat every named
 * layer. Without the :not(), arrowing onto the selected option would replace
 * its redlined tint with grey. Note the mechanism is cascade LAYERS, not
 * specificity: if this rule were ever moved into a named layer, specificity
 * would then decide it and the outcome could flip. */
.select__option[data-highlighted]:not([data-state='checked']) {
  background: var(--surface-muted);
}
</style>
