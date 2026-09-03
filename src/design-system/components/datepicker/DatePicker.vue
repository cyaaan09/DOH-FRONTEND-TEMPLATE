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
import { computed, ref } from 'vue'
import { applyMask, isMaskable } from './mask.js'
import { formatDate, parseDateInput, toIso } from './parse.js'

// Four columns for both the month and the year grid: twelve months divide
// evenly into it, and a decade's ten years fill three rows the same width, so
// the panel does not change size when you drill from one view to the next.
const MONTH_COLUMNS = 4

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
  /**
   * How a purely numeric date is read. Appendix C's three examples —
   * `04/09/2026`, `4 Sep 26`, `2026-09-04` — all denote 4 September 2026,
   * which makes the slash form DAY-first, and that is the default. But the
   * same page draws a Sunday-first calendar, so the artifact is not
   * self-consistent, and the reading that matters is the one the people
   * entering records actually use. One prop, and the mask's auto-advance
   * thresholds follow it: pass `mdy` and the field becomes month-first
   * everywhere, including the placeholder.
   *
   * Whichever way it is set, `format` normalises to `04 Sep 2026` on blur, so
   * a misread date is visible immediately rather than silently stored.
   */
  dateOrder: {
    type: String,
    default: 'dmy',
    validator: (v) => ['dmy', 'mdy'].includes(v),
  },
})

defineEmits(['valueChange'])

// Zag's min/max are DateValue objects, not strings. Handing it "2026-09-03"
// leaves the machine's setup throwing, and Vue then reports the ROOT as
// "missing template or render function" — which points nowhere near the
// actual cause. parseDate is re-exported by Ark for exactly this.
/**
 * Redline "Input parsing · normalised on blur". Zag calls `format` whenever it
 * renders a committed value and `parse` whenever it reads the field, so these
 * two props are the whole feature — the field accepted only digits and slashes
 * and never normalised at all before they existed.
 */
const formatValue = (date) => formatDate({ year: date.year, month: date.month, day: date.day })

// undefined, not a guess: returning a date for unparseable text would commit
// whatever the user half-typed. Zag keeps the previous value on undefined.
const parseValue = (value) => {
  const parts = parseDateInput(value, { order: props.dateOrder })
  return parts ? parseDate(toIso(parts)) : undefined
}

// The placeholder is the order, spelled out. Left unset, Zag falls back to its
// en-US default of mm/dd/yyyy — which is how this field came to LOOK
// month-first while parsing nothing at all.
const placeholderText = computed(() => (props.dateOrder === 'mdy' ? 'mm/dd/yyyy' : 'dd/mm/yyyy'))

/**
 * Lets the redlined textual formats survive being typed.
 *
 * Zag blocks them in TWO places, both on the input and both in the bubble
 * phase, which is why these listeners sit on the control and capture:
 *
 *   getInputProps().onBeforeInput  preventDefault()s any character that is not
 *                                  a digit or the locale separator — this is
 *                                  what silently ate the letters in `4 Sep 26`.
 *   getInputProps().onInput        rewrites the value through
 *                                  ensureValidCharacters(), so anything that
 *                                  did get in is stripped on the next keystroke.
 *
 * Neither is configurable. But `onBlur` and the Enter handler read
 * `event.currentTarget.value` RAW and hand it to the machine, which runs our
 * `parse` — so the only thing standing between the field and its own redline
 * was those two handlers seeing the event at all.
 */
/**
 * What the user has literally pressed, before the mask touched it.
 *
 * The mask has to guess: typing `2` `0` `2` `6` in a day-first field becomes
 * `20/26/`, and typing `2` `0` `2` gets a padded month — `20/02/`. Both guesses
 * are right until a `-` proves the value was an ISO date all along, and by then
 * the inserted zero cannot be told from a typed one. Removing separators is not
 * enough; only the original keystrokes are.
 */
const typed = ref('')

