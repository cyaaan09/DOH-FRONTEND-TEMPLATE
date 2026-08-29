import { useDark, useToggle } from '@vueuse/core'

/**
 * Design-system theme state.
 *
 * The system is authored against `[data-theme="dark"]`, not a `.dark` class,
 * so this writes an attribute. Light mode writes `data-theme="light"`, which
 * matches nothing in the stylesheets — the `:root` block is the light palette.
 *
 * @returns {{ isDark: import('vue').WritableComputedRef<boolean>, toggleTheme: () => boolean }}
 */
export function useTheme() {
  const isDark = useDark({
    selector: 'html',
    attribute: 'data-theme',
    valueDark: 'dark',
    valueLight: 'light',
    storageKey: 'theme',
  })

  return { isDark, toggleTheme: useToggle(isDark) }
}
