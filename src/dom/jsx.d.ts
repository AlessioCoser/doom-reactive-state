import { Properties, Component as _Component } from ".";

type DOMElement = Element;
type NativeElement = Element

export namespace JSX {
  type Element = NativeElement
  type Component<P> = _Component<P>
  type IntrinsicElements = {
    [K in keyof HTMLElementTagNameMap]?: Properties<K>
  }
}