type Accessor<T> = () => T
type Setter<T> = (value: T) => void
type Signal<T> = [Accessor<T>, Setter<T>]
export function signal<T>(initial: T): Signal<T> {
  let _value: T = initial

  function accessor() {
    return _value
  }

  function setter(value: T) {
    _value = value
  }

  return [accessor, setter]
}
