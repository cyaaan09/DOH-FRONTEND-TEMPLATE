<script setup>
import { computed, ref } from 'vue'
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
  /** Every option, in display order. */
  options: { type: Array, required: true },
  /** The chosen options. */
  modelValue: { type: Array, default: () => [] },
  /** Shown in the trigger while nothing is chosen. */
  placeholder: { type: String, required: true },
  /** Names the control for assistive technology. NOT rendered on screen. */
  label: { type: String, required: true },
  /** Placeholder for the in-panel filter field. */
  filterPlaceholder: { type: String, required: true },
  /** Shown in place of the list when the filter matches nothing. */
  emptyText: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue', 'apply'])

const query = ref('')

const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? props.options.filter((o) => o.toLowerCase().includes(q)) : props.options
})

const collection = computed(() => createListCollection({ items: shown.value }))

// Appendix D.1 "MultiSelect trigger" — the first two picked labels, comma-joined,
// ellipsis-truncated by the value span; the placeholder when nothing is picked.
// The total goes in the count badge beside it, never in this string.
const summary = computed(() =>
  props.modelValue.length ? props.modelValue.slice(0, 2).join(', ') : props.placeholder,
)

// Selection has ONE source: Ark's own multiple-select machine, surfaced through
// @value-change. A parallel @click toggle would drift from Ark's aria-selected.
const isOn = (option) => props.modelValue.includes(option)
</script>

<template>
  <SelectRoot
    multiple
    :collection="collection"
    :model-value="modelValue"
    :positioning="{ gutter: 6, sameWidth: true }"
    @value-change="(details) => emit('update:modelValue', details.value)"
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
        class="multiselect__trigger flex h-field w-full items-center gap-2 rounded-field border border-field bg-surface px-3 text-left"
      >
        <!-- Redline "Value" vs "Placeholder" — one class per property per branch. -->
        <span
          data-value
          class="min-w-0 flex-1 truncate text-body"
          :class="modelValue.length ? 'text-ink-900 font-medium' : 'text-ink-500 font-normal'"
          >{{ summary }}</span
        >
        <!-- Appendix D.1 "MultiSelect trigger" — count badge, shown only when
             something is picked. Carries the total the value string omits. -->
        <span
          v-if="modelValue.length"
          data-count
          class="multiselect__count grid flex-none place-items-center rounded-pill bg-green-100 text-chip text-green-text"
          >{{ modelValue.length }}</span
        >
        <!-- Redline "Caret · decorative" — hidden from the accessible name. -->
        <span data-caret aria-hidden="true" class="multiselect__caret text-ink-300">▾</span>
      </SelectTrigger>
    </SelectControl>

    <SelectPositioner class="multiselect__positioner">
      <SelectContent
        class="multiselect__panel rounded-panel border border-hairline bg-surface"
      >
        <!-- Redline "Panel filter" (32px field on the input surface) plus Appendix
             D.1: the field sits in its own section under a hairline rule, and
             carries a decorative leading glyph before the input. -->
        <div class="multiselect__filter-section border-b border-divider">
          <div
            class="multiselect__filter-field flex items-center gap-2 rounded-control border border-hairline bg-surface-input"
          >
            <span data-filter-glyph aria-hidden="true" class="multiselect__filter-glyph flex-none" />
            <input
              v-model="query"
              data-filter
              type="text"
              :placeholder="filterPlaceholder"
              :aria-label="filterPlaceholder"
              class="multiselect__filter min-w-0 flex-1 bg-transparent text-field-label text-ink-900"
            />
          </div>
        </div>

        <!-- Redline "Panel max-h" — 214px once a filter is present. -->
        <div class="multiselect__list p-1.5">
          <SelectItem
            v-for="option in shown"
            :key="option"
            :item="option"
            data-option
            class="multiselect__option flex items-center gap-2 rounded-control text-body"
            :class="
              isOn(option) ? 'bg-green-tint text-green-text font-bold' : 'text-ink-700 font-normal'
            "
          >
            <!-- Redline "Checkbox in list" — 15px, filled green when on. -->
            <span
              data-box
              aria-hidden="true"
              class="multiselect__box grid flex-none place-items-center rounded-[4px] border"
              :class="
                isOn(option)
                  ? 'bg-green-fill border-green-fill text-green-on-fill'
                  : 'bg-surface border-field text-transparent'
              "
              >✓</span
            >
            <SelectItemText data-option-label class="min-w-0 flex-1 truncate">{{
              option
            }}</SelectItemText>
          </SelectItem>
          <p v-if="!shown.length" data-empty class="multiselect__empty text-caption text-ink-500">
            {{ emptyText }}
          </p>
        </div>

        <!-- Redline "Panel footer" — sunken strip under a 1px rule. -->
        <div
          data-footer
          class="multiselect__footer flex items-center justify-between gap-3 border-t border-divider bg-surface-sunken"
        >
          <!-- Zag's content-level keydown handler intercepts Enter and Space for any
               descendant and calls preventDefault, which would leave these buttons
               reachable by Tab but impossible to activate (WCAG 2.1.1, Level A).
               Stopping propagation here lets native button activation run. -->
          <button
            data-clear
            type="button"
            class="multiselect__clear text-field-label font-bold text-ink-500"
            @click="emit('update:modelValue', [])"
            @keydown.enter.stop
            @keydown.space.stop
          >
            Clear
          </button>
          <button
            data-apply
            type="button"
            class="multiselect__apply rounded-control bg-green-fill text-field-label font-bold text-green-on-fill"
            @click="emit('apply')"
            @keydown.enter.stop
            @keydown.space.stop
          >
            Apply
          </button>
        </div>
      </SelectContent>
    </SelectPositioner>
  </SelectRoot>
