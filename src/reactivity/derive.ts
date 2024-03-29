import { Accessor, Derivation } from "./types";
import { _createEffect } from "./effect";
import { _createSignal } from "./signal";

export function derive<T>(initial: T, fn: Derivation<T>): Accessor<T> {
  const derived = _createSignal(initial);
  _createEffect(() => derived.set(fn(derived.get())), derived);
  return derived.get.bind(derived);
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
