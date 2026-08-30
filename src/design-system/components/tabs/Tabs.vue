<script setup>
import { TabsRoot, TabList, TabTrigger, TabContent } from '@ark-ui/vue/tabs'

defineProps({
  /** Tabs to render: `{ key, label, count? }`. */
  tabs: { type: Array, required: true },
  /** The active tab's key. */
  modelValue: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <TabsRoot
    :model-value="modelValue"
    @value-change="(details) => emit('update:modelValue', details.value)"
  >
    <!-- Redline "Underline pad" — 14px 2px per trigger, 22px between them.
         The list carries the hairline the marker sits on. -->
    <TabList class="tabs__list flex items-center border-b border-divider">
      <TabTrigger
        v-for="tab in tabs"
        :key="tab.key"
        :value="tab.key"
        class="tabs__trigger inline-flex items-center gap-2 text-body font-bold whitespace-nowrap border-b-[2.5px]"
        :class="
          tab.key === modelValue
            ? 'border-b-green-fill text-green-text'
            : 'border-b-transparent text-text-header'
        "
      >
        {{ tab.label }}
        <!-- Redline "Tab count" — mono, and "Count active"/"Count idle" for the tint.
             No aria-label here: this span is inside role="tab", so a label would
             replace its text in the tab's name-from-content computation and repeat
             the tab label. The visible label already gives the number context. -->
        <span
          v-if="tab.count"
          data-count
          class="tabs__count font-mono text-stat-hint font-medium"
          :class="
            tab.key === modelValue
              ? 'bg-green-100 text-green-text'
              : 'bg-surface-muted text-text-header'
          "
          >{{ tab.count }}</span
        >
      </TabTrigger>
    </TabList>

    <TabContent :value="modelValue" class="pt-4">
      <slot />
    </TabContent>
  </TabsRoot>
</template>

<style scoped>
/* Redline "Underline pad" — row gap 22px between triggers. */
.tabs__list {
  gap: 22px;
}

/* Redline "Underline pad" — 14px 2px. The 2.5px marker itself is the
 * border-b-[2.5px] utility on the trigger, coloured by the :class binding, so
 * that one property has exactly one source. The negative margin pulls the
 * marker onto the list's hairline instead of stacking below it. */
.tabs__trigger {
  padding: 14px 2px;
  margin-bottom: -1px;
  cursor: pointer;
}

.tabs__trigger:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

/* Redline "Tab count" — pad 2px 7px, radius 9px. */
.tabs__count {
  padding: 2px 7px;
  border-radius: var(--r-field);
}
</style>
