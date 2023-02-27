import { DoomProperties, DoomComponent } from ".";

type WithChildren<P> = Omit<P, 'children'> & { children?: Element[] }

type _Element = Element
export namespace JSX {
  export type Element = _Element
  export type Component<P> = DoomComponent<WithChildren<P>>
  export type IntrinsicElements = {
    [K in keyof HTMLElementTagNameMap]?: DoomProperties<K>
  }
}
