<script setup>
/**
 * Redline "Feed rules · append-only — corrections are new entries, the wrong
 * one stays visible". That is the whole difference from the notification
 * centre: there is nothing to dismiss and nothing to mark read, because the
 * feed is a record rather than a queue.
 */
defineProps({
  /** Array<{ id, actor?, initials?, tone?, glyph?, body, time, detail? }>. */
  events: { type: Array, required: true },
  label: { type: String, default: 'Activity' },
})

const TONE = {
  done: 'bg-green-100 text-green-text',
  error: 'bg-red-100 text-red-700',
  portal: 'bg-blue-100 text-blue-700',
  system: 'bg-surface-muted text-text-header',
}
</script>

<template>
  <ol data-activity-feed class="feed" :aria-label="label">
    <!-- An ordered list: the feed is newest-first history, and the order is
         part of the content rather than a styling choice. The comment lives
         INSIDE the root — a leading sibling comment compiles this to a
         Fragment, and wrapper.element then reads the comment node. That has
         now bitten three components in this codebase. -->
    <li v-for="event in events" :key="event.id" data-feed-event class="feed__event">
      <div class="feed__rail">
        <span
          data-feed-mark
          aria-hidden="true"
          class="feed__mark grid flex-none place-items-center rounded-pill"
          :class="event.initials ? 'feed__mark--avatar' : (TONE[event.tone] ?? TONE.system)"
          >{{ event.initials ?? event.glyph }}</span
        >
        <span aria-hidden="true" class="feed__spine" />
      </div>

      <div class="feed__content min-w-0">
        <p data-feed-body class="feed__body text-ink-700">
          <strong v-if="event.actor" class="feed__actor text-ink-900">{{ event.actor }}</strong>
          {{ event.body }}
        </p>
        <div data-feed-time class="feed__time text-ink-300">{{ event.time }}</div>

        <!-- Redline "Feed detail · attachments and quoted reasons render
             INSIDE their own event" — so a correction never floats free of
             the thing it corrects. -->
        <div
          v-if="event.detail"
          data-feed-detail
          class="feed__detail rounded-field border border-divider bg-surface"
        >
          <slot name="detail" :event="event">{{ event.detail }}</slot>
        </div>
      </div>
    </li>
  </ol>
</template>

<style scoped>
/* Redline "Feed spine · grid 26px / 1fr gap 12px · 2px --divider line ·
   16px below each event". */
.feed__event {
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 12px;
}

.feed__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.feed__mark {
  width: 26px;
  height: 26px;
  font-size: 10px;
  font-weight: 700;
}

.feed__mark--avatar {
  background: var(--avatar-bg);
  color: var(--ink-700);
}

.feed__spine {
  flex: 1;
  width: 2px;
  border-radius: var(--r-pill);
  background: var(--divider);
}

.feed__event:last-child .feed__spine {
  display: none;
}

.feed__content {
  padding-bottom: 16px;
}

.feed__event:last-child .feed__content {
  padding-bottom: 0;
}

/* Redline "Feed event · body 13px / 1.45 with the actor in 700". */
.feed__body {
  font-size: 13px;
  line-height: 1.45;
  text-wrap: pretty;
}

.feed__actor {
  font-weight: 700;
}

.feed__time {
  font-size: 11.5px;
  margin-top: 2px;
}

/* Redline "Feed detail · --surface on 1px --divider, radius --r-field". */
.feed__detail {
  margin-top: 8px;
  padding: 9px 11px;
  font-size: 12.5px;
  line-height: 1.45;
}
</style>
