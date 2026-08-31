<script setup>
import { computed } from 'vue'

/**
 * Redline "Stepper · 28px nodes · 2px connector · horizontal ≤4, vertical 5+".
 *
 * Three variants, one rule the redline states outright: a step is only
 * clickable once it has been reached. `done` and `current` render as buttons;
 * `upcoming` is plain text, so there is no forward jump past validation to
 * disable after the fact.
 */
const props = defineProps({
  /**
   * Array<{ key, label, sublabel?, state: 'done'|'current'|'upcoming'|'error' }>.
   * Vertical steps may also carry `chip: { tone, label, dot }`.
   */
  steps: { type: Array, required: true },
  variant: {
    type: String,
    default: 'horizontal',
    validator: (v) => ['horizontal', 'vertical', 'compact'].includes(v),
  },
  /** Accessible name for the list — never drawn (§8.1). */
  label: { type: String, required: true },
  /** Compact only: the line above the meter. */
  title: { type: String, default: '' },
  /** Compact only: the note under the segments. */
  note: { type: String, default: '' },
})

defineEmits(['select'])

// Redline "Connector rule" — a step's trailing connector is green only when
// THAT step is done. The current step's stays unfilled, so the fill visibly
// stops at the node you are on rather than running past it.
const isReached = (step) => step.state === 'done' || step.state === 'current'

const nodeClass = (step) =>
  ({
    done: 'stepper__node--done',
    current: 'stepper__node--current',
    error: 'stepper__node--error',
    upcoming: 'stepper__node--upcoming',
  })[step.state] ?? 'stepper__node--upcoming'

const labelClass = (step) =>
  ({
    done: 'text-ink-700',
    current: 'text-ink-900',
    error: 'text-ink-900',
    upcoming: 'text-text-meta',
  })[step.state] ?? 'text-text-meta'

// Redline "Sub-label" — the current step's remaining work is 500 in the brand
// green; an error's is 500 in the error red. State is in the TEXT as well as
// the colour, which is the ARIA row's requirement, not a nicety.
const subClass = (step) =>
  ({
    done: 'font-normal text-text-meta',
    current: 'font-medium text-green-text',
    error: 'font-medium text-red-700',
    upcoming: 'font-normal text-ink-300',
  })[step.state] ?? 'font-normal text-ink-300'

const glyph = (step, index) =>
  step.state === 'done' ? '✓' : step.state === 'error' ? '!' : String(index + 1)

const percent = computed(() => {
  const done = props.steps.filter((s) => s.state === 'done').length
  return props.steps.length ? Math.round((done / props.steps.length) * 100) : 0
})
</script>

<template>
  <div
    data-stepper
    class="stepper"
    :class="`stepper--${variant}`"
    :style="{ '--stepper-count': steps.length }"
  >
    <!-- Compact: a title, a percentage, one meter, and a segment per step. -->
    <template v-if="variant === 'compact'">
      <div class="stepper__compact-head flex flex-wrap items-center justify-between">
        <div data-compact-title class="text-notice font-bold text-ink-900">{{ title }}</div>
        <div data-compact-percent class="font-mono text-hint text-text-meta">{{ percent }}%</div>
      </div>

      <div data-meter class="stepper__meter overflow-hidden rounded-pill bg-neutral-100">
        <span
          data-meter-fill
          class="stepper__meter-fill block h-full rounded-pill"
          :style="{ width: `${percent}%` }"
        />
      </div>

      <!-- Redline "Compact · 4px segments for ≤4 steps" — above that the
           meter alone carries it, which is what the note explains. -->
      <div v-if="steps.length <= 4" data-segments class="stepper__segments flex">
        <span
          v-for="step in steps"
          :key="step.key"
          data-segment
          class="stepper__segment rounded-pill"
          :class="step.state === 'done' ? 'bg-green-fill' : 'bg-neutral-100'"
        />
      </div>

      <p v-if="note" data-note class="stepper__note text-text-meta">{{ note }}</p>
    </template>

    <!-- Redline "ARIA · ol/li with aria-current=step on the current node". -->
    <ol v-else class="stepper__list" :aria-label="label">
      <li
        v-for="(step, index) in steps"
        :key="step.key"
        data-step
        class="stepper__step"
        :data-state="step.state"
        :aria-current="step.state === 'current' ? 'step' : undefined"
      >
        <div class="stepper__rail">
          <component
            :is="isReached(step) ? 'button' : 'span'"
            data-node
            class="stepper__node grid flex-none place-items-center rounded-pill"
            :class="nodeClass(step)"
            :type="isReached(step) ? 'button' : undefined"
            @click="isReached(step) && $emit('select', step)"
            >{{ glyph(step, index) }}</component
          >
          <span
            v-if="index < steps.length - 1"
            data-connector
            aria-hidden="true"
            class="stepper__connector rounded-pill"
            :class="step.state === 'done' ? 'bg-green-fill' : 'bg-neutral-100'"
          />
        </div>

        <div class="stepper__text min-w-0">
          <div class="stepper__label-row flex flex-wrap items-center">
            <span data-label class="stepper__label" :class="labelClass(step)">{{
              step.label
            }}</span>
            <slot name="chip" :step="step" />
          </div>
          <div v-if="step.sublabel" data-sublabel class="stepper__sublabel" :class="subClass(step)">
            {{ step.sublabel }}
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
/* Redline "Container · pad 18px 20px · 1px --divider · radius --r-panel ·
   --surface-card-muted — a sunken block, not a card". The distinction is the
   point: a card would nest, which Containers forbids. */
