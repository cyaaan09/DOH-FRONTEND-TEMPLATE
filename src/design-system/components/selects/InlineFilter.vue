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

/**
 * The compact 34px dropdown used inside filter bars, where a 38px field would break the
 * row's rhythm.
 */
const props = defineProps({
  /** Options as `{ label, dot }`, where `dot` is a background utility class. */
  options: { type: Array, required: true },
  /** The chosen option's label. */
  modelValue: { type: String, required: true },
  /** The field name, rendered inline before the value and used as the name. */
  name: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

const labels = computed(() => props.options.map((o) => o.label))
const collection = computed(() => createListCollection({ items: labels.value }))
</script>

<template>
  <SelectRoot
    :collection="collection"
    :model-value="[modelValue]"
    :positioning="{ gutter: 6 }"
    @value-change="(details) => emit('update:modelValue', details.value[0] ?? modelValue)"
  >
    <!-- Deliberately NOT sameWidth: true, unlike Select and MultiSelect —
         this trigger is content-width (inline-flex) and its width changes
         with the selected value: "Status: All" reads narrower than the
         longest option, "Expiring soon". Forcing sameWidth would truncate
         options depending on which value happens to be selected;
         max-content (Zag's default here) is correct for a content-width
         trigger. -->
    <SelectControl>
      <!-- Redline "Inline variant" — 34px, radius 8px, soft border, 12.5/700. -->
      <SelectTrigger
        data-trigger
        :aria-label="name"
        class="inline-filter__trigger inline-flex h-compact items-center gap-2 rounded-control border border-soft bg-surface px-3 text-field-label font-bold text-ink-900"
      >
        <span data-name class="text-ink-500">{{ name }}:</span>
        <span data-value class="truncate">{{ modelValue }}</span>
        <span data-caret aria-hidden="true" class="inline-filter__caret text-ink-300">▾</span>
      </SelectTrigger>
    </SelectControl>

    <SelectPositioner class="inline-filter__positioner">
      <!-- Redline "Panel" and "Panel shadow" — radius 12, pad 6, hairline, 246px. -->
      <SelectContent
        class="inline-filter__panel rounded-panel border border-hairline bg-surface p-1.5"
      >
        <SelectItem
          v-for="option in options"
          :key="option.label"
          :item="option.label"
          class="inline-filter__option flex items-center gap-2 rounded-control text-body"
          :class="
            option.label === modelValue
              ? 'bg-green-tint text-green-text font-bold'
              : 'text-ink-700 font-normal'
          "
        >
          <!-- Appendix D.1 — the status dot. Decorative: the label beside it
               carries the meaning, so it is hidden from assistive tech. -->
          <span
            data-dot
            aria-hidden="true"
            class="inline-filter__dot flex-none rounded-pill"
            :class="option.dot"
          />
          <SelectItemText class="min-w-0 flex-1 truncate">{{ option.label }}</SelectItemText>
        </SelectItem>
      </SelectContent>
    </SelectPositioner>
  </SelectRoot>
</template>

<style scoped>
/* Height comes from the `h-compact` utility (--h-compact is 34px), the same
 * token Button's compact size uses. */
.inline-filter__trigger {
  cursor: pointer;
}

/* Redline "Open trigger" — green border plus the focus ring. Ark sets
 * data-state="open" on the trigger, so one selector covers the whole state. */
.inline-filter__trigger[data-state='open'] {
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}

.inline-filter__trigger:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

/* Redline "Caret" — 9px glyph; the type scale has no step this small. */
.inline-filter__caret {
  font-size: 9px;
}

/* Redline "Panel shadow" and "Panel max-h" — 246px without a filter. */
.inline-filter__panel {
  box-shadow: var(--sh-panel);
  max-height: 246px;
  overflow-y: auto;
}

/* Redline "Motion, states & z-index" — Dropdown / menu z-index 12. Zag's
 * positioner sets zIndex: var(--z-index) inline; undefined, that declaration
 * is invalid and falls back to auto, which only paints correctly by
 * accident while nothing else on the page is positioned. */
.inline-filter__positioner {
  --z-index: var(--z-popover);
}

/* Redline "Option" — pad 9px 10px. */
.inline-filter__option {
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
.inline-filter__option[data-highlighted]:not([data-state='checked']) {
  background: var(--surface-muted);
}

/* Appendix D.1 — the status dot. Sized here; no spacing token is 8px square. */
.inline-filter__dot {
  width: 8px;
  height: 8px;
}
</style>
