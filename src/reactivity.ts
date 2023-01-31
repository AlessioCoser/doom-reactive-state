let runningEffect: Effect | null = null

type Effect = () => void
export function effect(fn: Effect) {
  runningEffect = fn
  const result = fn()
  runningEffect = null
  return result
}

type Accessor<T> = () => T
type Setter<T> = (value: T) => void
export function signal<T>(initial: T): [Accessor<T>, Setter<T>] {
  let _signal: T = initial
  const effects: Effect[] = []

  const accessor = function () {
    if (runningEffect) {
      effects.push(runningEffect)
    }
    return _signal
  }

  const setter = (value: T) => {
    _signal = value
    effects.forEach((effect) => effect())
  }

  return [
    accessor,
    setter
  ]
}
