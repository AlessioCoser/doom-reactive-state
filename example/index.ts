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
      // console.log('accessor ctx', this)
      if(toBeObserved(this)) {
        observers.push(this)
      }
      return state
    }

    const setter: Setter<T> = function setter(v: T): void {
      // console.log('setter ctx', this)
      state = v
      observers.forEach(({id, fn}) => {
        if (this.id !== id) {
          fn()
        }
      })
    }

    return [accessor, setter]
  })()
}

function bindSingle(s: Observer, a: any){
  if(typeof a === 'function') {
    return a.bind(s)
  }
  if (typeof a === 'object') {
    Object.getOwnPropertyNames(a).forEach(key => a[key] = bindSingle(s, a[key]))
  }
  return a
}

function bind(s: Observer, ...args: any[]){
  return args.map(a => bindSingle(s, a))
}

type Observer = {id: number, fn: () => void}
let rIndex: number = 0
function r(f: (...args: any[]) => void, ...args: any[]): void {
  rIndex += 1
  const s: Observer = { id: rIndex, fn: () => {} }
  const binded = bind(s, ...args)
  const fb = f.bind(s)
  s.fn = () => fb(...binded)
  s.fn()
}

function h(val: Accessor<string>, two: Accessor<number>, setTwo: Setter<number>){
  console.log(`rendered ${val()}`)
  setTwo(two() + 1 )
}

function count({ num }: {num: Accessor<number>}) {
  console.log('=>', num())
}

function main () {
  // use state should be out of rerender loop
  const [val, setter] = useState('initial')
  const [two, setTwo] = useState(0)

  // also functions inside objects are binded
  r(count, {num: two})

  // use a lambda if you don't want to react to the state change'
  r(h, val, () => two(), setTwo)

  setter('updated')

  setTimeout(() => setTwo(two() + 1), 400)
}

main()