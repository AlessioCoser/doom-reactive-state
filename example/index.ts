type Accessor<T> = () => T
type Setter<T> = (v: T) => void

function useState<T>(initial: T): [Accessor<T>, Setter<T>] {
  const observers: Observer[] = []

  const toBeObserved = (observer: Observer | null) => {
    if (!observer || !observer.id) return false
    return !observers.some(obs => obs.id === observer.id)
  }

  return (function () {
    var state: T = initial
    const accessor: Accessor<T> = function accessor() {
      if(toBeObserved(currentObserver)) {
        observers.push(currentObserver)
      }
      return state
    }

    const setter: Setter<T> = function setter(newState: T): void {
      state = newState
      if (!currentObserver) {
        observers.forEach(obs => obs.component())
        return
      }

      observers
        .filter(obs => obs.id !== currentObserver.id)
        .forEach(obs => currentObserver.deferred.push(obs.component))
    }

    return [accessor, setter]
  })()
}

type Component = (...x: any) => HTMLElement

type Observer = {id: string, component: Component, deferred: (() => void)[]}
let currentObserver: Observer | null = null
let previousObserver: Observer | null = null

function createObserver(id: string, component: Component): Observer {
  return {
    id,
    deferred: [],
    component() {
      this.deferred = []
      previousObserver = currentObserver
      currentObserver = this;
      const result = component.bind({id})()
      const deferred = currentObserver.deferred
      currentObserver = previousObserver
      deferred.forEach(fn => fn())
      return result
    }
  }
}

// Here we must pass a NON ARROW function as argument of reactive
const reactive: Component = (function reactive() {
  let reactiveIndex: number = 1
  return function reactive(component: Component): HTMLElement {
    const id = reactiveIndex++
    const s = createObserver(id.toString(), component)
    return s.component()
  }
})()

type Prop<T> = () => T | T
type PropEvent = (ev: MouseEvent) => Promise<void> | void

type ButtonProps = { text: Prop<string>, onclick: PropEvent }
const Button: Component = (props: ButtonProps) => reactive(function () {
  const el = getOrCreate(this.id, "button") as HTMLButtonElement
  el.innerText = evaluate(props.text)
  el.onclick = async (e) => {
    el.innerText = 'loading'
    el.disabled=true
    await props.onclick(e)
    el.innerText = evaluate(props.text)
    el.disabled=false
  }
  return el
})

type H2Props = { text: Prop<string> }
const H2: Component = (props: H2Props) => reactive(function () {
  const el = getOrCreate(this.id, "h2")
  el.innerText = evaluate(props.text)
  return el
})

type DivProps = { children: HTMLElement[] }
const Div: Component = (props: DivProps) => reactive(function () {
  const el = getOrCreate(this.id, "div")
  props.children.forEach(child => el.appendChild(child))
  return el
})

type Root = (child: Component) => void
const root: Root = (child) => {
  document.body.appendChild(child())
}

function evaluate<T>(prop: Prop<T>): T {
  if(typeof prop === 'function'){
    return prop()
  }
  return prop
}

function createElement(id: string, tag: string): HTMLElement {
  const element = document.createElement(tag)
  element.setAttribute('_id', id)
  return element
}

function getOrCreate(id: string, tag: string): HTMLElement {
  return document.querySelector(`[_id="${id}"]`) || createElement(id, tag)
}

const main: Component = () => {
  // this is a non-reactive component it's out of therenderer loop since it isn't wrapped with the reactive function
  // here we can instantiate the state (!! never instantiate a state in a reactive component !!)
  const [val, setter] = useState('initial')
  const [two, setTwo] = useState(0)

  const increase = () => {
    setTwo(two() + 1)
  }

  const asyncIncrease = async () => {
    return new Promise((resolve) => {
      setTimeout(()=>{
        increase()
        resolve(null)
      }, 1000)
    })
  }

  setTimeout(() => setter('updated'), 2000)
  setTimeout(increase, 5000)

  return Div({ children: [
    // only functions inside objects are binded
    // all computed properties must be functions
    H2({ text: () => `count ${two()}` }),
    // to avoid reacting you should not wrap text value in lambda you should handle it in h
    Button({ text: `render ${val()}`, onclick: asyncIncrease })
  ]})
}

root(main)
