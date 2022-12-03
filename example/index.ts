import { effect, signal, Signal } from '../src/reactivity'
import { Button, Div, H2, P, For, root } from '../src/dom'

type MainProps = { counter: Signal<number> }
const Main = ({ counter }: MainProps) => {
  // this is a non-reactive component it's out of the renderer loop since it isn't wrapped with the `effect` function
  // here we can instantiate the state (!! never instantiate a state in an `effect` function !!)
  const [count, setCount] = counter
  const [btnText, setBtnText] = signal('initial text')
  const [isLoading, setIsLoading] = signal(false)
  const [history, setHistory] = signal<number[]>([])

  // we can use setTimeout and setInterval outside re-rendered components
  setTimeout(() => setBtnText('updated text'), 2000)
  setTimeout(() => setCount(count() + 1), 5000)

  effect(() => setHistory([count(), ...history()]))
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

  return Div({ children: () => [
    // only functions inside objects are binded
    // all computed properties must be functions
    H2({ text: () => `count ${count()}` }),
    // you can avoid the element reacting for a specific property: see text property, we pass it directly without any function
    // but since the state accessor is a function you can pass it directly and still react to it's change
    Button({ text: `button ${btnText()}`, disabled: isLoading, onclick: onButtonClick }),
    For(history, it => P({ text: `${it}` }))
  ]})
}

const App = () => {
  // you can pass the state through all the components,
  // but will be re-rendered only the components that really access it
  const counter = signal(0)
  return Main({ counter })
}

root(App)
