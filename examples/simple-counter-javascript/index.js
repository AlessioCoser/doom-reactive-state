import { signal, h } from 'doom-reactive-state'

const App = () => {
  // this is a non-reactive component it's out of the renderer loop since it isn't wrapped with the `effect` function
  // here we can instantiate the state
  const [count, setCount] = signal(0)

  const increment = () => {
    setCount(count() + 1)
  }

  // only the changed attributes of the component will be updated
  return h("div", [
    // only functions inside objects listen to the state changes
    h("h2", { innerText: 'Count: ' }, [
      // all properties we want to react to changes must be functions
      h('span', { innerText: () => `${count()}` })
    ]),
    // you can avoid the element reacting for a specific property: see innerText property, we pass it directly without any function
    // but since the state accessor is a function you can pass it directly and still react to it's change
    h("button", { innerText: 'increment', onclick: increment }),
  ])
}

// no need to use magic stuff to attach components to the dom,
// we always return a DOM Element from our components
document.body.appendChild(App())
