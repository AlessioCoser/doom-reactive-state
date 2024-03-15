import { expect, describe, it } from "vitest";
import { signal, effect, derive } from "../src/reactivity";

describe("reactivity", () => {
  it("get the initial value", () => {
    const initial: number = 0;
    const [get] = signal(initial);

    expect(get()).toEqual(initial);
  });

  it("set a new value", () => {
    const [get, set] = signal(0);

    set(1);

    expect(get()).toEqual(1);
  });

  it("register for a value change", () => {
    const calls: number[] = [];
    const [get, set] = signal(0);

    effect(() => calls.push(get()));
    set(1);
    set(2);
    set(3);
    set(4);
    set(5);

    expect(calls).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("update the state inside the effect", () => {
    const [get, set] = signal(0);

    effect(() => set(get() * 2));
    set(5);

    expect(get()).toEqual(10);
  });

  it('derived signal', () => {
    let derivedComputations: number = 0;
    const [get, set] = signal(1)

    const derived = derive(() => {
      derivedComputations++;
      return get() * 2
    })

    expect(derived()).toEqual(2)
    set(8)
    expect(derived()).toEqual(16)
    expect(derivedComputations).toEqual(2)
  })
});
