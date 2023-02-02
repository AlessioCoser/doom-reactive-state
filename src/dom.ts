import { effect } from "./reactivity"

type Child = Node | string
type Reactive<T> = T | (() => T)
const pass = <T>(prop: Reactive<T>): T => prop as T
const evaluate = <T>(prop: Reactive<T>): T => typeof prop !== 'function' ? prop : (prop as Function)()
type Properties<T extends keyof HTMLElementTagNameMap> = Partial<Omit<{
  [K in keyof HTMLElementTagNameMap[T] as K extends keyof HTMLElementTagNameMap[T] ? K : never]: Reactive<HTMLElementTagNameMap[T][K]>
}, 'style'> & { style: Reactive<Styles> }>

type StylesDeclaration = Omit<CSSStyleDeclaration, 'length' | 'parentRule' | 'getPropertyPriority' | 'getPropertyValue' | 'removeProperty' | 'setProperty' | 'item' | number>
type Styles = { [K in keyof StylesDeclaration as K extends keyof StylesDeclaration ? K : never]?: Reactive<StylesDeclaration[K]> }
type StyleKey = keyof Styles
type StyleProps = Styles[keyof Styles]

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, properties: Properties<K> = {}, children: Child[] = []): HTMLElementTagNameMap[K] {
  const el: HTMLElementTagNameMap[K] = document.createElement(tag)

  Object.entries(properties).forEach((property) => {
    const key = property[0] as keyof HTMLElementTagNameMap[K]
    const value = property[1] as Reactive<HTMLElementTagNameMap[K][keyof HTMLElementTagNameMap[K]]>

    if (key === 'style') {
      effect(() => {
        const styleValue = evaluate(value as Reactive<Styles>)
        Object.entries(styleValue).forEach((styleAttribute) => {
          const attributeKey = styleAttribute[0] as StyleKey
          const attributeValue = styleAttribute[1] as StyleProps

          if(attributeValue) {
            el.style[attributeKey] = evaluate(attributeValue)
          }
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

  children.forEach((child) => appendChild(el, child))

  return el
}

function appendChild(el: HTMLElement, child: Child) {
  if (typeof child === 'string') {
    el.appendChild(document.createTextNode(child))
  } else {
    el.appendChild(child)
  }
}