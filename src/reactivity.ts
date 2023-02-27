let runningEffect: Effect | null = null

type EffectsRegistry = { runAll: () => void, register: () => void}
const createEffectsRegistry = (): EffectsRegistry => {
  const effects: Effect[] = []
  const notYetRegistered = () => !effects.some(effect => effect === runningEffect)
  const isNotRunning = (effect: Effect) => effect !== runningEffect

  return {
    runAll: () => effects.filter(isNotRunning).forEach(effect => effect.run()),
    register: () => {
      if(runningEffect && notYetRegistered()) {
        effects.push(runningEffect)
      }
    }
  }
}

type Effect = {run: () => void}
export function effect(fn: () => void): void {
  const _effect = {
    run() {
      const previousEffect = runningEffect
      runningEffect = this
      fn()
      runningEffect = previousEffect
    }
  }
  _effect.run()
}

export function derive<T>(a: () => T): Accessor<T>
export function derive<T>(a: T, b?: (current: Accessor<T>) => T): Accessor<T>
export function derive<T>(a: unknown, b?: unknown): Accessor<T> {
  if (typeof a === 'function') {
    const fn = a as () => T
    const [get, set] = signal<T>(fn())
    effect(() => set(fn()))
    return get
  }
  const initial = a as T
  const fn = b as (current: Accessor<T>) => T
  const [get, set] = signal<T>(initial)
  effect(() => set(fn(get)))
  return get
}

export type Accessor<T> = () => T
export type Setter<T> = (value: T) => void
export type Signal<T> = [Accessor<T>, Setter<T>]
export function signal<T>(initial: T): Signal<T> {
  let _signal: T = initial
  const registry = createEffectsRegistry()

  const accessor = function () {
    registry.register()
    return _signal
  }

  const setter = (value: T) => {
    _signal = value
    registry.runAll()
  }

  return [
    accessor,
    setter
  ]
}
