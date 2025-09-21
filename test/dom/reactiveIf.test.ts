import { beforeEach, describe, expect, it } from "vitest";
import { For, Div, Li, signal, Ul, If } from "../../src";

const body = document.body;

describe("ReactiveIf", () => {
  beforeEach(() => {
    body.innerHTML = "";
  });

  it("renders ifTrue when condition is true", () => {
    const [cond] = signal(true);
    const container = document.createElement("div");
    const ifComp = If(cond, () => Div({}, ["True branch"]), () => Div({}, ["False branch"]));
    ifComp.applyTo(container);
    expect(container.innerHTML).toContain("True branch");
    expect(container.innerHTML).not.toContain("False branch");
  });

  it("renders ifFalse when condition is false", () => {
    const [cond] = signal(false);
    const container = document.createElement("div");
    const ifComp = If(cond, () => Div({}, ["True branch"]), () => Div({}, ["False branch"]));
    ifComp.applyTo(container);
    expect(container.innerHTML).toContain("False branch");
    expect(container.innerHTML).not.toContain("True branch");
  });

  it("switches branches when condition changes", () => {
    const [cond, setCond] = signal(true);
    const container = document.createElement("div");
    const ifComp = If(cond, () => Div({}, ["True branch"]), () => Div({}, ["False branch"]));
    ifComp.applyTo(container);
    expect(container.innerHTML).toContain("True branch");
    setCond(false);
    expect(container.innerHTML).toContain("False branch");
    expect(container.innerHTML).not.toContain("True branch");
    setCond(true);
    expect(container.innerHTML).toContain("True branch");
    expect(container.innerHTML).not.toContain("False branch");
  });

  it("can render ReactiveChildren in ifTrue branch", () => {
    const [cond, setCond] = signal(true);
    const [items, setItems] = signal([{ id: 1, name: "A" }]);
    const container = document.createElement("div");
    const ifComp = If(
      cond,
      () => Ul(For(items, (item) => Li({ key: item().id }, [item().name]))),
      () => Div({}, ["No items"])
    );
    ifComp.applyTo(container);
    expect(container.innerHTML).toContain("A");
    setItems([{ id: 2, name: "B" }]);
    expect(container.innerHTML).toContain("B");
    setCond(false);
    expect(container.innerHTML).toContain("No items");
    setCond(true);
    expect(container.innerHTML).toContain("B");
  });

  it("can render ReactiveChildren in ifFalse branch", () => {
    const [cond, setCond] = signal(false);
    const [items, setItems] = signal([{ id: 1, name: "A" }]);
    const container = document.createElement("div");
    const ifComp = If(
      cond,
      () => Div({}, ["No items"]),
      () => Ul(For(items, (item) => Li({ key: item().id }, [item().name])))
    );
    ifComp.applyTo(container);
    expect(container.innerHTML).toContain("A");
    setItems([{ id: 2, name: "B" }]);
    expect(container.innerHTML).toContain("B");
    setCond(true);
    expect(container.innerHTML).toContain("No items");
    setCond(false);
    expect(container.innerHTML).toContain("B");
  });

  it("ReactiveChildren updates while hidden, then shown", () => {
    const [cond, setCond] = signal(true);
    const [items, setItems] = signal<{ id: number; name: string }[]>([{ id: 1, name: "A" }]);
    const container = document.createElement("div");
    const ifComp = If(
      cond,
      () => Ul(For(items, (item) => Li({ key: item().id }, [item().name]))),
      () => Div({}, ["No items"])
    );
    ifComp.applyTo(container);
    expect(container.innerHTML).toContain("A");
    setCond(false);
    setItems([{ id: 2, name: "B" }]);
    expect(container.innerHTML).toContain("No items");
    setCond(true);
    expect(container.innerHTML).toContain("B");
  });
});
