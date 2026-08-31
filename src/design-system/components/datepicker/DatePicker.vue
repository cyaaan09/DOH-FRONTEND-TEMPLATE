<script setup>
import {
  DatePickerRoot,
  DatePickerControl,
  DatePickerInput,
  DatePickerTrigger,
  DatePickerPositioner,
  DatePickerContent,
  DatePickerView,
  DatePickerContext,
  DatePickerViewControl,
  DatePickerPrevTrigger,
  DatePickerNextTrigger,
  DatePickerViewTrigger,
  DatePickerRangeText,
  DatePickerTable,
  DatePickerTableHead,
  DatePickerTableHeader,
  DatePickerTableBody,
  DatePickerTableRow,
  DatePickerTableCell,
  DatePickerTableCellTrigger,
  parseDate,
} from '@ark-ui/vue/date-picker'
import { computed } from 'vue'
import { applyMask } from './mask.js'

/**
 * Redline "Input parsing · accepts 04/09/2026, 4 Sep 26, 2026-09-04 ·
 * normalised on blur · calendar is never the only path" — which is the whole
 * argument for this component over a bare calendar: typing beats clicking for
 * a date three years out, so the field stays editable and the popover is the
 * assist.
 */
const props = defineProps({
  /** `single` for one date, `range` for a reporting period. */
  selectionMode: {
    type: String,
    default: 'single',
    validator: (v) => ['single', 'range'].includes(v),
  },
  label: { type: String, required: true },
  /** Redline "Range · two months side by side". */
  numOfMonths: { type: Number, default: 1 },
  /** Redline "Footer · constraint note right". */
  constraint: { type: String, default: '' },
  /** ISO date. Parsed to a DateValue — Zag rejects a raw string. */
  min: { type: String, default: '' },
  max: { type: String, default: '' },
  todayLabel: { type: String, default: 'Today' },
  openLabel: { type: String, default: 'Open calendar' },
})

defineEmits(['valueChange'])

// Zag's min/max are DateValue objects, not strings. Handing it "2026-09-03"
// leaves the machine's setup throwing, and Vue then reports the ROOT as
// "missing template or render function" — which points nowhere near the
// actual cause. parseDate is re-exported by Ark for exactly this.
const minValue = computed(() => (props.min ? parseDate(props.min) : undefined))
const maxValue = computed(() => (props.max ? parseDate(props.max) : undefined))
</script>

