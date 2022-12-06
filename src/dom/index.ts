import { effect } from "../reactivity"
import { reconcileArrays } from "./reconcileArrays"

type Children = Property<HTMLElement[]>
type Property<T> = T | (() => T)
type Properties<T extends keyof HTMLElementTagNameMap> = {
  [K in keyof HTMLElementTagNameMap[T] as K extends keyof HTMLElementTagNameMap[T] ? K : never]?: Property<HTMLElementTagNameMap[T][K]>
}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, properties: Properties<K> = {}, children: Children = []): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  foreachProperty(properties, ({prop, value}) => {
    if ((prop as String).startsWith('on')) {
      el[prop] = pass(value)
    } else {
      effect(() => el[prop] = evaluate(value))
    }
  })
  effect(() => reconcileArrays(el, Array.from(el.children), evaluate(children)))
  return el
}

type PropKeyVal<K extends keyof HTMLElementTagNameMap> = {
  prop: keyof HTMLElementTagNameMap[K],
  value: Property<HTMLElementTagNameMap[K][keyof HTMLElementTagNameMap[K]]>
}
function foreachProperty<K extends keyof HTMLElementTagNameMap>(
  properties: Properties<K>,
  callback: (x: PropKeyVal<K>) => void
) {
  Object.entries(properties).forEach(([prop, value]) => callback({
    prop: prop as keyof HTMLElementTagNameMap[K],
    value: value as Property<HTMLElementTagNameMap[K][keyof HTMLElementTagNameMap[K]]>
  }))
}

function pass<T>(prop: Property<T>): T {
  return prop as T
}

function evaluate<T>(prop: Property<T>): T {
  if(typeof prop === 'function'){
    return (prop as Function)()
  }
  return prop
}
