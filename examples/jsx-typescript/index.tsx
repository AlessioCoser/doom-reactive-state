import { effect, signal } from '../../src/reactivity'

const App = () => {
  const [count, setCount] = signal(0)
  const [isLoading, setIsLoading] = signal(false)
  const [btnText, setBtnText] = signal('initial text')
  effect(() => console.log('Count changed to:', count()))

  const onButtonClick = async () => {
    return new Promise((resolve) => {
      setIsLoading(true)
      setTimeout(() => {
        setBtnText('New Text')
        setCount(count() + 1)
        setIsLoading(false)
        resolve(null)
      }, 2000)
    })
  }

  const fontSize = () => `${count()}em`

  return <div>
    <h2>count {count}</h2>
    <button style={{ fontSize }} disabled={isLoading} onclick={onButtonClick}>button {btnText()}</button>
  </div>
}

// no need to use magic stuff to attach components to the dom,
// we always return a DOM Element from our components
document.body.appendChild(App())