<template>
  <DatePickerRoot
    data-date-picker
    :selection-mode="selectionMode"
    :num-of-months="numOfMonths"
    :min="minValue"
    :max="maxValue"
    :positioning="{ gutter: 6 }"
    @value-change="(details) => $emit('valueChange', details)"
  >
    <!-- The mask listens in the CAPTURE phase on the control, not on the input.
         Zag owns this input: its own onInput reads event.target.value and
         writes it into the machine, and Vue then patches the element's value
         back from that state. A listener on the input itself is registered
         after Zag's and loses both ways — it sees the value too late and its
         edit is overwritten on the next patch. Capture runs ancestor-first, so
         by the time Zag reads the event the value is already masked and the
         machine adopts it. -->
    <DatePickerControl
      data-dp-control
      class="dp__control flex items-center rounded-field border border-field bg-surface"
      @input.capture="(event) => applyMask(event.target, event.inputType)"
    >
      <!-- The mask runs on the element, not through a ref: this input belongs
           to Zag's machine, which reads whatever value is on the element when
           it parses. maxlength 10 fits every format the redline names —
           04/09/2026 and 2026-09-26 are both 10, 4 Sep 26 is 8 — and is what
           stops a non-numeric value running past the mask's own 8-digit cap.
           No inputmode="numeric": it would give a numeric keypad on touch and
           make `Sep` untypable, deleting a redlined format on phones only. -->
      <DatePickerInput
        data-dp-input
        class="dp__input min-w-0 flex-1 font-mono"
        :aria-label="label"
        maxlength="10"
      />
      <!-- Redline "Field · 13px glyph --text-meta right". The glyph OPENS the
           calendar; it is a control, so it is named. -->
      <DatePickerTrigger
        data-dp-trigger
        data-icon-button
        class="dp__trigger flex-none rounded-bar text-text-meta"
        :aria-label="openLabel"
        :title="openLabel"
        >▦</DatePickerTrigger
      >
    </DatePickerControl>

    <DatePickerPositioner>
      <DatePickerContent
        data-dp-panel
        class="dp__panel rounded-panel border border-hairline bg-surface"
      >
        <div class="dp__body flex">
          <div v-if="$slots.presets" data-dp-presets class="dp__presets flex-none">
            <slot name="presets" />
          </div>

          <div class="min-w-0 flex-1">
            <DatePickerView view="day">
              <DatePickerContext v-slot="api">
                <DatePickerViewControl data-dp-header class="dp__header flex items-center">
                  <DatePickerPrevTrigger
                    data-dp-prev
                    class="dp__nav rounded-bar"
                    aria-label="Previous month"
                    >‹</DatePickerPrevTrigger
                  >
                  <DatePickerViewTrigger class="dp__month min-w-0 flex-1 text-ink-900">
                    <DatePickerRangeText />
                  </DatePickerViewTrigger>
                  <DatePickerNextTrigger
                    data-dp-next
                    class="dp__nav rounded-bar"
                    aria-label="Next month"
                    >›</DatePickerNextTrigger
                  >
                </DatePickerViewControl>

                <div class="dp__months flex">
                  <!-- Month 0 reads api.weeks; every later month comes from
                       api.getOffset({ months: n }), which returns that
                       month's own weeks AND its visibleRange. Passing the
                       root's visibleRange to an offset month marks the wrong
                       days as outside it. There is no `getWeeks` on this
                       API — reaching for one is what threw "Invalid array
                       length" on the first attempt. -->
                  <DatePickerTable
                    v-for="index in numOfMonths"
                    :key="index"
                    data-dp-month
                    class="dp__table"
                  >
                    <DatePickerTableHead>
                      <DatePickerTableRow>
                        <!-- Redline "Tables · real <table> with <th scope=col>". Ark
                             renders the <th> but sets no scope, so the weekday row was
                             a column of unassociated headers. aria-label carries the
                             long name because `narrow` is a single letter and S/T are
                             each ambiguous between two days when read aloud. -->
                        <DatePickerTableHeader
                          v-for="(day, i) in api.weekDays"
                          :key="i"
                          data-dp-weekday
                          scope="col"
                          :aria-label="day.long"
                          class="dp__weekday"
                          >{{ day.narrow }}</DatePickerTableHeader
                        >
                      </DatePickerTableRow>
                    </DatePickerTableHead>
                    <DatePickerTableBody>
                      <DatePickerTableRow
                        v-for="(week, w) in index === 1
                          ? api.weeks
                          : api.getOffset({ months: index - 1 }).weeks"
                        :key="w"
                      >
                        <DatePickerTableCell
                          v-for="(day, d) in week"
                          :key="d"
                          :value="day"
                          :visible-range="
                            index === 1
                              ? api.visibleRange
                              : api.getOffset({ months: index - 1 }).visibleRange
                          "
                        >
                          <DatePickerTableCellTrigger data-dp-day class="dp__day rounded-control">{{
                            day.day
                          }}</DatePickerTableCellTrigger>
                        </DatePickerTableCell>
                      </DatePickerTableRow>
                    </DatePickerTableBody>
                  </DatePickerTable>
                </div>

                <!-- Redline "Footer · Today link left · constraint note right". -->
                <div data-dp-footer class="dp__footer flex items-center border-t border-divider">
                  <button
                    data-dp-today
                    type="button"
                    class="dp__today text-hint font-medium text-green-text"
                    @click="api.setValue([api.today])"
                  >
                    {{ todayLabel }}
                  </button>
                  <span v-if="constraint" data-dp-constraint class="dp__constraint text-ink-300">{{
                    constraint
                  }}</span>
                  <slot name="actions" />
                </div>
              </DatePickerContext>
            </DatePickerView>
          </div>
        </div>
      </DatePickerContent>
    </DatePickerPositioner>
  </DatePickerRoot>
