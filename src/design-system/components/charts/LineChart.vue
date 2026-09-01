<script setup>
import { computed, useId } from 'vue'
import { areaPath, axisMax, axisTicks, plot, smoothPath } from './geometry.js'

/**
 * Redline "Line · 2.25px, smooth cubic through midpoints, round joins,
 * vector-effect non-scaling-stroke" plus "Area fill", "Latest point",
 * "Gridlines" and "Axis geometry".
 *
 * The gridlines are DIVs behind the SVG, not SVG lines, and the latest point is
 * a positioned span in front of it. Both are deliberate: `preserveAspectRatio
 * ="none"` stretches the viewBox horizontally, which would smear an SVG
 * hairline and squash a circle into an ellipse. `vector-effect` saves the path
 * itself; everything that must stay round or 1px thick lives in CSS.
 */
const props = defineProps({
  /** One number per period. */
  values: { type: Array, required: true },
  /** Labels for the x axis — one per value; only every third is drawn. */
  labels: { type: Array, default: () => [] },
  /** Any chart token: --chart-ok-strong for the emphasised single series. */
  tone: { type: String, default: 'var(--chart-ok-strong)' },
  height: { type: Number, default: 108 },
})

// The plot box is inset 3px on every side so the 2.25px stroke and the 9px
// latest-point dot are not clipped by the SVG's own edge.
const INSET = 3
const VIEW_W = 320

const max = computed(() => axisMax(props.values))
const points = computed(() =>
  plot(props.values, {
    width: VIEW_W - INSET * 2,
    height: props.height - INSET * 2,
    max: max.value,
  }).map((p) => ({ ...p, x: p.x + INSET, y: p.y + INSET })),
)
const baseline = computed(() => props.height - INSET)
const line = computed(() => smoothPath(points.value))
const area = computed(() => areaPath(points.value, baseline.value))
const last = computed(() => points.value[points.value.length - 1])

// Percentages, so the dot tracks the same scale as the path rather than being
// positioned from the raw value — the two would drift apart by the inset.
const dotTop = computed(() => `${(last.value.y / props.height) * 100}%`)

const ticks = computed(() => {
  const keep = axisTicks(props.labels.length)
  return props.labels.filter((_, i) => keep.has(i))
})

const gradientId = `chart-area-${useId()}`
</script>

<template>
  <div data-line-chart class="line" :style="{ '--tone': tone }">
    <!-- Redline "Axis geometry · the y-label box is the SAME height as the plot
         box, each label absolutely positioned at 0 / 50% / 100% with
         translateY(-50%) so it centres on its gridline". Equal heights are the
         whole trick: any padding here and every label drifts off its line. -->
    <div class="line__axis font-mono" :style="{ height: `${height}px` }">
      <span style="top: 0">{{ max }}</span>
      <span style="top: 50%">{{ max / 2 }}</span>
      <span style="top: 100%">0</span>
    </div>

    <div class="min-w-0 flex-1">
      <div class="line__plot" :style="{ height: `${height}px` }">
        <!-- Redline "Gridlines · three max, horizontal only, outer two
             --chart-grid, middle --chart-grid-mid, no axis line, no ticks,
             no plot border". -->
        <div data-gridlines aria-hidden="true" class="line__grid">
          <span /><span class="line__grid-mid" /><span />
        </div>

        <svg
          :viewBox="`0 0 ${VIEW_W} ${height}`"
          preserveAspectRatio="none"
          class="line__svg"
          :style="{ height: `${height}px` }"
          aria-hidden="true"
        >
          <defs>
            <!-- Redline "Area fill · linear-gradient of the line tone, 0.18 to 0". -->
            <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
              <stop class="line__stop line__stop--top" offset="0%" />
              <stop class="line__stop line__stop--bottom" offset="100%" />
            </linearGradient>
          </defs>
          <path :d="area" :fill="`url(#${gradientId})`" />
          <path
            data-line
            :d="line"
            fill="none"
            class="line__stroke"
            stroke-width="2.25"
            stroke-linejoin="round"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
          />
          <!-- Redline "Latest point · plus a 1px dashed drop line at 0.45
               opacity to the baseline". -->
          <line
            :x1="last.x"
            :y1="last.y"
            :x2="last.x"
            :y2="baseline"
            class="line__stroke"
            stroke-width="1"
            stroke-dasharray="2 3"
            stroke-opacity="0.45"
            vector-effect="non-scaling-stroke"
          />
        </svg>

        <!-- Outside the SVG so it can carry a box-shadow halo, which SVG has no
             equivalent for, and stay circular under the stretched viewBox. -->
        <span data-latest-point aria-hidden="true" class="line__dot" :style="{ top: dotTop }" />
      </div>

      <div v-if="ticks.length" data-x-axis class="line__labels">
        <span v-for="label in ticks" :key="label">{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

/* Redline "Axis labels · 10.5px --chart-axis · y mono". Never --ink-300: the
   row calls these readable data text, and --ink-300 is 2.58:1. */
.line__axis {
  position: relative;
  flex: none;
  width: 20px;
  font-size: 10.5px;
  color: var(--chart-axis);
}

.line__axis span {
  position: absolute;
  right: 0;
  transform: translateY(-50%);
}

.line__plot {
  position: relative;
}

.line__grid {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.line__grid span {
  height: 1px;
  background: var(--chart-grid);
}

.line__grid-mid {
  background: var(--chart-grid-mid) !important;
}

.line__svg {
  position: relative;
  display: block;
  width: 100%;
}

/* The tone reaches the SVG through a custom property, never through an
   attribute: `stroke="var(--x)"` does NOT resolve — var() is a CSS value and a
   presentation attribute is not reliably parsed as one. It renders as no stroke
   at all, silently, in a file that compiles clean. Same for stop-color. */
.line__stroke {
  stroke: var(--tone);
}

.line__stop {
  stop-color: var(--tone);
}

.line__stop--top {
  stop-opacity: 0.18;
}

.line__stop--bottom {
  stop-opacity: 0;
}

/* Redline "Latest point · 9px dot on the surface, 2.25px ring, a 3px halo at
   12% of the tone". color-mix rather than an eight-digit hex, because the tone arrives as
   a var() and `var(--tone)1F` is not a colour. right:-4px centres the 9px dot
   on the final point, which sits on the plot's right edge. */
.line__dot {
  position: absolute;
  right: -4px;
  width: 9px;
  height: 9px;
  margin-top: -4.5px;
  border-radius: 50%;
  border: 2.25px solid var(--tone);
  background: var(--surface);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--tone) 12%, transparent);
}

.line__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 10.5px;
  color: var(--chart-axis);
}
</style>
