import { expect, describe, it } from "vitest";
import { signal, effect, derive, d } from "../src/reactivity";

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

  it("derived signal", () => {
    let derivedComputations: number = 0;
    const [get, set] = signal(1);

    const derived = derive<number>(0, () => {
      derivedComputations++;
      return get() * 2;
    });

    expect(derived()).toEqual(2);
    set(8);
    expect(derived()).toEqual(16);
    expect(derivedComputations).toEqual(2);
  });

  it("derived signal with a template literal", () => {
    const [get, set] = signal(1);

    const derived = d`${get}px`

    expect(derived()).toEqual('1px');
    set(8);
    expect(derived()).toEqual('8px');
  });

  it("derived with multiple signals", () => {
    let derivedComputations: number = 0;
    const [getFirst, setFirst] = signal(2);
    const [getSecond, setSecond] = signal(2);

    const multiple = derive<number>(0, () => {
      derivedComputations++;
      return getFirst() * getSecond();
    });

    expect(multiple()).toEqual(4);
    setFirst(5);
    expect(multiple()).toEqual(10);
    setSecond(3);
    expect(multiple()).toEqual(15);
    expect(derivedComputations).toEqual(3);
  });

  it("updating the derived signal based on it's previous value", () => {
    const [get, set] = signal(2);
    const history = derive<number[]>([], (current) => [get(), ...current]);

    expect(history()).toEqual([2]);
    set(5);
    expect(history()).toEqual([5, 2]);
    set(7);
    expect(history()).toEqual([7, 5, 2]);
  });

  it("effect on a derived signal should work as a signal", () => {
    const calls: number[] = [];
    const [get, set] = signal(1);
    const multiply = derive<number>(0, () => get() * 2);

    effect(() => calls.push(multiply()));

    set(5);
    set(7);

    expect(calls).toEqual([2, 10, 14]);
  });

  it('execute only once the effect that uses both original and derived signals', () => {
    const calls1: string[] = []
    const callsDerived: number[] = []
    const [getSig0, setSig0] = signal(0)
    const sig1 = derive<number>(0, () => {
      const val = getSig0() * 2
      callsDerived.push(val)
      return val
    })

    effect(() => calls1.push(`${getSig0()} ${sig1()}`))

    setSig0(1)

    expect(sig1()).toEqual(2)
    expect(callsDerived).toEqual([0, 2])
    expect(calls1).toEqual(['0 0', '1 2'])
  })

  it('execute only once the effect that uses both original and the derivation of another derivation', () => {
    const calls1: string[] = []
    const calls2: number[] = []
    const calls3: number[] = []
    const calls4: number[] = []
    const [getSig0, setSig0] = signal(0)
    const sig1 = derive<number>(0, () => getSig0() * 2)
    const sig2 = derive<number>(0, () => sig1() + 1)

    effect(() => calls1.push(`${getSig0()} ${sig2()}`))
    effect(() => calls2.push(getSig0()))
    effect(() => calls3.push(sig1()))
    effect(() => calls4.push(sig2()))
    setSig0(1)
    setSig0(2)
    setSig0(3)
    setSig0(4)
    setSig0(5)

    expect(calls2).toEqual([0, 1, 2, 3, 4, 5])
    expect(calls3).toEqual([0, 2, 4, 6, 8, 10])
    expect(calls4).toEqual([1, 3, 5, 7, 9, 11])
    expect(calls1).toEqual(['0 1', '1 3', '2 5', '3 7', '4 9', '5 11'])
  })
});