</template>

<style scoped>
/* Redline "Field · 38px · mono value · focus 1px --green-fill + 3px ring". */
.dp__control {
  height: var(--h-field);
  gap: 8px;
  padding: 0 8px 0 12px;
}

.dp__control:focus-within {
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}

.dp__input {
  border: 0;
  background: transparent;
  font-size: 13.5px;
  color: var(--ink-900);
  outline: none;
}

.dp__trigger {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  font-size: 13px;
  cursor: pointer;
}

@media (hover: hover) {
  .dp__trigger:hover {
    background: var(--surface-muted);
    color: var(--ink-900);
  }
}

/* Redline "Popover · 280px · pad 12px · radius --r-panel · --sh-panel". */
.dp__panel {
  padding: 12px;
  box-shadow: var(--sh-panel);
  z-index: var(--z-popover);
}

.dp__body {
  gap: 12px;
}

/* Redline "Presets · 120px column · 1px right --divider". */
.dp__presets {
  width: 120px;
  padding-right: 12px;
  border-right: 1px solid var(--divider);
}

/* Redline "Month header · 13px / 700 centred · 28px nav buttons". */
.dp__header {
  gap: 6px;
  margin-bottom: 8px;
}

.dp__month {
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  background: none;
  border: 0;
  cursor: pointer;
}

.dp__nav {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  color: var(--text-meta);
  cursor: pointer;
}

@media (hover: hover) {
  .dp__nav:hover {
    background: var(--surface-muted);
  }
}

/* Redline "Range · two months side by side, gap 16px". */
.dp__months {
  gap: 16px;
}

.dp__table {
  border-collapse: separate;
  border-spacing: 2px;
}

/* Redline "Weekday row · 24px · 10.5px / 700 / 0.06em --ink-300". */
.dp__weekday {
  height: 24px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--ink-300);
}

/* Redline "Day cell · 32px · radius --r-control · 12.5px · 44px on touch". */
.dp__day {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  font-size: 12.5px;
  color: var(--ink-700);
  cursor: pointer;
}

@media (hover: hover) {
  .dp__day:hover:not([data-selected]) {
    background: var(--surface-muted);
  }
}

/* Redline "Day states". One rule per state, each naming what it owns. */
.dp__day[data-outside-range] {
  color: var(--ink-100);
}

.dp__day[data-today]:not([data-selected]) {
  box-shadow: inset 0 0 0 1px var(--notice-border-green);
  color: var(--green-fill);
  font-weight: 700;
}

.dp__day[data-selected] {
  background: var(--green-fill);
  color: var(--green-on-fill);
  font-weight: 700;
}

/* Redline "Range · between --green-100 / --green-text". */
.dp__day[data-in-range]:not([data-selected]) {
  background: var(--green-100);
  color: var(--green-text);
}

/* Redline "Day states · unavailable --border-soft struck" — struck, not
   hidden: the rule card says an unavailable date must still be visible so
   the user learns the constraint instead of hunting for a missing day. */
.dp__day[data-disabled] {
  color: var(--border-soft);
  text-decoration: line-through;
  cursor: not-allowed;
}

.dp__day:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

.dp__footer {
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
}

.dp__today {
  cursor: pointer;
}

.dp__constraint {
  font-size: 11.5px;
  margin-left: auto;
}

/* Redline "Mobile · popover goes full-width under 420px with 44px cells". */
@media (max-width: 419px) {
  .dp__day {
    width: 44px;
    height: 44px;
  }
}
</style>
