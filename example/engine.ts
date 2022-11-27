import { Accessor, Effect, EffectsRegistry, Setter, Signal } from './types'

const createEffectsRegistry = () => {
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

let runningEffect: Effect<any> | null = null
export function effect<T>(component: () => T): T {
  const s = {
    run() {
      runningEffect = this;
      const result = component()
      runningEffect = null
      return result
    }
  }
  return s.run()
}

export function signal<T>(initial: T): Signal<T> {
  const registry: EffectsRegistry = createEffectsRegistry()
  var state: T = initial

  const accessor: Accessor<T> = () => {
    registry.register(runningEffect)
    return state
  }

  const setter: Setter<T> = (newState: T): void => {
    state = newState
    registry.runAll()
  }

  return [accessor, setter]
}
