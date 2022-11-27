export type EffectsRegistry = { runAll: () => void, register: (effect: Effect<any> | null) => void}

export type Accessor<T> = () => T
export type Setter<T> = (v: T) => void
export type Signal<T> = [Accessor<T>, Setter<T>]

export type Effect<T> = {run: () => T}