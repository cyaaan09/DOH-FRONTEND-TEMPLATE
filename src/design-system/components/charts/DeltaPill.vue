<script setup>
/**
 * The tinted pill beside a chart's figure.
 *
 * Redline "Direction, not sign · the pill's tone follows whether the movement
 * is GOOD, not whether the number rose — overdue renewals falling is green with
 * a ▼". So `tone` and `direction` are separate props and neither is derived
 * from the other: this component cannot know that fewer overdue renewals is an
 * improvement, and a component that guessed would paint half a dashboard the
 * wrong colour with nothing to catch it.
 */
defineProps({
  /** The text inside the pill — "15.8%", "4", "36 at risk", "In good standing". */
  label: { type: String, required: true },
  /** Arrow prefix. Omit for a pill that states a condition rather than a change. */
  direction: {
    type: String,
    default: '',
    validator: (v) => ['', 'up', 'down'].includes(v),
  },
  /** Redline "Delta pill" — good --green-100/--green-text, watch --amber, bad --red. */
  tone: {
    type: String,
    default: 'good',
    validator: (v) => ['good', 'watch', 'bad'].includes(v),
  },
})

const ARROW = { up: '▲', down: '▼' }
</script>

<template>
  <span data-delta class="delta" :class="`delta--${tone}`" :data-direction="direction || undefined">
    <!-- aria-hidden: the arrow is a picture of the word the label already
         carries, and "black up-pointing triangle" is what a screen reader
         would otherwise read out. -->
    <span v-if="direction" aria-hidden="true">{{ ARROW[direction] }}</span>
    {{ label }}
  </span>
</template>

<style scoped>
/* Redline "Delta pill · pad 2px 8px · radius 999px · 11px / 700 · ▲ / ▼ prefix". */
.delta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--r-pill);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.delta--good {
  background: var(--green-100);
  color: var(--green-text);
}

.delta--watch {
  background: var(--amber-100);
  color: var(--amber-text);
}

.delta--bad {
  background: var(--red-100);
  color: var(--red-700);
}
</style>
