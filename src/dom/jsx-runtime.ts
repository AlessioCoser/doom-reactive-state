import { h } from ".";
export type { JSX } from "./jsx";
import type { JSX } from "./jsx";

function Fragment(props: { children: JSX.Element }) {
  return props.children;
}

export { h as jsx, h as jsxs, h as jsxDEV, Fragment };