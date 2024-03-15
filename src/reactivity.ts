import { Context, Signal, Accessor, Setter, Derivation } from "./types";

let currentSubscriber: Context | null = null;

export function signal<T>(initial: T): [Accessor<T>, Setter<T>] {
  const s = _signal(initial)
  return [s.get.bind(s), s.set.bind(s)]
}
function _signal<T>(initial: T): Signal<T> {
  let _value: T = initial;
  const subscriptions = new Set<Context>();

  return {
    get() {
      if (currentSubscriber) subscriptions.add(currentSubscriber);
      return _value;
    },
    set(value: T) {
      _value = value;
      subscriptions.forEach((subscriber) => {
        if (subscriber !== currentSubscriber) {
          subscriber.execute();
        }
      });
    },
  };
}

export function effect(fn: () => void) {
  const running = {
    execute() {
      currentSubscriber = this;
      try {
        fn();
      } finally {
        currentSubscriber = null;
      }
    },
  };
  running.execute();
}

export function derive<T>(initial: T, fn: Derivation<T>): Accessor<T> {
  const [getDerived, setDerived] = signal(initial);
  effect(() => setDerived(fn(getDerived())));
  return getDerived;
}
