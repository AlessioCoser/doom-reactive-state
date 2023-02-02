import { h } from '../src/dom'
import { signal } from '../src/reactivity'

const Component = () => {
  const [count, setCount] = signal(10)

  return h("div", { style: { fontSize: () => `${count()}px` }, onclick: () => setCount(count() + 5) }, ["Click me"])
}

document.body.appendChild(Component())