import { expect, describe, it, beforeEach } from "vitest";
import { updateChildren } from "../../src/dom/updateChildren";

const body = document.body;

describe("update children", () => {
  beforeEach(() => {
    body.innerHTML = "";
  });

  describe("with Element items", () => {
    it("no changes", testSingle([pk(1, "a")], [pk(1, "a")]));
    it("append from empty", testSingle([], [pk(1, "a")]));
    it("append element", testSingle([pk(1, "a")], [pk(1, "a"), pk(2, "b")]));
    it("append multiple element", testSingle([pk(1, "a")], [pk(1, "a"), pk(2, "b"), pk(3, "c")]));
    it("prepend element", testSingle([pk(1, "a")], [pk(2, "b"), pk(1, "a")]));
    it("prepend multiple element", testSingle([pk(1, "a")], [pk(3, "c"), pk(2, "b"), pk(1, "a")]));
    it("prepend middle element", testSingle([pk(1, "a"), pk(2, "b")], [pk(1, "a"), pk(3, "c"), pk(2, "b")]));
    it("remove child", testSingle([pk(1, "a")], []));
    it("remove children eq at start", testSingle([pk(1, "a"), pk(1.5, "b"), pk(2, "c")], [pk(1, "a")]));
    it("remove children eq at end", testSingle([pk(1, "a"), pk(1.5, "b"), pk(2, "c")], [pk(2, "c")]));
    it("remove children eq in middle", testSingle([pk(1, "a"), pk(2, "b"), pk(3, "c")], [pk(2, "b")]));
    it("swap first and last nodes", testSingle([pk(1, "a"), pk(2, "b")], [pk(2, "b"), pk(1, "a")]));
    it("swap first-last nodes with 2 in the middle", testSingle([pk(1, "a"), pk(2, "b"), pk(3, "c"), pk(4, "d")], [pk(4, "d"), pk(2, "b"), pk(3, "c"), pk(1, "a")]));
    it("replace child", testSingle([pk(1, "a"), pk(2, "b")], [pk(1, "a"), pk(3, "c")]));
    it("complete example", testSingle([pk(1, "a"), pk(2, "b"), pk(3, "c"), pk(4, "d"), pk(5, "e")], [pk(2, "b"), pk(5, "e"), pk(1, "a"), pk(6, "f")]));
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
    it("complete example", testSingle([t(1), t(2), t(3), t(4), t(5)], [t(2), t(5), t(1), t(6)]));
  });

  describe("with Text and Element items", () => {
    it("mixed", testSingle([pk(1, "a"), t(2), pk(3, "c"), t(4), t(5)], [t(5), pk(1, "a"), t(6), pk(6, "f")]));
  });

  describe("update two times", () => {
    it("first empty to filled to empty", testDouble([empty(), t(2)], [t(1), t(2)], [empty(), t(2)]));
    it("last empty to filled to empty", testDouble([t(1), empty()], [t(1), t(2)], [t(1), empty()]));
    it("first filled to empty to filled", testDouble([t(1), t(2)], [empty(), t(2)], [t(1), t(2)]));
    it("last filled to empty to filled", testDouble([t(1), t(2)], [t(1), empty()], [t(1), t(2)]));
  });

  describe("keyed reconciliation", () => {
    it("moves reuse nodes by key (identity is preserved)", () => {
      const a1 = pk(1, "a");
      const a2 = pk(2, "b");
      const a3 = pk(3, "c");
      appendChildren(body as Element, [a1, a2, a3]);

      const toBe = [pk(2, "b"), pk(1, "a"), pk(3, "c")];
      updateChildren(body, childrenOf(body), toBe);

      const ch = childrenOf(body);
      expect(ch.length).toBe(3);
      expect(ch[0]).toBe(a2);
      expect(ch[1]).toBe(a1);
      expect(ch[2]).toBe(a3);
    });

    it("inserting a new keyed node preserves existing ones", () => {
      const a1 = pk(1, "a");
      const a2 = pk(2, "b");
      appendChildren(body as Element, [a1, a2]);

      const toBe = [pk(2, "b"), pk(1, "a"), pk(3, "c")];
      updateChildren(body, childrenOf(body), toBe);

      const ch = childrenOf(body);
      expect(ch.length).toBe(3);
      expect(ch[0]).toBe(a2);
      expect(ch[1]).toBe(a1);
      expect(ch[2].textContent).toBe("3");
      expect(ch[2]).not.toBe(a1);
      expect(ch[2]).not.toBe(a2);
    });

    it("changing the key results in replacement (no reuse)", () => {
      const a1 = pk(1, "a");
      appendChildren(body as Element, [a1]);

      const toBe = [pk(1, "z")];
      updateChildren(body, childrenOf(body), toBe);

      const ch = childrenOf(body);
      expect(ch.length).toBe(1);
      expect(ch[0].textContent).toBe("1");
      expect(ch[0]).not.toBe(a1);
    });

    it("ignores keys for Text nodes (unchanged behavior)", () => {
      const x1 = t(1);
      appendChildren(body as Element, [x1]);

      const toBe = [t(1)];
      updateChildren(body, childrenOf(body), toBe);

      const ch = childrenOf(body);
      expect(ch.length).toBe(1);
      expect(ch[0].textContent).toBe("1");
    });

    it("handles duplicate keys in target: reuse first, keep subsequent as new nodes", () => {
      const a1 = pk(1, "a");
      const a2 = pk(2, "b");
      const a3 = pk(3, "c");
      appendChildren(body as Element, [a1, a2, a3]);

      const dupB = pk(22, "b");
      const toBe = [pk(99, "x"), pk(2, "b"), dupB, pk(1, "a")];
      updateChildren(body, childrenOf(body), toBe);

      const ch = childrenOf(body);
      expect(ch.length).toBe(4);
      expect(ch[1]).toBe(a2);
      expect(ch[2]).not.toBe(a2);
      expect(ch[2].textContent).toBe("22");
      expect(ch[3]).toBe(a1);
    });

    it("reuses existing node even if new instance has different tag, when key matches", () => {
      const a1 = pk(1, "keep");
      appendChildren(body as Element, [a1]);

      const toBe = [spk(1, "keep")];
      updateChildren(body, childrenOf(body), toBe);

      const ch = childrenOf(body);
      expect(ch.length).toBe(1);
      expect((ch[0] as Element).tagName.toLowerCase()).toBe("p");
      expect(ch[0]).toBe(a1);
    });

    it("removing a keyed node and re-adding same key later creates a new node", () => {
      const a1 = pk(1, "z");
      appendChildren(body as Element, [a1]);

      updateChildren(body, childrenOf(body), []);
      expect(childrenOf(body).length).toBe(0);

      const a1b = pk(1, "z");
      updateChildren(body, [], [a1b]);

      const ch = childrenOf(body);
      expect(ch.length).toBe(1);
      expect(ch[0]).toBe(a1b);
      expect(ch[0]).not.toBe(a1);
    });

    it("key type strictness: '1' and 1 are different keys", () => {
      const a1 = pk(1, "1");
      appendChildren(body as Element, [a1]);

      const toBe = [pk(1, 1)];
      updateChildren(body, childrenOf(body), toBe);

      const ch = childrenOf(body);
      expect(ch.length).toBe(1);
      expect(ch[0].textContent).toBe("1");
      expect(ch[0]).not.toBe(a1);
    });

    it("reversing a keyed list reuses all nodes in reversed order", () => {
      const a1 = pk(1, "a");
      const a2 = pk(2, "b");
      const a3 = pk(3, "c");
      const a4 = pk(4, "d");
      appendChildren(body as Element, [a1, a2, a3, a4]);

      const toBe = [pk(4, "d"), pk(3, "c"), pk(2, "b"), pk(1, "a")];
      updateChildren(body, childrenOf(body), toBe);

      const ch = childrenOf(body);
      expect(ch.length).toBe(4);
      expect(ch[0]).toBe(a4);
      expect(ch[1]).toBe(a3);
      expect(ch[2]).toBe(a2);
      expect(ch[3]).toBe(a1);
    });
  });

  // New: sequential updates using standard updateChildrenFast
  describe("reconcile (sequential updates via updateChildrenFast)", () => {
    it("multiple updates produce correct DOM across reorders/inserts/removes", () => {
      const root = document.createElement("div");
      document.body.appendChild(root);

      // start empty -> [1,2]
      let prev = updateChildren(root, [], [pk(1, "a"), pk(2, "b")]);
      expect(childrenOf(root).map((n) => (n as Element).textContent)).toEqual(["1", "2"]);

      // reorder + insert mid -> [2,1,3]
      prev = updateChildren(root, prev, [pk(2, "b"), pk(1, "a"), pk(3, "c")]);
      expect(childrenOf(root).map((n) => (n as Element).textContent)).toEqual(["2", "1", "3"]);

      // remove mid -> [2,3]
      prev = updateChildren(root, prev, [pk(2, "b"), pk(3, "c")]);
      expect(childrenOf(root).map((n) => (n as Element).textContent)).toEqual(["2", "3"]);

      document.body.removeChild(root);
    });

    it("empty to empty is a no-op", () => {
      const root = document.createElement("div");
      document.body.appendChild(root);

      let prev = updateChildren(root, [], []);
      expect(childrenOf(root)).toEqual([]);

      prev = updateChildren(root, prev, []);
      expect(childrenOf(root)).toEqual([]);

      document.body.removeChild(root);
    });

    it("keyed structural equality: DOM outcome remains correct on similar structures", () => {
      const root = document.createElement("div");
      document.body.appendChild(root);

      let prev = updateChildren(root, [], [pk(1, "a"), pk(2, "b")]);
      prev = updateChildren(root, prev, [pk(1, "a"), pk(3, "c")]);

      const after = childrenOf(root);
      expect(after.map((n) => (n as Element).textContent)).toEqual(["1", "3"]);

      document.body.removeChild(root);
    });

    it("key collision in same window: reuse first, keep subsequent as new nodes", () => {
      const root = document.createElement("div");
      document.body.appendChild(root);

      const a1 = pk(1, "a");
      const b1 = pk(2, "b");
      let prev = updateChildren(root, [], [a1, b1]);
      const initialA = childrenOf(root)[0];
      const initialB = childrenOf(root)[1];

      const dupB = pk(22, "b");
      prev = updateChildren(root, prev, [pk(2, "b"), dupB, pk(1, "a")]);
      const ch = childrenOf(root);
      expect(ch.length).toBe(3);
      expect(ch[0]).toBe(initialB);
      expect(ch[1]).not.toBe(initialB);
      expect((ch[1] as Element).textContent).toBe("22");
      expect(ch[2]).toBe(initialA);

      document.body.removeChild(root);
    });
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
  updateChildren(body, childrenOf(body), toBe);
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

function pk(id: number, key: string | number): HTMLElement {
  const el = document.createElement("p");
  el.innerHTML = id.toString();
  (el as any).key = key;
  return el;
}

function spk(id: number, key: string | number): HTMLElement {
  const el = document.createElement("span");
  el.innerHTML = id.toString();
  (el as any).key = key;
  return el;
}

function t(id: number): Text {
  return document.createTextNode(id.toString());
}

function empty(): Text {
  return document.createTextNode("");
}
