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

export function derive<T>(fn: () => T): Accessor<T> {
  const [get, set] = signal<T>(fn())
  effect(() => set(fn()))
  return get
}

type Accessor<T> = () => T
type Setter<T> = (value: T) => void
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
