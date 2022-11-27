export type Accessor<T> = () => T
export type Setter<T> = (v: T) => void

export function useState<T>(initial: T): [Accessor<T>, Setter<T>] {
  const registeredEffects: Effect<any>[] = []

  const toRegister = (effect: Effect<any> | null) => {
    if (!effect) return false
    return !registeredEffects.some(registered => registered === effect)
  }

  return (function () {
    var state: T = initial
    const accessor: Accessor<T> = function accessor() {
      if(toRegister(runningEffect)) {
        registeredEffects.push(runningEffect)
      }
      return state
    }

    const setter: Setter<T> = function setter(newState: T): void {
      state = newState
      registeredEffects.forEach(registered => registered.run())
    }

    return [accessor, setter]
  })()
}

export type Component<T> = (...x: any) => T

export type Effect<T> = {run: Component<T>}
let runningEffect: Effect<any> | null = null
let previousObserver: Effect<any> | null = null

export function createEffect<T>(component: Component<T>): Effect<T> {
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

export function effect<T>(component: Component<T>): T {
  const s = createEffect(component)
  return s.run()
}
