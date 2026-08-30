<script setup>
import { TabsRoot, TabList, TabTrigger, TabContent } from '@ark-ui/vue/tabs'

defineProps({
  /** Stages: `{ key, step, label, count, hint, urgent?, muted? }`. */
  stages: { type: Array, required: true },
  /** The active stage's key. */
  modelValue: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <TabsRoot
    :model-value="modelValue"
    @value-change="(details) => emit('update:modelValue', details.value)"
  >
    <TabList class="stage-tabs__list">
      <TabTrigger
        v-for="stage in stages"
        :key="stage.key"
        :value="stage.key"
        class="stage-tabs__card border rounded-panel text-left cursor-pointer"
        :class="[
          stage.key === modelValue
            ? 'stage-tabs__card--active border-green-500'
            : 'border-hairline',
          stage.muted ? 'bg-surface-sunken' : 'bg-surface',
        ]"
      >
        <span class="flex items-center gap-2">
          <span data-step class="stage-tabs__step text-stat-hint font-bold text-text-meta">{{
            stage.step
          }}</span>
          <span class="text-field-label font-bold text-text-header">{{ stage.label }}</span>
        </span>
        <span data-figure class="stage-tabs__figure text-stage-figure text-text-header block">{{
          stage.count
        }}</span>
        <!-- Redline "Stage urgent" — red at 700; every other hint is meta grey
             at 400, so colour and weight each have exactly one source. -->
        <span
          data-hint
          class="text-stat-hint block"
          :class="stage.urgent ? 'text-red-700 font-bold' : 'text-text-meta font-normal'"
          >{{ stage.hint }}</span
        >
      </TabTrigger>
    </TabList>

    <TabContent :value="modelValue" class="pt-4">
      <slot />
    </TabContent>
  </TabsRoot>
</template>

<style scoped>
/* Appendix C "Stat cards & meters" sets the same auto-fit grid for card rows;
 * stage cards use it so a five-stage row wraps instead of scrolling. */
.stage-tabs__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

/* Redline "Stage card" — pad 13px 15px 14px. */
.stage-tabs__card {
  padding: 13px 15px 14px;
}

/* Redline "Stage active" — the select ring sits outside the green border. */
.stage-tabs__card--active {
  box-shadow: var(--ring-select);
}

.stage-tabs__figure {
  margin-top: 6px;
}

.stage-tabs__card:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
