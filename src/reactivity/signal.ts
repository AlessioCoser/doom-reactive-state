import { Signal, Accessor, Setter } from "./types";
import { subscriptions } from "./subscriptions";

export function signal<T>(initial: T): [Accessor<T>, Setter<T>] {
  const s = _createSignal(initial);
  return [s.get.bind(s), s.set.bind(s)];
}
export function _createSignal<T>(initial: T): Signal<T> {
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
