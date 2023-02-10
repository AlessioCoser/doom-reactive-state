import { derive, effect, signal } from "../src/reactivity"

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

  it('register for a value change', () => {
    const calls: number[] = []
    const [get, set] = signal(0)

    effect(() => calls.push(get()))
    set(1)
    set(2)
    set(3)
    set(4)
    set(5)

    expect(calls).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('update the state inside the effect', () => {
    const [get, set] = signal(0)

    effect(() => set(get() * 2))
    set(5)

    expect(get()).toEqual(10)
  })

  it('after a nested effects is completed the currentEffect should be the parent one', () => {
    const [get, set] = signal(0)

    effect(() => {
      effect(() => {})
      set(get() * 2)
    })
    set(5)

    expect(get()).toEqual(10)
  })

  it('derived signal', () => {
    const [get, set] = signal(1)

    const derived = derive(() => get() * 2)

    expect(derived()).toEqual(2)
    set(8)
    expect(derived()).toEqual(16)
  })

  it('derived with multiple signals', () => {
    const [first, setFirst] = signal(2)
    const [second, setSecond] = signal(2)

    const multiple = derive(() => first() * second())

    expect(multiple()).toEqual(4)
    setFirst(5)
    expect(multiple()).toEqual(10)
    setSecond(3)
    expect(multiple()).toEqual(15)
  })
})
