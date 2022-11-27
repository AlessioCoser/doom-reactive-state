import { effect, signal } from './engine'
import { Signal } from './types'

type Root = (child: () => HTMLElement) => void
const root: Root = (child) => {
  document.body.appendChild(child())
}

type Prop<T> = T | (() => T)
type PropEvent = (ev: MouseEvent) => Promise<void> | void

type ButtonProps = { text: Prop<string>, disabled: Prop<boolean>, onclick: PropEvent }
// We must pass a NON ARROW function as argument of reactive function
const Button = (props: ButtonProps) => {
  const el = document.createElement("button") as HTMLButtonElement
  effect(function () {
    el.innerText = evaluate(props.text)
    el.disabled = evaluate(props.disabled)
    el.onclick = props.onclick
  })
  return el
}

type H2Props = { text: Prop<string> }
// We must pass a NON ARROW function as argument of reactive function
const H2 = (props: H2Props) => {
  const el = document.createElement("h2")
  effect(() => el.innerText = evaluate(props.text))
  return el
}

type DivProps = { children: HTMLElement[] }
// We must pass a NON ARROW function as argument of reactive function
const Div = (props: DivProps) => {
  const el = document.createElement("div")
  effect(function () {
    props.children.forEach(child => el.appendChild(child))
  })
  return el
}

function evaluate<T>(prop: Prop<T>): T {
  if(typeof prop === 'function'){
    return (prop as Function)()
  }
  return prop
}

type MainProps = { counter: Signal<number> }
const Main = ({ counter }: MainProps) => {
  // this is a non-reactive component it's out of therenderer loop since it isn't wrapped with the reactive function
  // here we can instantiate the state (!! never instantiate a state in a reactive component !!)
  const [btnText, setBtnText] = signal('initial text')
  const [isLoading, setIsLoading] = signal(false)
  const [count, setCount] = counter

  // we can use setTimeout and setInterval outside re-rendered components
  setTimeout(() => setBtnText('updated text'), 2000)
  setTimeout(() => setCount(count() + 1), 5000)

  effect(() => console.log('count effect', count()))
  effect(() => console.log('loading effect', isLoading()))
  effect(() => console.log('text effect', btnText()))

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
  const counter = signal(0)
  return Main({ counter })
}

root(App)
