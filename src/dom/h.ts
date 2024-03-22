import { effect } from "../reactivity"
import { Child, Children, Component, DoomProperties, DoomProperty, Reactive, Style, Styles } from "./types"
import { updateChildren } from './updateChildren'

export function h<P>(component: Component<P>, props?: P): Element
export function h<K extends keyof HTMLElementTagNameMap>(component: K, props?: DoomProperties<K>): Element
export function h<P, K extends keyof HTMLElementTagNameMap>(component: unknown, props: unknown = {}): Element {
  if (typeof component === 'function') {
    return (component as Component<P>)(props as P)
  }

  const el: HTMLElementTagNameMap[K] = document.createElement(component as K)
  const { children, ...properties} = props as DoomProperties<K>

  toProperties(properties as DoomProperties<K>).forEach(({key, value}) => {
    if (key === 'style') {
      effect(() => {
        const styles = evaluate(value as Reactive<Styles>)
        toStyles(styles).forEach((style) => {
          el.style[style.key] = evaluate(style.value) || ''
        })
      })
      return
    }

    if ((key as String).startsWith('on')) {
      el[key] = pass(value)
      return
    }

    effect(() => { el[key] = evaluate(value) })
  })

  addChildren(el, children)

  return el
}

function t(text: Reactive<string>): Text {
  if (typeof text === 'string') {
    return document.createTextNode(text)
  }
  const textNode = document.createTextNode("")
  effect(() => textNode.textContent = evaluate(text))
  return textNode
}

function addChildren<K extends keyof HTMLElementTagNameMap>(el: HTMLElementTagNameMap[K], children: Children | undefined) {
  if(typeof children === 'function') {
    effect(() => updateChildren(el, evaluateChildNodes(children)))
  } else if (Array.isArray(children)) {
    children.map(toChildNode).map(appendTo(el))
  } else if (children) {
    [children].map(toChildNode).map(appendTo(el))
  }
}

function appendTo<K extends keyof HTMLElementTagNameMap>(element: HTMLElementTagNameMap[K]): ((c: ChildNode) => ChildNode) {
  return (child: ChildNode) => {
    element.appendChild(child)
    return child
  }
}

function toProperties<K extends keyof HTMLElementTagNameMap>(properties: DoomProperties<K>): DoomProperty<K>[] {
  return Object
    .entries(properties)
    .map((property) => {
      return { key: property[0], value: property[1] } as DoomProperty<K>
    })
}

function toStyles(styleValue: Styles): Style[] {
  return Object.entries(styleValue).map((styleAttribute) => {
    return {
      key: styleAttribute[0] as Style['key'],
      value: styleAttribute[1] as Style['value']
    }
  })
}

function evaluateChildNodes(children: Reactive<Child[] | Child>): ChildNode[] {
  const reactive = evaluate(children)
  return Array.isArray(reactive) ? reactive.map(toChildNode) : [toChildNode(reactive)]
}

function toChildNode(child: Child): ChildNode {
  return (typeof child === 'object')
      ? child
      : t(child)
}

const pass = <T>(prop: Reactive<T>): T => prop as T
const evaluate = <T>(prop: Reactive<T>): T => typeof prop !== 'function' ? prop : (prop as Function)()
