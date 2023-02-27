import { Properties, Component as _Component } from ".";

type NativeElement = Element
export namespace JSX {
  export type Element = NativeElement
  export type Component<P> = _Component<P>
  export type IntrinsicElements = {
    [K in keyof HTMLElementTagNameMap]?: Properties<K>
  }
}
