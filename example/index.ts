type Accessor<T> = () => T
type Setter<T> = (v: T) => void
function useState<T>(initial: T): [Accessor<T>, Setter<T>] {
  const observers: Observer[] = []

  const toBeObserved = ({ id }: Observer) => {
    if (!id) return false
    return !observers.some(obs => obs.id === id)
  }

  return (function () {
    var state: T = initial
    const accessor: Accessor<T> = function accessor() {
      // console.log('accessor ctx', currentObserver?.id)
      if(currentObserver && toBeObserved(currentObserver)) {
        observers.push(currentObserver)
      }

      return state
    }

    const setter: Setter<T> = function setter(v: T): void {
      // console.log('accessor ctx', currentObserver?.id, currentObserver?.deferred)
      state = v
      observers.forEach(({id, fn}) => {
        if(!currentObserver) {
          fn()
        } else if (currentObserver?.id !== id) {
          if(currentObserver?.deferred) {
            currentObserver?.deferred.push(fn)
          }
        }
      })
    }

    return [accessor, setter]
  })()
}

type FC = (...x: any) => HTMLElement

type Observer = {id: string, fn: FC, deferred: (() => void)[]}
let currentObserver: Observer | null = null
let previousObserver: Observer | null = null

const r: FC = (function r() {
  let rIndex: number = 0

  return function r(component: FC): HTMLElement {
    rIndex += 1
    const id = `${rIndex}-${component.name}`
    const s: Observer = {
      id,
      fn() {
        this.deferred = []
        previousObserver = currentObserver
        currentObserver = this;
        const result = component.bind({id})()
        const deferred = currentObserver.deferred
        currentObserver = previousObserver
        deferred.forEach(fn => fn())
        return result
      },
      deferred: []
    }
    return s.fn()
  }
})()

type Prop<T> = () => T | T
type HtmlAction = (ev: MouseEvent) => Promise<void> | void

type HOptions = { text: Prop<string>, onclick: HtmlAction }
const h: FC = ({text, onclick}): HTMLElement => {
  return r(function h () {
    const el = getOrCreate(this.id, "button") as HTMLButtonElement
    el.innerText = evaluate(text)
    el.onclick = async (e) => {
      el.innerText = 'loading'
      el.disabled=true
      await onclick(e)
      el.innerText = evaluate(text)
      el.disabled=false
    }
    return el
  })
}

type CountOptions = { text: Prop<string> }
function count({ text }: CountOptions) : HTMLElement{
  return r(function count() {
    const el = getOrCreate(this.id, "h2")
    el.innerText = evaluate(text)
    return el
  })
}

type DivOptions = { children: HTMLElement[] }
function div({children}: DivOptions): HTMLElement {
  return r(function div() {
    const el = getOrCreate(this.id, "div")
    children.forEach(child => el.appendChild(child))
    return el
  })
}

function root(child: () => HTMLElement) {
  document.body.appendChild(child())
}

function evaluate<T>(prop: Prop<T>): T {
  if(typeof prop === 'function'){
    return prop()
  }
  return prop
}

function createElement(id:string, tag:string): HTMLElement {
  const element = document.createElement(tag)
  element.setAttribute('_id', id)
  return element
}

function getOrCreate(id:string, tag:string): HTMLElement {
  return document.querySelector(`[_id="${id}"]`) || createElement(id, tag)
}

function main () {
  // use state must be out of rerender loop
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
      }, 5000)
    })
  }

  setTimeout(() => setter('updated'), 2000)

  setTimeout(increase, 5000)

  return div({children:[
    // only functions inside objects are binded
    // all computed properties must be functions
    count({text: () => `count ${two()}`}),
    // to avoid reacting you should not wrap text value in lambda you should handle it in h
    h({text: `render ${val()}`, onclick: asyncIncrease})
  ]})
}

root(main)
