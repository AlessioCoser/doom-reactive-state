export type Accessor<T> = () => T
export type Setter<T> = (v: T) => void

export function useState<T>(initial: T): [Accessor<T>, Setter<T>] {
  const observers: Observer[] = []

  const toBeObserved = (observer: Observer) => {
    if (!observer.id) return false
    return !observers.some(obs => obs.id === observer.id)
  }

  return (function () {
    var state: T = initial
    const accessor: Accessor<T> = function accessor() {
      if(currentObserver && toBeObserved(currentObserver)) {
        observers.push(currentObserver)
      }
      return state
    }

    const setter: Setter<T> = function setter(newState: T): void {
      state = newState
      if (!currentObserver) {
        observers.forEach(obs => obs.component())
        return
      }

      observers
        .filter(obs => obs.id !== currentObserver?.id)
        .forEach(obs => currentObserver?.deferred?.push(obs.component))
    }

    return [accessor, setter]
  })()
}

export type Component = (...x: any) => HTMLElement

export type Observer = {id: string, component: Component, deferred: (() => void)[]}
let currentObserver: Observer | null = null
let previousObserver: Observer | null = null

export function createObserver(id: string, component: Component): Observer {
  return {
    id,
    deferred: [],
    component() {
      this.deferred = []
      previousObserver = currentObserver
      currentObserver = this;
      const result = component.bind({id})()
      const deferred = currentObserver.deferred
      currentObserver = previousObserver
      deferred.forEach(fn => fn())
      return result
    }
  }
}

export const reactive: Component = (function reactive() {
  let reactiveIndex: number = 1
  return function reactive(component: Component): HTMLElement {
    const id = reactiveIndex++
    const s = createObserver(id.toString(), component)
    return s.component()
  }
})()

export type Root = (child: Component) => void
export const root: Root = (child) => {
  document.body.appendChild(child())
}