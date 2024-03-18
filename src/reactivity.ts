import { Signal, Accessor, Setter, Derivation } from "./types";
import { Subscriptions } from "./Subscriptions";

const subscriptions = new Subscriptions();

export function signal<T>(initial: T): [Accessor<T>, Setter<T>] {
  const s = _createSignal(initial);
  return [s.get.bind(s), s.set.bind(s)];
}
function _createSignal<T>(initial: T): Signal<T> {
  let _value: T = initial;

  return {
    get(this: Signal<T>) {
      subscriptions.subscribeTo(this);
      return _value;
    },
    set(this: Signal<T>, value: T) {
      _value = value;
      subscriptions.executeAllSubscriptionsTo(this);
    },
  };
}

export function effect(fn: () => void) {
  return _createEffect(fn);
}
function _createEffect(fn: () => void, derived: Signal<any> | null = null) {
  const running = {
    derived,
    execute() {
      subscriptions.run(this, fn)
    },
  };
  running.execute();
}

export function derive<T>(initial: T, fn: Derivation<T>): Accessor<T> {
  const derived = _createSignal(initial);
  _createEffect(() => derived.set(fn(derived.get())), derived);
  return derived.get.bind(derived);
}