</template>

<style scoped>
/* Height comes from the `h-field` utility on the element, matching TextField
 * and SearchField — Appendix D calls this "the same 38px shell as a text
 * field", so it must be the same token, not a repeated literal. */
.multiselect__trigger {
  cursor: pointer;
}

/* Redline "Open trigger" — green border plus the focus ring. Ark sets
 * data-state="open" on the trigger, so one selector covers the whole state. */
.multiselect__trigger[data-state='open'] {
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}

.multiselect__trigger:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

/* Appendix D.1 "MultiSelect trigger" — the count badge is a 20px pill. Its
 * colours come from the bg-green-100 / text-green-text utilities on the
 * element, so this rule sets geometry only. */
.multiselect__count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
}

/* Redline "Caret" — 9px glyph. */
.multiselect__caret {
  font-size: 9px;
}

/* Redline "Panel shadow". The panel itself does not scroll — the list does,
 * so the footer stays stuck to the bottom. `overflow: hidden` clips the
 * footer to the panel's own 12px radius: the footer sits flush to the
 * panel's left, right and bottom edges with its own sunken background, and
 * a parent's border-radius does not clip a flush child's background on its
 * own — without this the footer would show square corners against the
 * rounded panel. Clipping a descendant this way does not clip the panel's
 * own box-shadow below, which paints outside the element's box. */
.multiselect__panel {
  box-shadow: var(--sh-panel);
  overflow: hidden;
}

/* Redline "Motion, states & z-index" — Dropdown / menu z-index 12. Zag's
 * positioner sets zIndex: var(--z-index) inline; undefined, that declaration
 * is invalid and falls back to auto, which only paints correctly by
 * accident while nothing else on the page is positioned. */
.multiselect__positioner {
  --z-index: var(--z-popover);
}

/* Appendix D.1 — the filter sits in a section padded 8px 10px under a rule. */
.multiselect__filter-section {
  padding: 8px 10px;
}

/* Redline "Panel filter" — 32px tall on the input surface. Appendix D.1 adds
 * the 1px hairline border and 0 10px inset that the redline row omits. */
.multiselect__filter-field {
  height: 32px;
  padding: 0 10px;
}

/* Appendix D.1 — decorative 11px ring before the input. Purely a glyph: it has
 * no accessible role and the input beside it carries the label. */
.multiselect__filter-glyph {
  width: 11px;
  height: 11px;
  border: 1.8px solid var(--ink-300);
  border-radius: 50%;
}

.multiselect__filter {
  border: none;
}

.multiselect__filter:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

/* Redline "Panel max-h" — 214px with a filter present. */
.multiselect__list {
  max-height: 214px;
  overflow-y: auto;
}

/* Redline "Option" — pad 9px 10px. */
.multiselect__option {
  padding: 9px 10px;
  cursor: pointer;
}

/* Appendix C "Keyboard & focus" mandates arrow navigation, and "Motion,
 * states & z-index" requires a visible indicator on every focusable. Zag
 * sets data-highlighted on the item under the cursor or arrow keys. No
 * :not([data-state='checked']) guard is needed here, unlike Select and
 * InlineFilter: selection is carried by the checkbox (.multiselect__box),
 * not by a tint on the row itself, so there is nothing for this to clobber. */
.multiselect__option[data-highlighted] {
  background: var(--surface-muted);
}

/* Redline "Checkbox in list" — 15px box, radius 4px. No token carries 4px:
 * --r-check is 5px, so this is the arbitrary value the redline requires. */
.multiselect__box {
  width: 15px;
  height: 15px;
  font-size: 10px;
  line-height: 1;
}

/* Appendix D.1 — empty state padding. */
.multiselect__empty {
  padding: 14px 10px;
}

/* Redline "Panel footer" — pad 9px 12px. */
.multiselect__footer {
  padding: 9px 12px;
}

.multiselect__clear {
  padding: 4px;
  cursor: pointer;
  background: none;
  border: none;
}

/* Redline "Focus ring" — every focusable gets one; never outline:none
 * without replacing it. Clear and Apply are otherwise the only two
 * interactive controls in the design system without this rule. */
.multiselect__clear:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

/* Appendix D.1 — Apply is 7px 14px on the fill green. */
.multiselect__apply {
  padding: 7px 14px;
  border: none;
  cursor: pointer;
}

.multiselect__apply:hover {
  background: var(--green-fill-hover);
}

/* Redline "Focus ring" — every focusable gets one; never outline:none
 * without replacing it. Clear and Apply are otherwise the only two
 * interactive controls in the design system without this rule. */
.multiselect__apply:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
