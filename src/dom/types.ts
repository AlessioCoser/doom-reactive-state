import type { Accessor } from "../reactivity";
import { ReactiveChildren } from "./reactiveChildren";

export type HTMLTag = HTMLElementTagNameMap
export type Component<P> = (props: P, children?: Children) => Element
export type HTMLComponent<P extends keyof HTMLTag> = <T extends DoomProperties<P> | KeyedDoomProperties<P> | Children>(
    props?: T,
    children?: Children
) => T extends KeyedDoomProperties<P> ? KeyedElement : Element;
export type Children = Child[] | Child | ReactiveChildren<any>
export type Child = Element | Reactive<string>
export type Reactive<T> = T | Accessor<T>

export type KeyValue = string | number
export type KeyedElement = Element & { key: KeyValue }

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B
type WritableKeysOf<T> = {[P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>}[keyof T]
type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]

type WritableCSSStyleDeclaration = WritablePart<CSSStyleDeclaration>
type StylesDeclaration = Omit<WritableCSSStyleDeclaration, FunctionPropertyNames<WritableCSSStyleDeclaration>>
export type Styles = { [K in keyof StylesDeclaration as K extends keyof StylesDeclaration ? K : never]?: Reactive<StylesDeclaration[K]> }
type PartialWithoutStyles<T> = Partial<Omit<T, 'style'>>

type ElementWithoutEvents<T extends keyof HTMLTag> = Omit<HTMLTag[T], keyof GlobalEventHandlers | FunctionPropertyNames<Element> | 'innerHTML' | 'innerText' | 'outerHTML' | 'outerText'>
type ElementProperties<T extends keyof HTMLTag> = PartialWithoutStyles<WritablePart<ElementWithoutEvents<T>>>
type ElementEventHandlers = Omit<GlobalEventHandlers, FunctionPropertyNames<Element>>
type RemapThis<F, This> = F extends ((this: any, ...args: infer A) => infer R) | null ? ((this: This, ...args: A) => R) : F
export type ElementEvents<T extends keyof HTMLTag> = { [K in keyof ElementEventHandlers]?: RemapThis<ElementEventHandlers[K], HTMLTag[T]> }

export type DoomPropertiesNoStyleNoEvents<T extends keyof HTMLTag> = {
  [K in keyof ElementProperties<T> as K extends keyof HTMLTag[T] ? K : never]?: Reactive<ElementProperties<T>[K]>
}
export type DoomPropertiesNoStyle<T extends keyof HTMLTag> = DoomPropertiesNoStyleNoEvents<T> & ElementEvents<T>
export type DoomProperties<T extends keyof HTMLTag> = DoomPropertiesNoStyle<T> &  { style?: Styles }
export type KeyedDoomProperties<T extends keyof HTMLTag> = DoomProperties<T> & { key: KeyValue }

export type DoomProperty<T extends keyof HTMLTag> = {
  key: keyof HTMLTag[T],
  value: Reactive<HTMLTag[T][keyof HTMLTag[T]]>
}
