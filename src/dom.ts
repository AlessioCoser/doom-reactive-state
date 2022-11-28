import { effect } from "./engine"

type Prop<T> = T | (() => T)
type PropEvent = (ev: MouseEvent) => Promise<void> | void

type Root = (child: () => HTMLElement, rootElement?: HTMLElement) => void
export const root: Root = (child, rootElement = document.body) => {
  rootElement.appendChild(child())
}

type ButtonProps = { text: Prop<string>, disabled: Prop<boolean>, onclick: PropEvent }
export const Button = (props: ButtonProps) => {
  const el = document.createElement("button") as HTMLButtonElement
  el.onclick = props.onclick
  effect(() => el.innerText = evaluate(props.text))
  effect(() => el.disabled = evaluate(props.disabled))
  return el
}

type H2Props = { text: Prop<string> }
export const H2 = (props: H2Props) => {
  const el = document.createElement("h2")
  effect(() => el.innerText = evaluate(props.text))
  return el
}

type DivProps = { children: HTMLElement[] }
export const Div = (props: DivProps) => {
  const el = document.createElement("div")
  effect(() => props.children.forEach(child => el.appendChild(child)))
  return el
}

function evaluate<T>(prop: Prop<T>): T {
  if(typeof prop === 'function'){
    return (prop as Function)()
  }
  return prop
}