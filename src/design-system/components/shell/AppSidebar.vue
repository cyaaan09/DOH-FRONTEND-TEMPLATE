<script setup>
/**
 * Redline "App shell — sidebar & header". One rail, two widths: 244px
 * expanded, 62px collapsed, transitioning on --t-rail.
 *
 * The collapsed state is where the accessibility work is. Redline
 * "Collapsed item · title + aria-label required (the label is the only name
 * once text drops)" — with the text gone, the mark is decorative and cannot
 * name anything, so every item carries its label as an accessible name in
 * both states rather than gaining one on collapse.
 */
defineProps({
  /** Array<{ label, groups }> — see `groups`. */
  groups: { type: Array, required: true },
  /** The active item's key. */
  active: { type: String, default: '' },
  collapsed: { type: Boolean, default: false },
  brand: { type: Object, default: () => ({ mark: 'OL', name: 'OLRS', org: '' }) },
  account: { type: Object, default: null },
  collapseLabel: { type: String, default: 'Collapse navigation' },
})

defineEmits(['select', 'toggle'])

// Redline "Item mark · square PTC, circle LTO, diamond config · decorative".
const MARK_SHAPE = {
  square: 'nav__mark--square',
  circle: 'nav__mark--circle',
  diamond: 'nav__mark--diamond',
}
</script>

<template>
  <nav
    data-app-sidebar
    class="rail flex flex-col overflow-hidden bg-surface"
    :class="collapsed ? 'rail--collapsed' : ''"
    :aria-label="brand.name"
  >
    <div data-brand class="rail__brand flex items-center border-b border-divider">
      <span data-logo aria-hidden="true" class="rail__logo grid flex-none place-items-center">{{
        brand.mark
      }}</span>
      <span v-if="!collapsed" class="min-w-0 flex-1">
        <span data-brand-name class="rail__brand-name block text-ink-900">{{ brand.name }}</span>
        <span v-if="brand.org" class="rail__brand-org block text-text-meta">{{ brand.org }}</span>
      </span>
      <!-- Redline "Icon-only control" — the meta grey at 4.83:1, with an aria-label AND a
           title — never the caret grey, which is decorative only".

           Deliberately NOT data-icon-button. The touch redline's own precedent
           is "17px box inside a 44px tappable row on touch": the ROW is the
           target, not the glyph. Forcing 44px here overflowed the 62px
           collapsed rail — measured at 62px box against 100px of content. -->
      <button
        data-collapse
        type="button"
        class="rail__icon-btn grid flex-none place-items-center rounded-bar"
        :aria-label="collapseLabel"
        :title="collapseLabel"
        @click="$emit('toggle')"
      >
        {{ collapsed ? '›' : '‹' }}
      </button>
    </div>

    <!-- Scrolls on its own: the rail is a fixed height now, and a nav longer
         than the viewport would otherwise push the account footer out of it. -->
    <div class="rail__body flex-1">
      <template v-for="group in groups" :key="group.label">
        <div v-if="!collapsed" data-group class="rail__group text-text-header">
          {{ group.label }}
        </div>
        <button
          v-for="item in group.items"
          :key="item.key"
          data-nav-item
          type="button"
          class="nav flex items-center rounded-field"
          :class="item.key === active ? 'nav--active' : ''"
          :aria-current="item.key === active ? 'page' : undefined"
          :title="collapsed ? item.label : undefined"
          :aria-label="collapsed ? item.label : undefined"
          @click="$emit('select', item)"
        >
          <span
            data-mark
            aria-hidden="true"
            class="nav__mark flex-none"
            :class="MARK_SHAPE[item.mark] ?? MARK_SHAPE.square"
          />
          <span v-if="!collapsed" class="nav__label min-w-0 flex-1">{{ item.label }}</span>
          <!-- Redline "Collapsed badge · 7px dot" — a number is unreadable at
               62px, so it degrades to presence rather than shrinking. -->
          <span
            v-if="item.badge && !collapsed"
            data-badge
            class="nav__badge grid flex-none place-items-center"
            >{{ item.badge }}</span
          >
          <span v-else-if="item.badge" data-badge-dot aria-hidden="true" class="nav__dot" />
        </button>
      </template>
    </div>

    <div v-if="account" data-account class="rail__footer flex items-center border-t border-divider">
      <span data-avatar aria-hidden="true" class="rail__avatar grid flex-none place-items-center">{{
        account.initials
      }}</span>
      <span v-if="!collapsed" class="min-w-0 flex-1">
        <span class="rail__account-name block text-ink-900">{{ account.name }}</span>
        <span class="rail__account-role block text-text-meta">{{ account.role }}</span>
      </span>
      <button
        v-if="!collapsed"
        data-account-menu
        type="button"
        class="rail__icon-btn grid flex-none place-items-center rounded-bar"
        :aria-label="`Account menu for ${account.name}`"
        :title="`Account menu for ${account.name}`"
      >
        ⋯
      </button>
    </div>
  </nav>
</template>

<style scoped>
/* Redline "Rail width · 244px expanded · 62px collapsed (transition 160ms)"
   and "Rail surface · 1px right --border-card · sticky top 0 · h 100vh". */
