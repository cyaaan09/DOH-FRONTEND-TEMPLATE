import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCounterStore } from '../counter'

describe('counter store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts at zero and increments', () => {
    const counter = useCounterStore()
    expect(counter.count).toBe(0)

    counter.increment()

    expect(counter.count).toBe(1)
    expect(counter.doubleCount).toBe(2)
  })
})
