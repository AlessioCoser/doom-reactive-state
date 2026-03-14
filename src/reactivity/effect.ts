import { _Signal, Subscriber, Dispose } from "./types";
import { subscriptions } from "./subscriptions";

export function effect(fn: () => void): Dispose {
  return _createEffect(fn);
}

export function _createEffect(
  fn: () => void,
  derived: _Signal<any> | null = null
): Dispose {
  const running: Subscriber = {
    derived,
    execute(this: Subscriber) {
      if (!this.disposed) subscriptions.run(this, fn);
    },
  };
  running.execute();
  return () => subscriptions.unsubscribe(running);
}
