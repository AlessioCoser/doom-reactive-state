import { h } from '../src/dom'
import { signal } from '../src/reactivity'

const Component = () => {
  const [count, setCount] = signal(5)

  const increase = () => setCount(count() + 5)
  const fontSize = () => count() < 10 ? '10px' : `${count()}px`
  const text = (count: number) => count >= 10 ? `Size: ${count}px - ` : ''
  const howBig = (count: number) => (count < 10) ? "CLICK ME" : (count < 20) ? "small" : (count < 40) ? "medium" : (count < 60) ? "big" : "way too big!"

  return h("div", { style: { fontSize }, onclick: increase }, [
    () => text(count()),
    h('strong', {}, [() => howBig(count())])
  ])
}

document.body.appendChild(Component())