.stepper {
  padding: 18px 20px;
  border: 1px solid var(--divider);
  border-radius: var(--r-panel);
  background: var(--surface-card-muted);
}

.stepper--compact {
  padding: 16px 20px;
}

/* --- horizontal ------------------------------------------------------- */
/* Redline "Horizontal · grid repeat(n, minmax(0,1fr)) · gap 12 · 4 steps max".
   minmax(0,1fr) so a long label ellipsises instead of widening the row. */
.stepper--horizontal .stepper__list {
  display: grid;
  grid-template-columns: repeat(var(--stepper-count, 4), minmax(0, 1fr));
  gap: 12px;
}

.stepper--horizontal .stepper__step {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
}

.stepper--horizontal .stepper__rail {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stepper--horizontal .stepper__connector {
  flex: 1;
  height: 2px;
}

/* --- vertical --------------------------------------------------------- */
/* Redline "Vertical · grid 28px / 1fr · gap 12 · 2px spine · 18px below each
   step except the last". */
.stepper--vertical .stepper__step {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 12px;
}

.stepper--vertical .stepper__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stepper--vertical .stepper__connector {
  flex: 1;
  width: 2px;
}

.stepper--vertical .stepper__text {
  padding-bottom: 18px;
}

.stepper--vertical .stepper__step:last-child .stepper__text {
  padding-bottom: 0;
}

/* --- node states ------------------------------------------------------ */
/* Redline "Node · 28px circle · 12px / 700 label". One rule per state, each
   naming every property it owns. */
.stepper__node {
  width: 28px;
  height: 28px;
  border-width: 1.8px;
  border-style: solid;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.stepper__node--done {
  background: var(--green-fill);
  border-color: var(--green-fill);
  color: var(--green-on-fill);
}

.stepper__node--current {
  background: var(--grad-primary);
  border-color: var(--green-fill);
  color: var(--green-on-fill);
  /* Redline "Current · 0 0 0 4px rgba(23,114,54,.12) halo" — --green-fill at
     12%. --ring-select is a different colour and radius, so this is its own
     value written through color-mix rather than a literal. */
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--green-fill) 12%, transparent);
}

.stepper__node--upcoming {
  background: var(--surface);
  border-color: var(--border-field);
  color: var(--ink-300);
}

.stepper__node--error {
  background: var(--red-700);
  border-color: var(--red-700);
  color: var(--red-on-fill);
}

button.stepper__node {
  cursor: pointer;
}

.stepper__node:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

/* --- text ------------------------------------------------------------- */
.stepper__label-row {
  gap: 8px;
}

/* Redline "Step label · 13px / 700 · clips, never wraps". */
.stepper__label {
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stepper--vertical .stepper__label {
  font-size: 13.5px;
}

/* Redline "Sub-label · 11.5px". Vertical carries a date and actor, so it
   runs a step larger and is allowed to wrap. */
.stepper__sublabel {
  font-size: 11.5px;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stepper--vertical .stepper__sublabel {
  font-size: 12px;
  margin-top: 3px;
  white-space: normal;
}

/* --- compact ---------------------------------------------------------- */
.stepper__compact-head {
  gap: 12px;
}

.stepper__meter {
  height: 5px;
  margin-top: 10px;
}

/* Redline "Compact · 5px meter --grad-meter". The artifact renders a
   different gradient here (--green-fill to --green-500); spec §2 gives
   Appendix C the casting vote, and the token also keeps this meter identical
   to every other one on the page. Recorded in §17.3. */
.stepper__meter-fill {
  background: var(--grad-meter);
}

.stepper__segments {
  gap: 5px;
  margin-top: 12px;
}

.stepper__segment {
  flex: 1;
  height: 4px;
}

.stepper__note {
  font-size: 11.5px;
  margin-top: 9px;
}
</style>
