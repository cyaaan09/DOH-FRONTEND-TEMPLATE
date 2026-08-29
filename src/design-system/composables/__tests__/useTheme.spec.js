import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useTheme } from '../useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    // jsdom's matchMedia is incomplete; useDark reads prefers-color-scheme
    // through it. Stub it so the initial value is deterministic.
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })
  })

  it('writes the theme to data-theme on the document element', async () => {
    const { isDark } = useTheme()

    isDark.value = true
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    isDark.value = false
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('never uses the dark class convention', async () => {
    const { isDark } = useTheme()

    isDark.value = true
    await nextTick()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggleTheme flips the current value', async () => {
    const { isDark, toggleTheme } = useTheme()

    const before = isDark.value
    toggleTheme()
    await nextTick()
    expect(isDark.value).toBe(!before)
  })
})
