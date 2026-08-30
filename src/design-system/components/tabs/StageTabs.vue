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
          stage.muted ? 'bg-surface-card-muted' : 'bg-surface',
        ]"
      >
        <span class="flex items-center gap-2">
          <span
            data-step
            class="stage-tabs__step flex items-center justify-center rounded-bar text-stat-hint font-bold"
            :class="
              stage.key === modelValue
                ? 'bg-green-fill text-green-on-fill'
                : 'bg-divider text-text-header'
            "
            aria-hidden="true"
            >{{ stage.step }}</span
          >
          <span class="text-field-label font-bold text-text-header">{{ stage.label }}</span>
        </span>
        <!-- No aria-label here: this span is inside role="tab", so a label would
             replace its text in the card's name-from-content computation and repeat
             the stage label. The visible label already gives the number context. -->
        <span
          data-figure
          class="stage-tabs__figure text-stage-figure block"
          :class="stage.muted ? 'text-text-header' : 'text-ink-900'"
          >{{ stage.count }}</span
        >
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
/* No "Stage grid" row exists in Appendix C to govern this list. The nearest
 * row is "Stat cards & meters" > Grid — auto-fit minmax(190px,1fr) gap 12px —
 * and this is NOT that: minmax(150px,1fr) gap 10px is this component's own,
 * chosen so five stage cards keep fitting a row at the section's real width
 * (review Finding 1) instead of collapsing to one column. */
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

/* Redline "Stage number" — 19x19px. No spacing token carries it. */
.stage-tabs__step {
  width: 19px;
  height: 19px;
}

.stage-tabs__card:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
