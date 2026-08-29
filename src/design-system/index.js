/**
 * Public entry point for the design system.
 * Application code imports from '@/design-system', never from deep paths.
 */
export { useTheme } from './composables/useTheme'
export { default as Button } from './components/forms/Button.vue'
export { default as Chip } from './components/feedback/Chip.vue'
export { default as ChipGroup } from './components/feedback/ChipGroup.vue'
export { default as DismissibleChip } from './components/feedback/DismissibleChip.vue'
