export type Accessor<T> = () => T
export function signal<T>(initial: T): [Accessor<T>] {
  return [
    () => initial
  ]
}