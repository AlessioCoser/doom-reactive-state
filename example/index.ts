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
      console.log('accessor ctx', currentObserver?.id, currentObserver?.fn)
      if(currentObserver && toBeObserved(currentObserver)) {
        observers.push(currentObserver)
      }

      return state
    }

    const setter: Setter<T> = function setter(v: T): void {
      console.log('accessor ctx', currentObserver?.id, currentObserver?.fn, currentObserver?.deferred)
      console.log('observers', observers)
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

type Observer = {id: string, fn: () => void, deferred: (() => void)[]}
let currentObserver: Observer | null = null
const r: <T>(f: T) => T = (function r() {
  let rIndex: number = 0

  return function r<T>(f: T): T {
    rIndex += 1
    const id = `${rIndex}-${(f as Function).name}`
    const s: Observer = { id: id, fn: () => {}, deferred: [] }
    return (function(...args: any[]) {
      s.fn = () => {
        s.deferred = []
        currentObserver = s;
        (f as Function)(...args)
        const d = currentObserver.deferred
        currentObserver = null
        d.forEach(fn => fn())
      }
      s.fn()
    } as T)
  }
})()


function h(val: Accessor<string>, increase: Function){
  console.log(`rendered ${val()}`)
  increase()
}

function count({ num }: {num: Accessor<number>}) {
  console.log('=>', num())
}

function main () {
  // use state should be out of rerender loop
  const [val, setter] = useState('initial')
  const [two, setTwo] = useState(0)

  const increase = () => {
    setTwo(two() + 1)
  }

  // also functions inside objects are binded
  r(count)({num: two})

  // You can't avoid reacting on a used state change
  r(h)(val, increase)

  setter('updated')

  setTimeout(() => setTwo(two() + 1), 1000)
}

main()