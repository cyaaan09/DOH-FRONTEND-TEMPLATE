/**
 * Public entry point for the design system.
 * Application code imports from '@/design-system', never from deep paths.
 */
export { useTheme } from './composables/useTheme'
export { default as Button } from './components/forms/Button.vue'
export { default as Chip } from './components/feedback/Chip.vue'
export { default as ChipGroup } from './components/feedback/ChipGroup.vue'
export { default as DismissibleChip } from './components/feedback/DismissibleChip.vue'
export { default as Card } from './components/surfaces/Card.vue'
export { default as CardHeader } from './components/surfaces/CardHeader.vue'
export { default as CardBody } from './components/surfaces/CardBody.vue'
export { default as CardFooter } from './components/surfaces/CardFooter.vue'
export { default as TextField } from './components/forms/TextField.vue'
export { default as Textarea } from './components/forms/Textarea.vue'
export { default as SearchField } from './components/forms/SearchField.vue'
export { default as StatCard } from './components/surfaces/StatCard.vue'
export { default as Meter } from './components/surfaces/Meter.vue'
