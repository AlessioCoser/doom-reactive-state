import { Component, reactive, root, useState } from './engine'

type Prop<T> = () => T | T
type PropEvent = (ev: MouseEvent) => Promise<void> | void

type ButtonProps = { text: Prop<string>, disabled: Prop<boolean>, onclick: PropEvent }
// We must pass a NON ARROW function as argument of reactive function
const Button: Component = (props: ButtonProps) => reactive(function () {
  const el = getOrCreate(this.id, "button") as HTMLButtonElement
  el.innerText = evaluate(props.text)
  el.disabled=evaluate(props.disabled)
  el.onclick = props.onclick
  return el
})

type H2Props = { text: Prop<string> }
// We must pass a NON ARROW function as argument of reactive function
const H2: Component = (props: H2Props) => reactive(function () {
  const el = getOrCreate(this.id, "h2")
  el.innerText = evaluate(props.text)
  return el
})

type DivProps = { children: HTMLElement[] }
// We must pass a NON ARROW function as argument of reactive function
const Div: Component = (props: DivProps) => reactive(function () {
  const el = getOrCreate(this.id, "div")
  props.children.forEach(child => el.appendChild(child))
  return el
})

function evaluate<T>(prop: Prop<T>): T {
  if(typeof prop === 'function'){
    return prop()
  }
  return prop
}

function createElement(id: string, tag: string): HTMLElement {
  const element = document.createElement(tag)
  element.setAttribute('_id', id)
  return element
}

function getOrCreate(id: string, tag: string): HTMLElement {
  return document.querySelector(`[_id="${id}"]`) || createElement(id, tag)
}

const Main: Component = ({counter}) => {
  // this is a non-reactive component it's out of therenderer loop since it isn't wrapped with the reactive function
  // here we can instantiate the state (!! never instantiate a state in a reactive component !!)
  const [btnText, setBtnText] = useState('initial text')
  const [isLoading, setIsLoading] = useState(false)
  const [count, setCount] = counter

  // we can use setTimeout and setInterval outside re-rendered components
  setTimeout(() => setBtnText('updated text'), 2000)
  setTimeout(() => setCount(count() + 1), 5000)

  const asyncOperation = async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(null), 1000)
    })
  }

  const onButtonClick = async () => {
    setIsLoading(true)
    await asyncOperation()
    setCount(count() + 1)
    setIsLoading(false)
  }

  return Div({ children: [
    // only functions inside objects are binded
    // all computed properties must be functions
    H2({ text: () => `count ${count()}` }),
    // you can avoid the element reacting for a specific property: see text property, we pass it directly without any function
    // but since the state accessor is a function you can pass it directly and still react to it's change
    Button({ text: `button ${btnText()}`, disabled: isLoading, onclick: onButtonClick })
  ]})
}

const App = () => {
  // you can pass the state through all the components,
  // but will be re-rendered only the components that really access it
  const counter = useState(0)
  return Main({ counter })
}

root(App)
