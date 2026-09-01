<script setup>
import { computed, useId } from 'vue'
import { areaPath, axisMax, plot, smoothPath } from './geometry.js'

/**
 * Redline "Sparkline · 30px tall · 1.75px smooth stroke in the figure's own
 * tone + a 0.14→0 gradient fill · no axis, no dots, no labels".
 *
 * Deliberately not LineChart with smaller numbers: everything that makes a
 * chart readable on its own — axis, gridlines, the latest point — is absent
 * here, because a sparkline is punctuation inside a figure, not a chart.
 */
const props = defineProps({
  values: { type: Array, required: true },
  tone: { type: String, default: 'var(--chart-ok)' },
  height: { type: Number, default: 30 },
})

const VIEW_W = 160
const INSET = 2

const points = computed(() =>
  plot(props.values, {
    width: VIEW_W - INSET * 2,
    height: props.height - INSET * 2,
    max: axisMax(props.values),
  }).map((p) => ({ ...p, x: p.x + INSET, y: p.y + INSET })),
)
const gradientId = `spark-${useId()}`
</script>

<template>
  <svg
    data-sparkline
    :viewBox="`0 0 ${VIEW_W} ${height}`"
    preserveAspectRatio="none"
    class="spark"
    :style="{ height: `${height}px`, '--tone': tone }"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop class="spark__stop spark__stop--top" offset="0%" />
        <stop class="spark__stop spark__stop--bottom" offset="100%" />
      </linearGradient>
    </defs>
    <path :d="areaPath(points, height)" :fill="`url(#${gradientId})`" />
    <path
      :d="smoothPath(points)"
      class="spark__stroke"
      fill="none"
      stroke-width="1.75"
      stroke-linejoin="round"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
    />
  </svg>
</template>

<style scoped>
.spark {
  display: block;
  width: 100%;
}

/* var() cannot live in a `stroke`/`stop-color` attribute — see LineChart. */
.spark__stroke {
  stroke: var(--tone);
}

.spark__stop {
  stop-color: var(--tone);
}

.spark__stop--top {
  stop-opacity: 0.14;
}

.spark__stop--bottom {
  stop-opacity: 0;
}
</style>
