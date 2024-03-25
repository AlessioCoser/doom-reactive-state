const { signal, derive, Div, H2, h, Button, Span, d } = require("doom-reactive-state")

const App = () => {
  // this is a non-reactive component it's out of the renderer loop since it isn't wrapped with the `effect` function
  // here we can instantiate the state
  const [count, setCount] = signal(0)

  const increment = () => setCount(count() + 1)
  const countText = d`${count}`

  // only the changed attributes of the component will be updated
  return Div([
    // only functions inside objects listen to the state changes
    H2({ className: 'a-class' }, [
      'Count: ',
      // all properties or text-children we want to react to changes must be functions
      Span(countText)
    ]),
    // you can avoid the element reacting for a specific property: see children property, we pass it directly without any function
    Button({ onclick: increment }, 'increment'),
  ])
}

// no need to use magic stuff to attach components to the dom,
// we always return a DOM Element from our components
document.body.appendChild(App())
