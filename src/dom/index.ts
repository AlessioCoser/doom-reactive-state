import { effect } from "../reactivity"
import { reconcileArrays } from "./reconcileArrays"

export function h<K extends keyof HTMLElementTagNameMap>(tag: K): HTMLElementTagNameMap[K];
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, children?: Children): HTMLElementTagNameMap[K];
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, properties?: Properties<K>): HTMLElementTagNameMap[K];
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, properties?: Properties<K>, children?: Children): HTMLElementTagNameMap[K];
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, a?: unknown, b?: unknown): HTMLElementTagNameMap[K] {
  const properties = (isProps(a) ? a : isProps(b) ? b : {}) as Properties<K>
  const children = (isChildren(a) ? a : isChildren(b) ? b : []) as Children
  const el = document.createElement(tag)
  foreachProperty(properties, ({prop, value}) => {
    // TODO: find a better way to recognize event callbacks
    if ((prop as String).startsWith('on')) {
      el[prop] = pass(value)
    } else {
      effect(() => el[prop] = evaluate(value))
    }
  })
  effect(() => reconcileArrays(el, Array.from(el.children), evaluate(children)))
  return el
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

const isProps = (value: unknown): boolean => !!value && typeof value === 'object' && !Array.isArray(value) && typeof value !== 'function'
const isChildren = (value: unknown): boolean => !!value && (Array.isArray(value) || typeof value === 'function')
const pass = <T>(prop: Property<T>): T => prop as T
const evaluate = <T>(prop: Property<T>): T => typeof prop !== 'function' ? prop : (prop as Function)()

type Children = Property<HTMLElement[]>
type Property<T> = T | (() => T)
type Properties<T extends keyof HTMLElementTagNameMap> = {
  [K in keyof HTMLElementTagNameMap[T] as K extends keyof HTMLElementTagNameMap[T] ? K : never]?: Property<HTMLElementTagNameMap[T][K]>
}
type PropKeyVal<K extends keyof HTMLElementTagNameMap> = {prop: keyof HTMLElementTagNameMap[K], value: Property<HTMLElementTagNameMap[K][keyof HTMLElementTagNameMap[K]]>}
