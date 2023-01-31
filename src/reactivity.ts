export type Accessor<T> = () => T
export type Setter<T> = (value: T) => void
export function signal<T>(initial: T): [Accessor<T>, Setter<T>] {
  let _signal: T = initial

  return [
    () => _signal,
    (value: T) => _signal = value
  ]
}