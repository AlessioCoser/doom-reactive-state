import { expect, describe, it, beforeEach } from "vitest";
import { updateChildren } from "../../src/dom/updateChildren";

const body = document.body;

describe("update children", () => {
  beforeEach(() => {
    body.innerHTML = "";
  });

  describe("with Element items", () => {
    it("no changes", testSingle([p(1)], []));
    it("append from empty", testSingle([], [p(1)]));
    it("append element", testSingle([p(1)], [p(1), p(2)]));
    it("append multiple element", testSingle([p(1)], [p(1), p(2), p(3)]));
    it("prepend element", testSingle([p(1)], [p(2), p(1)]));
    it("prepend multiple element", testSingle([p(1)], [p(3), p(2), p(1)]));
    it("prepend middle element", testSingle([p(1), p(2)], [p(1), p(3), p(2)]));
    it("remove child", testSingle([p(1)], []));
    it("remove children eq at start", testSingle([p(1), p(1.5), p(2)], [p(1)]));
    it("remove children eq at end", testSingle([p(1), p(1.5), p(2)], [p(2)]));
    it("remove children eq in middle", testSingle([p(1), p(2), p(3)], [p(2)]));
    it("swap first and last nodes", testSingle([p(1), p(2)], [p(2), p(1)]));
    it("swap first-last nodes with 2 in the middle", testSingle([p(1), p(2), p(3), p(4)], [p(4), p(2), p(3), p(1)]));
    it("replace child", testSingle([p(1), p(2)], [p(1), p(3)]));
    it("duplicated nodes", testSingle([p(1), p(2), p(3), p(2)], [p(2), p(1), p(2), p(3)]));
    it("complete example", testSingle([p(1), p(2), p(3), p(4), p(5)], [p(2), p(5), p(1), p(6)]));
  });

  describe("with Text items", () => {
    it("no changes", testSingle([t(1)], [t(2), t(1)]));
    it("append from empty", testSingle([], [t(1)]));
    it("append element", testSingle([t(1)], [t(1), t(2)]));
    it("append multiple element", testSingle([t(1)], [t(1), t(2), t(3)]));
    it("prepend element", testSingle([t(1)], [t(2), t(1)]));
    it("prepend multiple element", testSingle([t(1)], [t(3), t(2), t(1)]));
    it("prepend middle element", testSingle([t(1), t(2)], [t(1), t(3), t(2)]));
    it("remove child", testSingle([t(1)], []));
    it("first empty to filled", testSingle([empty(), t(2)], [t(1), t(2)]));
    it("last empty to filled", testSingle([t(1), empty()], [t(1), t(2)]));
    it("first filled to empty", testSingle([t(1), t(2)], [empty(), t(2)]));
    it("last filled to empty", testSingle([t(1), t(2)], [t(1), empty()]));
    it("remove children eq at start", testSingle([t(1), t(1.5), t(2)], [t(1)]));
    it("remove children eq at end)", testSingle([t(1), t(1.5), t(2)], [t(2)]));
    it("remove children eq in middle", testSingle([t(1), t(2), t(3)], [t(2)]));
    it("swap first and last nodes", testSingle([t(1), t(2)], [t(2), t(1)]));
    it("swap first-last nodes with 2 in the middle", testSingle([t(1), t(2), t(3), t(4)], [t(4), t(2), t(3), t(1)]));
    it("replace child", testSingle([t(1), t(2)], [t(1), t(3)]));
    it("duplicated nodes", testSingle([t(1), t(2), t(3), t(2)], [t(2), t(1), t(2), t(3)]));
    it("complete example", testSingle([t(1), t(2), t(3), t(4), t(5)], [t(2), t(5), t(1), t(6)]));
  });

  describe("with Text and Element items", () => {
    it("mixed", testSingle([p(1), t(2), p(3), t(4), t(5)], [t(5), p(1), t(6), p(6)]));
  });

  describe("update two times", () => {
    it("first empty to filled to empty", testDouble([empty(), t(2)], [t(1), t(2)], [empty(), t(2)]));
    it("last empty to filled to empty", testDouble([t(1), empty()], [t(1), t(2)], [t(1), empty()]));
    it("first filled to empty to filled", testDouble([t(1), t(2)], [empty(), t(2)], [t(1), t(2)]));
    it("last filled to empty to filled", testDouble([t(1), t(2)], [t(1), empty()], [t(1), t(2)]));
  });
});

function testSingle(asIs: ChildNode[], toBe: ChildNode[]) {
  return () => {
    appendChildren(body, asIs);
    testUpdateChildren(body, toBe);
  };
}

function testDouble(asIs: ChildNode[], being: ChildNode[], toBe: ChildNode[]) {
  return () => {
    appendChildren(body, asIs);
    testUpdateChildren(body, being);
    testUpdateChildren(body, toBe);
  };
}

function testUpdateChildren(body: Node, toBe: ChildNode[]) {
  updateChildren(body, toBe);
  expect(childrenOf(body)).toEqual(toBe.filter(withoutEmptyTextNodes));
}

function withoutEmptyTextNodes(node: ChildNode) {
  return !(node.nodeType === node.TEXT_NODE && node.textContent === "");
}

function childrenOf(parent: Node): ChildNode[] {
  if (!parent.hasChildNodes()) {
    return [];
  }

  const old: ChildNode[] = [];
  for (const node of parent.childNodes) {
    old.push(node);
  }
  return old;
}

function appendChildren(parent: Element, children: ChildNode[]) {
  children.forEach((child) => parent.appendChild(child));
}

function p(id: number): HTMLElement {
  const el = document.createElement("p");
  el.innerHTML = id.toString();
  return el;
}

function t(id: number): Text {
  return document.createTextNode(id.toString());
}

function empty(): Text {
  return document.createTextNode("");
}
