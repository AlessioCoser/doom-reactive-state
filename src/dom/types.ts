import { Accessor } from "../reactivity/types"

export type HTMLTag = HTMLElementTagNameMap
export type Component<P> = ((props: P, children?: Children) => Element)
export type HTMLComponent<P extends keyof HTMLTag> = Component<DoomProperties<P> | Children | undefined>
export type Children = Reactive<Child[] | Child>
export type Child = Element | Reactive<string>
export type Reactive<T> = T | Accessor<T>

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B
type WritableKeysOf<T> = {[P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>}[keyof T]
type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]

type WritableCSSStyleDeclaration = WritablePart<CSSStyleDeclaration>
type StylesDeclaration = Omit<WritableCSSStyleDeclaration, FunctionPropertyNames<WritableCSSStyleDeclaration>>
export type Styles = { [K in keyof StylesDeclaration as K extends keyof StylesDeclaration ? K : never]?: Reactive<StylesDeclaration[K]> }
export type Style = {key: keyof Styles, value: Styles[keyof Styles]}
type PartialWithStyles<T> = Partial<T & { style: Reactive<Styles> }>

type ElementWithoutEvents<T extends keyof HTMLTag> = Omit<HTMLTag[T], keyof GlobalEventHandlers | FunctionPropertyNames<Element> | 'innerHTML' | 'innerText' | 'outerHTML' | 'outerText'>
type ElementProperties<T extends keyof HTMLTag> = PartialWithStyles<WritablePart<ElementWithoutEvents<T>>>
type ElementEvents = Partial<Omit<GlobalEventHandlers, FunctionPropertyNames<Element>>>

export type DoomProperties<T extends keyof HTMLTag> = {
  [K in keyof ElementProperties<T> as K extends keyof HTMLTag[T] ? K : never]?: Reactive<ElementProperties<T>[K]>
} & ElementEvents

export type DoomProperty<T extends keyof HTMLTag> = {
  key: keyof HTMLTag[T],
  value: Reactive<HTMLTag[T][keyof HTMLTag[T]]>
}