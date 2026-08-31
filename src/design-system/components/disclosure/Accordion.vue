<script setup>
import {
  AccordionRoot,
  AccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
} from '@ark-ui/vue/accordion'

/**
 * Redline "When · one long record read top to bottom — tabs swap views,
 * accordion reveals sections of the same thing". The section's own rule card
 * is blunter: "a tabbed accordion means the information architecture is
 * unresolved".
 *
 * Redline "Header · the whole row is the button (aria-expanded)" — not the
 * chevron. A 22px hit area for a section header is the kind of thing that
 * tests fine with a mouse and fails every other way in.
 */
defineProps({
  /**
   * Array<{ value, title, summary?, badge?: { label, tone } }>.
   * Bodies come through the `body` slot, keyed by value.
   */
  items: { type: Array, required: true },
  /** Redline "Default state · first section open, rest collapsed". */
  modelValue: { type: Array, default: () => [] },
  /** Record title in the toolbar. */
  title: { type: String, default: '' },
  expandAllLabel: { type: String, default: 'Expand all' },
})

defineEmits(['update:modelValue'])

// Redline "Header badge · count pill — --divider neutral, --green-100 done,
// --red-100 needs action". One entry per tone, each naming both properties.
const BADGE = {
  neutral: 'bg-neutral-100 text-text-header',
  done: 'bg-green-100 text-green-text',
  action: 'bg-red-100 text-red-700',
}
</script>

<template>
  <div
    data-accordion
    class="accordion overflow-hidden rounded-panel border border-hairline bg-surface"
  >
    <div
      v-if="title"
      data-accordion-toolbar
      class="accordion__toolbar flex items-center border-b border-divider"
    >
      <span class="min-w-0 flex-1 text-notice font-bold text-ink-900">{{ title }}</span>
      <button
        data-expand-all
        type="button"
        class="accordion__expand text-hint font-medium text-green-text"
        @click="
          $emit(
            'update:modelValue',
            modelValue.length === items.length ? [] : items.map((i) => i.value),
          )
        "
      >
        {{ expandAllLabel }}
      </button>
    </div>

    <!-- v-model, not :value + @value-change: Ark's AccordionRoot declares an
         `update:modelValue` emit, and binding `value` alone leaves the
         machine's own state uncontrolled — every section rendered collapsed
         no matter what was passed. -->
    <AccordionRoot
      multiple
      :model-value="modelValue"
      @update:model-value="(value) => $emit('update:modelValue', value)"
    >
      <AccordionItem
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        data-accordion-item
      >
        <AccordionItemTrigger
          data-accordion-header
          class="accordion__header flex w-full items-center"
        >
          <!-- Redline "Chevron tile · decorative" — the whole header is the
               button, so the tile only reflects state and is hidden from AT. -->
          <span
            data-chevron
            aria-hidden="true"
            class="accordion__chevron grid flex-none place-items-center rounded-tile"
          >
            ▸
          </span>
          <span class="min-w-0 flex-1">
            <span data-accordion-title class="accordion__title block text-ink-900">{{
              item.title
            }}</span>
            <span
              v-if="item.summary"
              data-accordion-summary
              class="accordion__summary block text-text-meta"
              >{{ item.summary }}</span
            >
          </span>
          <span
            v-if="item.badge"
            data-accordion-badge
            class="accordion__badge grid flex-none place-items-center rounded-pill text-chip"
            :class="BADGE[item.badge.tone] ?? BADGE.neutral"
            >{{ item.badge.label }}</span
          >
        </AccordionItemTrigger>

        <AccordionItemContent data-accordion-body class="accordion__body">
          <div class="accordion__grid">
            <slot :name="item.value" :item="item" />
          </div>
        </AccordionItemContent>
      </AccordionItem>
    </AccordionRoot>
  </div>
</template>

<style scoped>
/* Redline "Toolbar · 12px 18px · --surface-sunken". */
.accordion__toolbar {
  gap: 12px;
  padding: 12px 18px;
  background: var(--surface-sunken);
}

.accordion__expand {
  cursor: pointer;
}

/* Redline "Container · rows divided by 1px --divider". */
[data-accordion-item] + [data-accordion-item] {
  border-top: 1px solid var(--divider);
}

/* Redline "Header · pad 14px 18px · gap 12px". */
.accordion__header {
  gap: 12px;
  padding: 14px 18px;
  background: none;
  border: 0;
  text-align: left;
  cursor: pointer;
  /* Redline "Transition · 160ms ease on height and background · never
     animate the text itself". */
  transition: background-color var(--t-rail);
}

.accordion__header:hover {
  background: var(--surface-sunken);
}

/* Redline "Open header · background --surface-sunken". */
.accordion__header[data-state='open'] {
  background: var(--surface-sunken);
}

.accordion__header:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

/* Redline "Chevron tile · 22px · closed --surface-muted / --text-meta ▸ ·
   open --green-100 / --green-text ▾". */
.accordion__chevron {
  width: 22px;
  height: 22px;
  background: var(--surface-muted);
  color: var(--text-meta);
  font-size: 10px;
  transition:
    background-color var(--t-rail),
    color var(--t-rail),
    transform var(--t-rail);
}

.accordion__header[data-state='open'] .accordion__chevron {
  background: var(--green-100);
  color: var(--green-text);
  transform: rotate(90deg);
}

/* Redline "Header text · title 13.5px / 700 · summary 12px that answers
   without opening". */
.accordion__title {
  font-size: 13.5px;
  font-weight: 700;
}

.accordion__summary {
  font-size: 12px;
  margin-top: 2px;
}

.accordion__badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
}

/* Redline "Open header · body pad 0 18px 18px 52px, aligned under the title"
   — 52px is the 18px gutter plus the 22px tile plus the 12px gap, so the
   body starts where the title does rather than needing a second border. */
.accordion__body {
  padding: 0 18px 18px 52px;
}

/* Redline "Body grid · auto-fit minmax(180px,1fr) · gap 14px 22px". */
.accordion__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px 22px;
}
</style>
