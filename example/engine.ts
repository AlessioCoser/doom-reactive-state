export type Accessor<T> = () => T
export type Setter<T> = (v: T) => void

export function useState<T>(initial: T): [Accessor<T>, Setter<T>] {
  const registeredEffects: Effect[] = []

  const toRegister = (effect: Effect | null) => {
    if (!effect) return false
    if (!effect.id) return false
    return !registeredEffects.some(registered => registered.id === effect.id)
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

export type Effect = {id: string, run: Component}
let runningEffect: Effect | null = null
let previousObserver: Effect | null = null

export function createEffect(id: string, component: Component): Effect {
  return {
    id,
    run() {
      previousObserver = runningEffect
      runningEffect = this;
      const result = component()
      runningEffect = previousObserver
      return result
    }
  }
}

export const effect: Component = (function effect() {
  let effectId: number = 1
  return function effect(component: Component): HTMLElement {
    const id = effectId++
    const s = createEffect(id.toString(), component)
    return s.run()
  }
})()

export type Root = (child: Component) => void
export const root: Root = (child) => {
  document.body.appendChild(child())
}