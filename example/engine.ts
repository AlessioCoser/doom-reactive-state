export type Accessor<T> = () => T
export type Setter<T> = (v: T) => void

export function useState<T>(initial: T): [Accessor<T>, Setter<T>] {
  const registeredEffects: Effect[] = []

  const toRegister = (effect: Effect | null) => {
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

export type Component = (...x: any) => HTMLElement

export type Effect = {run: Component}
let runningEffect: Effect | null = null
let previousObserver: Effect | null = null

export function createEffect(component: Component): Effect {
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

export function effect(component: Component): HTMLElement {
  const s = createEffect(component)
  return s.run()
}

export type Root = (child: Component) => void
export const root: Root = (child) => {
  document.body.appendChild(child())
}