type DOMElement = Element;

export namespace JSX {
  type Element = Node
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}