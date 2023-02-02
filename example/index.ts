import { h } from '../src/dom'
import { signal } from '../src/reactivity'

const Component = () => {
  const [count, setCount] = signal(10)

  const increase = () => setCount(count() + 5)
  const howBig = () => (count() < 20) ? "small" : (count() < 40) ? "medium" : (count() < 60) ? "big" : "way too big!"

  return h("div", { onclick: increase }, () => [
    `Size: ${count()}px`,
    h('strong', {}, [` - ${howBig()}`])
  ])
}

document.body.appendChild(Component())