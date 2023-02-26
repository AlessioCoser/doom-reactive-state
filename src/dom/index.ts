import { effect } from "../reactivity"
import { updateChildren } from './updateChildren'

export function h<P>(component: Component<P>, props?: P): Element
export function h<K extends keyof HTMLElementTagNameMap>(component: K, props?: Properties<K>): Element
export function h<P, K extends keyof HTMLElementTagNameMap>(component: unknown, props: unknown = {}): Element {
  if (typeof component === 'function') {
    return (component as Component<P>)(props as P)
  }

  const el: HTMLElementTagNameMap[K] = document.createElement(component as K)
  const { children, ...properties} = props as Properties<K>

  toProperties(properties as Properties<K>).forEach(({key, value}) => {
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

function toProperties<K extends keyof HTMLElementTagNameMap>(properties: Properties<K>): Property<K>[] {
  return Object
    .entries(properties)
    .map((property) => {
      return { key: property[0], value: property[1] } as Property<K>
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

export type Component<P = {}> = (props: P) => Element
type Children = Reactive<Child[] | Child>
type Child = Element | Reactive<string>
type Reactive<T> = T | (() => T)

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B
type WritableKeysOf<T> = {[P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>}[keyof T]
type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]

type WritableCSSStyleDeclaration = WritablePart<CSSStyleDeclaration>
type StylesDeclaration = Omit<WritableCSSStyleDeclaration, FunctionPropertyNames<WritableCSSStyleDeclaration>>
type Styles = { [K in keyof StylesDeclaration as K extends keyof StylesDeclaration ? K : never]?: Reactive<StylesDeclaration[K]> }
type Style = {key: keyof Styles, value: Styles[keyof Styles]}
type PartialWithStyles<T> = Partial<T & { style: Reactive<Styles> }>

type ElementWithoutEvents<T extends keyof HTMLElementTagNameMap> = Omit<HTMLElementTagNameMap[T], keyof GlobalEventHandlers | FunctionPropertyNames<Element> | 'innerHTML' | 'innerText' | 'outerHTML' | 'outerText'>
type ElementProperties<T extends keyof HTMLElementTagNameMap> = PartialWithStyles<WritablePart<ElementWithoutEvents<T>>>
type ElementEvents = Partial<Omit<GlobalEventHandlers, FunctionPropertyNames<Element>>>

export type Properties<T extends keyof HTMLElementTagNameMap> = {
  [K in keyof ElementProperties<T> as K extends keyof HTMLElementTagNameMap[T] ? K : never]?: Reactive<ElementProperties<T>[K]>
} & ElementEvents & { children?: Children }

type Property<T extends keyof HTMLElementTagNameMap> = {
  key: keyof HTMLElementTagNameMap[T],
  value: Reactive<HTMLElementTagNameMap[T][keyof HTMLElementTagNameMap[T]]>
}
