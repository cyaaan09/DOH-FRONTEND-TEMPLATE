<script setup>
import { computed } from 'vue'
import { donutHole, donutSegments } from './geometry.js'

/**
 * Redline "Donut · 120px · r 46 · stroke 11 · BUTT caps, 2px gap taken out of
 * each dash · a --chart-track full-circle track sits under the arcs so a small
 * total still reads as a ring".
 *
 * The cap rule is the one to leave alone. Round caps add stroke/2 at BOTH ends,
 * so at stroke 11 every slice paints 11px longer than its arc — this chart's
 * own "Overdue 8" of 211 would read as 6.9% instead of 3.8% and lap the slice
 * next to it. geometry.spec.js asserts both numbers.
 */
const props = defineProps({
  /** [{ label, value, tone }] — at most four, per the sub-block's own title. */
  slices: { type: Array, required: true },
  /** Big number in the hole, and the word under it. */
  centreValue: { type: [String, Number], default: '' },
  centreLabel: { type: String, default: '' },
  size: { type: Number, default: 120 },
})

const RADIUS = 46
const STROKE = 11
const VIEW = 120

const total = computed(() => props.slices.reduce((n, s) => n + s.value, 0))
const segments = computed(() =>
  donutSegments(
    props.slices.map((s) => s.value),
    { radius: RADIUS },
  ),
)
const hole = computed(() => donutHole(RADIUS, STROKE))
const share = (value) => Math.round((value / (total.value || 1)) * 100)
</script>

<template>
  <!-- The slice colour goes through inline `style`, not a `stroke` attribute:
       the tones arrive as var() references, and var() in an SVG presentation
       attribute does not resolve — the ring would simply not paint. -->
  <div data-donut class="donut">
    <div class="donut__ring" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg :viewBox="`0 0 ${VIEW} ${VIEW}`" class="donut__svg" aria-hidden="true">
        <!-- rotated so the first slice starts at twelve o'clock rather than
             three, which is where SVG's angle zero is -->
        <g transform="rotate(-90 60 60)">
          <circle
            class="donut__track"
            cx="60"
            cy="60"
            :r="RADIUS"
            fill="none"
            :stroke-width="STROKE"
          />
          <circle
            v-for="(segment, i) in segments"
            :key="slices[i].label"
            data-donut-slice
            cx="60"
            cy="60"
            :r="RADIUS"
            fill="none"
            :style="{ stroke: slices[i].tone }"
            :stroke-width="STROKE"
            stroke-linecap="butt"
            :stroke-dasharray="`${segment.dash} ${segment.gap}`"
            :stroke-dashoffset="segment.offset"
          />
        </g>
      </svg>
      <!-- Redline "Donut centre · the hole is 2 × (r − stroke/2) = 81px — the
           centre block caps at max-width 70px, line-height 1.2, and wraps. An
           uncapped caption overruns onto the ring, where the SVG sibling is not
           an ancestor background so no contrast check catches it." -->
      <div
        v-if="centreValue !== ''"
        data-donut-centre
        class="donut__centre"
        :style="{ maxWidth: `${Math.min(70, hole - 11)}px` }"
      >
        <div class="donut__centre-value font-mono">{{ centreValue }}</div>
        <div v-if="centreLabel" class="donut__centre-label">{{ centreLabel }}</div>
      </div>
    </div>

    <!-- Redline "Donut legend · rows divided by 1px --divider-row, 7px vertical
         padding · swatch 8px radius 2px · count mono / 700 · share 10.5px in a
         32px right column". Carries the meaning in text, since the SVG is
         aria-hidden. -->
    <ul data-donut-legend class="donut__legend">
      <li v-for="slice in slices" :key="slice.label" class="donut__legend-row">
        <span class="donut__swatch" aria-hidden="true" :style="{ background: slice.tone }" />
        <span class="min-w-0 flex-1 truncate">{{ slice.label }}</span>
        <span class="donut__count font-mono">{{ slice.value }}</span>
        <span class="donut__share">{{ share(slice.value) }}%</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.donut {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(140px, 100%), 1fr));
  gap: 14px;
  align-items: center;
}

.donut__ring {
  position: relative;
  flex: none;
  justify-self: center;
}

.donut__svg {
  display: block;
  width: 100%;
  height: 100%;
}

.donut__track {
  stroke: var(--chart-track);
}

.donut__centre {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  line-height: 1.2;
  text-align: center;
}

.donut__centre-value {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--ink-900);
}

.donut__centre-label {
  font-size: 11px;
  color: var(--text-meta);
}

.donut__legend {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.donut__legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  font-size: 11.5px;
  color: var(--ink-700);
}

.donut__legend-row + .donut__legend-row {
  border-top: 1px solid var(--divider-row);
}

.donut__swatch {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.donut__count {
  font-weight: 700;
  color: var(--ink-900);
}

/* A fixed 32px column, so the shares form a straight edge down the legend. */
.donut__share {
  width: 32px;
  font-size: 10.5px;
  color: var(--text-meta);
  text-align: right;
}
</style>
