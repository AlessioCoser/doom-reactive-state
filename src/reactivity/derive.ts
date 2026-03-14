import { Accessor, Derivation } from "./types";
import { _createEffect } from "./effect";
import { _createSignal } from "./signal";

export function derive<T>(initial: T, fn: Derivation<T>): Accessor<T> {
  const derived = _createSignal(initial);
  const dispose = _createEffect(() => derived.set(fn(derived.get())), derived);
  const accessor = derived.get.bind(derived) as Accessor<T> & { dispose: () => void };
  accessor.dispose = dispose;
  return accessor;
}

export function d(
  strings: TemplateStringsArray,
  ...values: (Accessor<any> | any)[]
): Accessor<string> {
  return derive("", () => {
    const computed = values.map((v) => (typeof v === "function" ? v() : v));
    return String.raw({ raw: strings }, ...computed);
  });
}
