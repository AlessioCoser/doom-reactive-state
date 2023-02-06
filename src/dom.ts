import { effect } from "./reactivity"
import { updateChildren } from './updateChildren'

type Child = Element | string
type Reactive<T> = T | (() => T)
const pass = <T>(prop: Reactive<T>): T => prop as T
const evaluate = <T>(prop: Reactive<T>): T => typeof prop !== 'function' ? prop : (prop as Function)()
type Properties<T extends keyof HTMLElementTagNameMap> = Partial<Omit<{
  [K in keyof HTMLElementTagNameMap[T] as K extends keyof HTMLElementTagNameMap[T] ? K : never]: Reactive<HTMLElementTagNameMap[T][K]>
}, 'style'> & { style: Reactive<Styles> }>

type StylesDeclaration = Omit<CSSStyleDeclaration, typeof Symbol.iterator | number | 'length' | 'parentRule' | 'getPropertyPriority' | 'getPropertyValue' | 'removeProperty' | 'setProperty' | 'item'>
type Styles = { [K in keyof StylesDeclaration as K extends keyof StylesDeclaration ? K : never]?: Reactive<StylesDeclaration[K]> }
type Style = {key: keyof Styles, value: Styles[keyof Styles]}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, properties: Properties<K> = {}, children: Reactive<Child[]> = []): HTMLElementTagNameMap[K] {
  const el: HTMLElementTagNameMap[K] = document.createElement(tag)

  Object.entries(properties).forEach((property) => {
    const key = property[0] as keyof HTMLElementTagNameMap[K]
    const value = property[1] as Reactive<HTMLElementTagNameMap[K][keyof HTMLElementTagNameMap[K]]>

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

  effect(() =>  updateChildren(el, evaluateChildNodes(children)))

  return el
}

function toStyles(styleValue: Styles): Style[] {
  return Object.entries(styleValue).map((styleAttribute) => {
    return {
      key: styleAttribute[0] as Style['key'],
      value: styleAttribute[1] as Style['value']
    }
  })
}

function evaluateChildNodes(children: Reactive<Child[]>): ChildNode[] {
  return evaluate(children).map(toChildNode)
}

function toChildNode(child: Child): ChildNode {
  return (typeof child === 'string') ?
      document.createTextNode(child)
      : child
}