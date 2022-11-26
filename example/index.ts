import { Component, reactive, root, useState } from './engine'

type Prop<T> = () => T | T
type PropEvent = (ev: MouseEvent) => Promise<void> | void

type ButtonProps = { text: Prop<string>, onclick: PropEvent }
// We must pass a NON ARROW function as argument of reactive function
const Button: Component = (props: ButtonProps) => reactive(function () {
  const el = getOrCreate(this.id, "button") as HTMLButtonElement
  el.innerText = evaluate(props.text)
  el.onclick = async (e) => {
    el.innerText = 'loading'
    el.disabled=true
    await props.onclick(e)
    el.innerText = evaluate(props.text)
    el.disabled=false
  }
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

const main: Component = () => {
  // this is a non-reactive component it's out of therenderer loop since it isn't wrapped with the reactive function
  // here we can instantiate the state (!! never instantiate a state in a reactive component !!)
  const [val, setter] = useState('initial')
  const [two, setTwo] = useState(0)

  const increase = () => {
    setTwo(two() + 1)
  }

  const asyncIncrease = async () => {
    return new Promise((resolve) => {
      setTimeout(()=>{
        increase()
        resolve(null)
      }, 1000)
    })
  }

  setTimeout(() => setter('updated'), 2000)
  setTimeout(increase, 5000)

  return Div({ children: [
    // only functions inside objects are binded
    // all computed properties must be functions
    H2({ text: () => `count ${two()}` }),
    // to avoid reacting you should not wrap text value in lambda you should handle it in h
    Button({ text: `render ${val()}`, onclick: asyncIncrease })
  ]})
}

root(main)