const allowTextInput = (event) => {
  const { inputType, data } = event
  if (inputType === 'insertText' && data) {
    if (typed.value !== null) typed.value += data
  } else if (inputType.startsWith('delete')) {
    if (typed.value !== null) typed.value = typed.value.slice(0, -1)
  } else {
    // A paste or a composition: the record can no longer be reconstructed from
    // keystrokes, so it is marked broken rather than left subtly wrong.
    typed.value = null
  }

  // Zag's onBeforeInput only ever cancels; stopping it cannot break anything
  // else, and letting it run is what makes `Sep` untypable.
  event.stopPropagation()
}

const onControlInput = (event) => {
  const el = event.target
  if (isMaskable(el.value)) {
    applyMask(el, event.inputType, props.dateOrder)
    return
  }
  // A textual or ISO form from here on.
  //
  // The mask has already committed its guess by now, so put back exactly what
  // was pressed. Only when the record still corresponds to what is on screen:
  // a paste or a mid-string edit desyncs it, and there the older, cruder repair
  // — drop the separators the mask added — is still better than nothing.
  // The record IS the repair whenever it is intact — including, especially,
  // when its digits differ from what is on screen, because a padded zero is
  // exactly the difference it exists to undo. Only a paste falls back.
  const undone =
    typed.value !== null && typed.value !== ''
      ? typed.value
      : el.value.replace(/\//g, '').replace(/\s+/g, ' ')
  if (undone !== el.value) {
    const caret = Math.max(
      0,
      (el.selectionStart ?? undone.length) - (el.value.length - undone.length),
    )
    el.value = undone
    el.setSelectionRange(caret, caret)
  }

  // Hand it to nobody: Zag's onInput would strip it back to digits, and its
  // onBlur reads the element directly regardless.
  event.stopPropagation()
}

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
    :format="formatValue"
    :parse="parseValue"
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
      @focus="typed = ''"
      @beforeinput.capture="allowTextInput"
      @input.capture="onControlInput"
    >
      <!-- The mask runs on the element, not through a ref: this input belongs
           to Zag's machine, which reads whatever value is on the element when
           it parses. maxlength 18 fits the longest form the field now accepts
           (`04 September 2026` is 17) while still stopping a value from running
           away; the mask's own 8-digit cap governs the numeric form.
           No inputmode="numeric": it would give a numeric keypad on touch and
           make `Sep` untypable, deleting a redlined format on phones only. -->
      <!-- fix-on-blur: without it Zag's INPUT.BLUR only FOCUSES the parsed date
           — the calendar moves to the right month and the field keeps the raw
           text, because context.value never changes and the sync that runs
           `format` is watched on value. Enter always worked; tabbing away did
           not, which is the redline's "normalised on blur" exactly. -->
      <DatePickerInput
        data-dp-input
        class="dp__input min-w-0 flex-1 font-mono"
        :aria-label="label"
        maxlength="18"
        :fix-on-blur="true"
        :placeholder="placeholderText"
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
                  <DatePickerViewTrigger data-dp-view class="dp__month min-w-0 flex-1 text-ink-900">
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
              </DatePickerContext>
            </DatePickerView>

            <!-- Appendix C's "Month header" row specifies a centred label and
                 ‹ › buttons and nothing else, so reaching December 2029 was 39
                 clicks. These two views are a deliberate ADDITION, recorded in
                 spec §17.3: the header keeps its redlined 13px/700 centred
                 appearance and only becomes a button, so nothing the redline
                 does specify changes. DatePickerViewTrigger was already in the
                 markup — it switched the machine to a view that rendered
                 nothing, which is why clicking the month did nothing at all. -->
            <DatePickerView view="month">
              <DatePickerContext v-slot="api">
                <DatePickerViewControl data-dp-header class="dp__header flex items-center">
                  <DatePickerPrevTrigger
                    data-dp-prev
                    class="dp__nav rounded-bar"
                    aria-label="Previous year"
                    >‹</DatePickerPrevTrigger
                  >
                  <DatePickerViewTrigger data-dp-view class="dp__month min-w-0 flex-1 text-ink-900">
                    <DatePickerRangeText />
                  </DatePickerViewTrigger>
                  <DatePickerNextTrigger
                    data-dp-next
                    class="dp__nav rounded-bar"
                    aria-label="Next year"
                    >›</DatePickerNextTrigger
                  >
                </DatePickerViewControl>

                <DatePickerTable
                  view="month"
                  :columns="MONTH_COLUMNS"
                  data-dp-month-grid
                  class="dp__table dp__table--wide"
                >
                  <DatePickerTableBody>
                    <DatePickerTableRow
                      v-for="(row, r) in api.getMonthsGrid({
                        columns: MONTH_COLUMNS,
                        format: 'short',
                      })"
                      :key="r"
                    >
                      <DatePickerTableCell
                        v-for="cell in row"
                        :key="cell.value"
                        :value="cell.value"
                        :columns="MONTH_COLUMNS"
                      >
                        <DatePickerTableCellTrigger
                          data-dp-cell
                          class="dp__day dp__day--wide rounded-control"
                          >{{ cell.label }}</DatePickerTableCellTrigger
                        >
                      </DatePickerTableCell>
                    </DatePickerTableRow>
                  </DatePickerTableBody>
                </DatePickerTable>
              </DatePickerContext>
            </DatePickerView>

            <DatePickerView view="year">
              <DatePickerContext v-slot="api">
                <DatePickerViewControl data-dp-header class="dp__header flex items-center">
                  <DatePickerPrevTrigger
                    data-dp-prev
                    class="dp__nav rounded-bar"
                    aria-label="Previous decade"
                    >‹</DatePickerPrevTrigger
                  >
                  <DatePickerViewTrigger data-dp-view class="dp__month min-w-0 flex-1 text-ink-900">
                    <DatePickerRangeText />
                  </DatePickerViewTrigger>
                  <DatePickerNextTrigger
                    data-dp-next
                    class="dp__nav rounded-bar"
                    aria-label="Next decade"
                    >›</DatePickerNextTrigger
                  >
                </DatePickerViewControl>

                <DatePickerTable
                  view="year"
                  :columns="MONTH_COLUMNS"
                  data-dp-year-grid
                  class="dp__table dp__table--wide"
                >
                  <DatePickerTableBody>
                    <DatePickerTableRow
                      v-for="(row, r) in api.getYearsGrid({ columns: MONTH_COLUMNS })"
                      :key="r"
                    >
                      <DatePickerTableCell
                        v-for="cell in row"
                        :key="cell.value"
                        :value="cell.value"
                        :columns="MONTH_COLUMNS"
                      >
                        <DatePickerTableCellTrigger
                          data-dp-cell
                          class="dp__day dp__day--wide rounded-control"
                          >{{ cell.label }}</DatePickerTableCellTrigger
                        >
                      </DatePickerTableCell>
                    </DatePickerTableRow>
                  </DatePickerTableBody>
                </DatePickerTable>
              </DatePickerContext>
            </DatePickerView>

            <!-- The footer is a SIBLING of the three views, not a child of the
                 day view. Appendix D.1's rule card is "Unavailable, not hidden
                 — out-of-range days stay visible with a strike, with the reason
                 spelled out in the footer". Adding the month and year views put
                 struck cells on two screens the footer did not reach, so the
                 strike appeared with nothing to explain it — which is the half
                 of that rule the card actually cares about. It also keeps Today
                 reachable from every view. -->
            <DatePickerContext v-slot="api">
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
/* The month and year grids are four columns, not seven, so their cells take
   the panel's width rather than the redlined 32px square. Everything else —
   height, radius, type, and every state colour — is the day cell's, because a
   selected month should not look like a different kind of selection. */
.dp__day--wide {
  width: auto;
  min-width: 56px;
}

.dp__table--wide {
  width: 100%;
}

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
