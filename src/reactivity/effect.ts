import { _Signal, Subscriber } from "./types";
import { subscriptions } from "./subscriptions";

export function effect(fn: () => void) {
  return _createEffect(fn);
}

export function _createEffect(
  fn: () => void,
  derived: _Signal<any> | null = null
) {
  const running: Subscriber = {
    derived,
    execute(this: Subscriber) {
      subscriptions.run(this, fn);
    },
  };
  running.execute();
}
