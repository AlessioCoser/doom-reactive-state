type EffectsRegistry = { runAll: () => void, register: (effect: Effect<any> | null) => void}
const createEffectsRegistry: (() => EffectsRegistry) = () => {
  const registeredEffects: Effect<any>[] = []

  const notYetRegistered = (effect: Effect<any> | null): boolean => {
    if (!effect) return false
    return !registeredEffects.some(registered => registered === effect)
  }

  return {
    runAll: () => registeredEffects.forEach(registered => registered.run()),
    register: (effect: Effect<any> | null): void => {
      if(notYetRegistered(effect)) {
        registeredEffects.push(effect)
      }
    }
  }
}

type Accessor<T> = () => T
type Setter<T> = (v: T) => void
export type Signal<T> = [Accessor<T>, Setter<T>]
export function signal<T>(initial: T): Signal<T> {
  const { register, runAll } = createEffectsRegistry()
  var state: T = initial

  const accessor: Accessor<T> = () => {
    register(runningEffect)
    return state
  }

  const setter: Setter<T> = (newState: T): void => {
    state = newState
    runAll()
  }

  return [accessor, setter]
}

export type Effect<T> = {run: () => T}
let runningEffect: Effect<any> | null = null
let previousObserver: Effect<any> | null = null

export function createEffect<T>(component: () => T): Effect<T> {
  return {
    run() {
      previousObserver = runningEffect
      runningEffect = this;
      const result = component()
      runningEffect = previousObserver
      return result
    }
  }
}

export function effect<T>(component: () => T): T {
  const s = createEffect(component)
  return s.run()
}
