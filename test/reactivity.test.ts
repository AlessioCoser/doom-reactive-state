import { signal } from "../src/reactivity"

describe('reactivity', () => {
  it('get the initial value', () => {
    const initial: number = 0
    const [get] = signal(initial)

    expect(get()).toEqual(initial)
  })
})
