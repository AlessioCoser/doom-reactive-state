import { Context, Signal, Accessor, Derivation } from "./types";

let runningContext: Context | null = null;

export function signal<T>(initial: T): Signal<T> {
  let _value: T = initial;
  const subscriptions = new Set<Context>();

  return [
    function accessor() {
      if (runningContext) subscriptions.add(runningContext);
      return _value;
    },
    function setter(value: T) {
      _value = value;
      subscriptions.forEach((subscribedContext) => {
        if (subscribedContext !== runningContext) {
          subscribedContext.execute();
        }
      });
    },
  ];
}

export function effect(fn: () => void) {
  const running = {
    execute() {
      runningContext = this;
      try {
        fn();
      } finally {
        runningContext = null;
      }
    },
  };

  running.execute();
}

export function derive<T>(initial: T, fn: Derivation<T>): Accessor<T> {
  let derived: T = initial;
  effect(() => (derived = fn(derived)));
  return () => derived;
}
