import { DoomProperties, DoomComponent, DoomElement } from ".";

type WithChildren<P> = Omit<P, 'children'> & { children?: DoomElement[] }

export namespace JSX {
  export type Element = DoomElement
  export type Component<P> = DoomComponent<WithChildren<P>>
  export type IntrinsicElements = {
    [K in keyof HTMLElementTagNameMap]?: DoomProperties<K>
  }
}
