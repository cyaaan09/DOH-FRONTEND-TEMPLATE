<script setup>
/**
 * Redline "Split · centre is addressed to you and dismissible; the feed is
 * append-only and never marked read". Two components, because they are two
 * jobs — merging them is how a record's history ends up with a "mark read"
 * button on it.
 */
defineProps({
  /** Array<{ id, tone, glyph, subject?, body, time, action?, unread? }>. */
  items: { type: Array, required: true },
  title: { type: String, default: 'Notifications' },
  markAllLabel: { type: String, default: 'Mark all read' },
  seeAllLabel: { type: String, default: '' },
})

defineEmits(['markAllRead', 'action', 'seeAll'])

// Redline "Tone tiles · error, portal, done, system".
const TONE = {
  error: 'bg-red-100 text-red-700',
  portal: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-text',
  system: 'bg-surface-muted text-text-header',
}
</script>

<template>
  <div
    data-notification-centre
    class="notif overflow-hidden rounded-panel border border-hairline bg-surface"
    role="dialog"
    :aria-label="title"
  >
    <div data-notif-head class="notif__head flex items-center border-b border-divider">
      <span class="notif__title text-ink-900">{{ title }}</span>
      <span
        v-if="items.filter((i) => i.unread).length"
        data-unread-count
        class="notif__count grid flex-none place-items-center rounded-pill bg-red-100 text-chip text-red-700"
        >{{ items.filter((i) => i.unread).length }}</span
      >
      <button
        data-mark-all
        type="button"
        class="notif__mark text-hint font-medium text-green-text"
        @click="$emit('markAllRead')"
      >
        {{ markAllLabel }}
      </button>
    </div>

    <!-- Redline "Live region · arriving notifications announce via
         aria-live=polite". Announced, never stolen focus. -->
    <div aria-live="polite">
      <div
        v-for="item in items"
        :key="item.id"
        data-notif-item
        class="notif__item flex items-start"
        :class="item.unread ? 'notif__item--unread' : ''"
      >
        <span
          data-notif-tile
          aria-hidden="true"
          class="notif__tile grid flex-none place-items-center rounded-field"
          :class="TONE[item.tone] ?? TONE.system"
          >{{ item.glyph }}</span
        >

        <div class="min-w-0 flex-1">
          <p data-notif-body class="notif__body text-ink-700">
            <strong v-if="item.subject" class="notif__subject text-ink-900">{{
              item.subject
            }}</strong>
            {{ item.body }}
          </p>
          <div class="notif__meta flex items-center">
            <span data-notif-time class="notif__time text-ink-300">{{ item.time }}</span>
            <!-- Redline "Item meta · inline action, one per item at most". -->
            <button
              v-if="item.action"
              data-notif-action
              type="button"
              class="notif__action font-medium text-green-text"
              @click="$emit('action', item)"
            >
              {{ item.action }}
            </button>
          </div>
        </div>

        <!-- Redline "Unread · row tint + 7px dot right — never bold text".
             Bolding the body would make unread a typographic state that
             cannot be undone without reflowing the panel. -->
        <span
          v-if="item.unread"
          data-unread-dot
          aria-hidden="true"
          class="notif__dot flex-none rounded-pill"
        />
      </div>
    </div>

    <div v-if="seeAllLabel" data-notif-footer class="notif__footer border-t border-divider">
      <button
        type="button"
        class="notif__see-all text-hint font-medium text-green-text"
        @click="$emit('seeAll')"
      >
        {{ seeAllLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Redline "Panel · max-w 380px · radius --r-panel · --sh-panel". */
.notif {
  max-width: 380px;
  box-shadow: var(--sh-panel);
}

/* Redline "Panel head · 13px 16px · --surface-sunken · title 13.5px / 700". */
.notif__head {
  gap: 8px;
  padding: 13px 16px;
  background: var(--surface-sunken);
}

.notif__title {
  font-size: 13.5px;
  font-weight: 700;
}

.notif__count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
}

.notif__mark {
  margin-left: auto;
  cursor: pointer;
}

/* Redline "Item · pad 12px 16px · 1px top --divider-row · 28px tone tile". */
.notif__item {
  position: relative;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--divider-row);
}

.notif__item--unread {
  background: var(--green-tint-2);
}

.notif__tile {
  width: 28px;
  height: 28px;
  font-size: 12px;
  font-weight: 700;
}

/* Redline "Item · body 13px / 1.4". */
.notif__body {
  font-size: 13px;
  line-height: 1.4;
  text-wrap: pretty;
}

.notif__subject {
  font-weight: 700;
}

.notif__meta {
  gap: 10px;
  margin-top: 3px;
}

.notif__time {
  font-size: 11.5px;
}

.notif__action {
  font-size: 11.5px;
  cursor: pointer;
}

.notif__dot {
  width: 7px;
  height: 7px;
  margin-top: 8px;
  background: var(--green-fill);
}

.notif__footer {
  padding: 10px 16px;
  background: var(--surface-sunken);
  text-align: center;
}

.notif__see-all {
  cursor: pointer;
}
</style>
