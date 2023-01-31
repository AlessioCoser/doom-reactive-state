let runningEffect: Effect | null = null

type Effect = {run: () => void}
export function effect(fn: () => void): void {
  const _effect = {
    run() {
      runningEffect = this
      fn()
      runningEffect = null
    }
  }
  _effect.run()
}

type Accessor<T> = () => T
type Setter<T> = (value: T) => void
export function signal<T>(initial: T): [Accessor<T>, Setter<T>] {
  let _signal: T = initial
  const effects: Effect[] = []

  const accessor = function () {
    if (runningEffect && notYetRegistered(effects)) {
      effects.push(runningEffect)
    }
    return _signal
  }

  const setter = (value: T) => {
    _signal = value
    effects
      .filter(isNotRunning())
      .forEach((effect) => effect.run())
  }

  return [
    accessor,
    setter
  ]
}

function isNotRunning(): (value: Effect, index: number, array: Effect[]) => unknown {
  return effect => effect !== runningEffect
}

function notYetRegistered(effects: Effect[]) {
  return !effects.some(effect => effect === runningEffect)
}
