import { expect, describe, it } from 'vitest'
import { signal } from "../src/reactivity"

describe('reactivity', () => {
  it('get the initial value', () => {
    const initial: number = 0
    const [get] = signal(initial)

    expect(get()).toEqual(initial)
  })

  it('set a new value', () => {
    const [get, set] = signal(0)

    set(1)

    expect(get()).toEqual(1)
  })
})
