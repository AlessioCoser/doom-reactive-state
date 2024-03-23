import { Signal, _Signal } from "./types";
import { subscriptions } from "./subscriptions";

export function signal<T>(initial: T): Signal<T> {
  const s = _createSignal(initial);
  return [s.get.bind(s), s.set.bind(s)];
}
export function _createSignal<T>(initial: T): _Signal<T> {
  let _value: T = initial;

  return {
    get(this: _Signal<T>) {
      subscriptions.subscribeTo(this);
      return _value;
    },
    set(this: _Signal<T>, value: T) {
      _value = value;
      subscriptions.executeAllSubscriptionsTo(this);
    },
  };
}
