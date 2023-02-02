import { h } from '../src/dom'
import { signal } from '../src/reactivity'

const Component = () => {
  const [count, setCount] = signal(10)

  const size = () => `Size: ${count()}px`
  return h("div", { style: { fontSize: () => `${count()}px` }, onclick: () => setCount(count() + 5) }, [size])
}

document.body.appendChild(Component())