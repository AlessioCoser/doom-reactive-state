import { DoomProperties, DoomComponent, DoomElement } from ".";

export namespace JSX {
  export type Element = DoomElement
  export type Component<P> = DoomComponent<P>
  export type IntrinsicElements = {
    [K in keyof HTMLElementTagNameMap]?: DoomProperties<K>
  }
}
