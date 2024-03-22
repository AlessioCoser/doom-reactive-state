export type DoomComponent<P = {}> = (props: P) => Element
export type Children = Reactive<Child[] | Child>
export type Child = Element | Reactive<string>
export type Reactive<T> = T | (() => T)

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B
type WritableKeysOf<T> = {[P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>}[keyof T]
type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]

type WritableCSSStyleDeclaration = WritablePart<CSSStyleDeclaration>
type StylesDeclaration = Omit<WritableCSSStyleDeclaration, FunctionPropertyNames<WritableCSSStyleDeclaration>>
export type Styles = { [K in keyof StylesDeclaration as K extends keyof StylesDeclaration ? K : never]?: Reactive<StylesDeclaration[K]> }
export type Style = {key: keyof Styles, value: Styles[keyof Styles]}
type PartialWithStyles<T> = Partial<T & { style: Reactive<Styles> }>

type ElementWithoutEvents<T extends keyof HTMLElementTagNameMap> = Omit<HTMLElementTagNameMap[T], keyof GlobalEventHandlers | FunctionPropertyNames<Element> | 'innerHTML' | 'innerText' | 'outerHTML' | 'outerText'>
type ElementProperties<T extends keyof HTMLElementTagNameMap> = PartialWithStyles<WritablePart<ElementWithoutEvents<T>>>
type ElementEvents = Partial<Omit<GlobalEventHandlers, FunctionPropertyNames<Element>>>

export type DoomProperties<T extends keyof HTMLElementTagNameMap> = {
  [K in keyof ElementProperties<T> as K extends keyof HTMLElementTagNameMap[T] ? K : never]?: Reactive<ElementProperties<T>[K]>
} & ElementEvents & { children?: Children }

export type DoomProperty<T extends keyof HTMLElementTagNameMap> = {
  key: keyof HTMLElementTagNameMap[T],
  value: Reactive<HTMLElementTagNameMap[T][keyof HTMLElementTagNameMap[T]]>
}