import { effect } from "./reactivity"
import { updateChildren } from './updateChildren'

const pass = <T>(prop: Reactive<T>): T => prop as T
const evaluate = <T>(prop: Reactive<T>): T => typeof prop !== 'function' ? prop : (prop as Function)()

type Child = Element | string
type Reactive<T> = T | (() => T)

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B
type WritableKeysOf<T> = {[P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>}[keyof T]
type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

type NonFunctionPartNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
type NonFunctionPart<T> = Pick<T, NonFunctionPartNames<T>>;

type StylesDeclaration = NonFunctionPart<WritablePart<CSSStyleDeclaration>>
type Styles = { [K in keyof StylesDeclaration as K extends keyof StylesDeclaration ? K : never]?: Reactive<StylesDeclaration[K]> }
type Style = {key: keyof Styles, value: Styles[keyof Styles]}
type PartialWithStyles<T> = Partial<T & { style: Reactive<Styles> }>

type ElementProperties<T extends keyof HTMLElementTagNameMap> = PartialWithStyles<WritablePart<HTMLElementTagNameMap[T]>>

type Properties<T extends keyof HTMLElementTagNameMap> = {
  [K in keyof ElementProperties<T> as K extends keyof HTMLElementTagNameMap[T] ? K : never]?: Reactive<ElementProperties<T>[K]>
}
type Property<T extends keyof HTMLElementTagNameMap> = {
  key: keyof HTMLElementTagNameMap[T],
  value: Reactive<HTMLElementTagNameMap[T][keyof HTMLElementTagNameMap[T]]>
}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, properties: Properties<K> = {}, children: Reactive<Child[]> = []): HTMLElementTagNameMap[K] {
  const el: HTMLElementTagNameMap[K] = document.createElement(tag)

  toProperties(properties).forEach(({key, value}) => {
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

function evaluateChildNodes(children: Reactive<Child[]>): ChildNode[] {
  return evaluate(children).map(toChildNode)
}

function toChildNode(child: Child): ChildNode {
  return (typeof child === 'string') ?
      document.createTextNode(child)
      : child
}
