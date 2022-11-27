type EffectsRegistry = { runAll: () => void, register: (effect: Effect<any> | null) => void}
const createEffectsRegistry = () => {
  const registeredEffects: Effect<any>[] = []
  const notYetRegistered = (e: Effect<any>) => !registeredEffects.some(r => r === e)

  return {
    runAll: () => registeredEffects.forEach(registered => registered.run()),
    register: (effect: Effect<any> | null): void => {
      if(effect && notYetRegistered(effect)) {
        registeredEffects.push(effect)
      }
    }
  }
}

type Effect<T> = {run: () => T}
let runningEffect: Effect<any> | null = null
export function effect<T>(component: () => T): T {
  const s = {
    run() {
      runningEffect = this
      const result = component()
      runningEffect = null
      return result
    }
  }
  return s.run()
}

export type Signal<T> = [() => T, (v: T) => void]
export function signal<T>(initial: T): Signal<T> {
  const registry: EffectsRegistry = createEffectsRegistry()
  var state: T = initial

  return [
    function accessor() {
      registry.register(runningEffect)
      return state
    },
    function setter (newState: T): void {
      state = newState
      registry.runAll()
    }
  ]
}
