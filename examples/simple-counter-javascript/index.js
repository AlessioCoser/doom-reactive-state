import { signal, h, Div, H2, Button, derive } from 'doom-reactive-state'

const App = () => {
  // this is a non-reactive component it's out of the renderer loop since it isn't wrapped with the `effect` function
  // here we can instantiate the state
  const [count, setCount] = signal(0)

  const increment = () => setCount(count() + 1)

  const countText = derive('', () => `${count()}`)

  // only the changed attributes of the component will be updated
  return Div({ children: [
    // only functions inside objects listen to the state changes
    H2({ className: 'a-class', children: [
      'Count: ',
      // all properties or text-children we want to react to changes must be functions
      h('span', { children: [countText] })
    ]}),
    // you can avoid the element reacting for a specific property: see children property, we pass it directly without any function
    Button({ onclick: increment, children: ['increment'] }),
  ]})
}

// no need to use magic stuff to attach components to the dom,
// we always return a DOM Element from our components
document.body.appendChild(App())