/* Redline "Rail surface · sticky top 0 · h 100vh". Written as 100% rather than
   100vh: in an app shell the parent IS the viewport, so they are the same, but
   100vh would also force full height inside the design-system section's own
   fixed-height previews and anywhere else a rail is embedded in something
   smaller. The height is what pushes .rail__body's flex-1 down and lands the
   account footer at the FOOT of the rail — without it the footer sat directly
   under the last nav item with bare canvas below. */
.rail {
  position: sticky;
  top: 0;
  height: 100%;
  width: var(--rail-w);
  border-right: 1px solid var(--border-card);
  transition: width var(--t-rail);
}

.rail--collapsed {
  width: var(--rail-w-collapsed);
}

.rail__body {
  overflow-y: auto;
}

.rail__brand {
  gap: 10px;
  padding: 16px 16px 13px;
}

/* Redline "Logo tile · 30x30px · radius --r-field · --green-900 with
   --logo-ink 10.5px / 700". */
.rail__logo {
  width: 30px;
  height: 30px;
  border-radius: var(--r-field);
  background: var(--green-900);
  color: var(--logo-ink);
  font-size: 10.5px;
  font-weight: 700;
}

.rail__brand-name {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.005em;
}

.rail__brand-org {
  font-size: 11px;
}

/* Redline "Icon-only control · --text-meta (4.83:1)" — NOT the --ink-300
   caret grey, which is decorative and fails as a control's only colour. */
.rail__icon-btn {
  width: 22px;
  height: 22px;
  color: var(--text-meta);
  font-size: 12px;
  cursor: pointer;
}

@media (hover: hover) {
  .rail__icon-btn:hover {
    background: var(--surface-muted);
    color: var(--ink-900);
  }
}

.rail__body {
  padding: 6px 8px 10px;
}

/* Redline "Group header · pad 14px 8px 7px · 10.5px / 700 / 0.1em" — 0.1em,
   a touch wider than the 0.08em column header elsewhere. */
.rail__group {
  padding: 14px 8px 7px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

/* Redline "Nav item · pad 8px 10px · radius --r-field · gap 10px ·
   13.5px / 400 --nav-ink". */
.nav {
  width: 100%;
  gap: 10px;
  padding: 8px 10px;
  font-size: 13.5px;
  color: var(--nav-ink);
  cursor: pointer;
  text-align: left;
}

@media (hover: hover) {
  .nav:hover:not(.nav--active) {
    background: var(--surface-muted);
    color: var(--ink-900);
  }
}

/* Redline "Nav active · --grad-primary · --green-on-fill / 700, 6.01:1 at
   the lightest stop" — the only gradient on the screen, which is the rule
   card's whole point. */
.nav--active {
  background: var(--grad-primary);
  color: var(--green-on-fill);
  font-weight: 700;
  box-shadow: 0 1px 2px rgb(16 24 40 / 0.1);
}

.nav__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Redline "Item mark · 13px · 1.8px --item-mark · square PTC, circle LTO,
   diamond config · decorative, 1.4.11 exempt beside its label". */
.nav__mark {
  width: 13px;
  height: 13px;
  border: 1.8px solid var(--item-mark);
}

.nav--active .nav__mark {
  border-color: var(--green-on-fill);
}

.nav__mark--square {
  border-radius: 3px;
}

.nav__mark--circle {
  border-radius: 50%;
}

.nav__mark--diamond {
  border-radius: 2px;
  transform: rotate(45deg) scale(0.86);
}

/* Redline "Nav badge · min-w 20px h 20px · radius 10px · --red-100 /
   --red-700 11px / 700". */
.nav__badge {
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 10px;
  background: var(--red-100);
  color: var(--red-700);
  font-size: 11px;
  font-weight: 700;
}

/* Redline "Badge on active" — the fill's own foreground at 25% behind it,
   written against --green-on-fill so it follows that token on dark rather
   than staying white over a near-black label. */
.nav--active .nav__badge {
  background: color-mix(in srgb, var(--green-on-fill) 25%, transparent);
  color: var(--green-on-fill);
}

/* Redline "Collapsed badge · 7px dot --red-500 · 2px --surface ring". */
.nav__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--red-500);
  box-shadow: 0 0 0 2px var(--surface);
}

.rail--collapsed .nav {
  justify-content: center;
  padding: 8px;
  position: relative;
}

.rail--collapsed .nav__dot {
  position: absolute;
  top: 5px;
  right: 5px;
}

/* Redline "Rail footer · pad 12px 14px · --surface-card-muted". */
.rail__footer {
  gap: 10px;
  padding: 12px 14px;
  background: var(--surface-card-muted);
}

/* Redline "Avatar · 34px circle · --avatar-bg · ring 1px --border-card". */
.rail__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--avatar-bg);
  color: var(--ink-700);
  font-size: 11.5px;
  font-weight: 700;
  box-shadow: 0 0 0 1px var(--border-card);
}

.rail__account-name {
  font-size: 12.5px;
  font-weight: 700;
}

.rail__account-role {
  font-size: 11px;
}

.nav:focus-visible,
.rail__icon-btn:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
