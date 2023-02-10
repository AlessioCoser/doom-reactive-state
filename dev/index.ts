import { h } from '../src/dom'
import { signal } from '../src/reactivity'

const Component = () => {
  const [count, setCount] = signal(5)

  const increase = () => setCount(count() + 5)
  const fontSize = () => count() < 10 ? '10px' : `${count()}px`
  const textSize = () => count() >= 10 ? `Size: ${count()}px - ` : ''
  const howBig = () => {
    const size = count()
    switch(true) {
      case (size < 10): return "CLICK ME"
      case (size < 20): return "small"
      case (size < 40): return "medium"
      case (size < 60): return "big"
      default: return "way too big!"
    }
  }

  return h("div", { style: { fontSize }, onclick: increase }, [
    textSize,
    h('strong', {}, [howBig])
  ])
}

document.body.appendChild(Component())