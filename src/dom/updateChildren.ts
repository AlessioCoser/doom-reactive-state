/*
 * Keyed-only reconciliation: All elements must have a .key property.
 * Text nodes are allowed and do not use keys.
 * If an element is missing a key, an error is thrown.
*/
export function updateChildren(parentNode: Node, prev: ChildNode[], b: ChildNode[]): ChildNode[] {
  const a = prev.slice();
  reconcile(parentNode, a, b);
  return childrenOf(parentNode);
}

// Core reconcile that operates on provided `a` (previous children array) without reading DOM.
// Mutates the DOM under `parentNode`.
function reconcile(parentNode: Node, a: ChildNode[], b: ChildNode[]) {
  // Enforce: all elements in b must have a key (text nodes are allowed)
  for (let i = 0; i < b.length; i++) {
    const node = b[i];
    if (node.nodeType === Node.ELEMENT_NODE && resolveKey(node) == null) {
      throw new Error("All elements must have a .key property for reconciliation.");
    }
  }

  // Cache keys for b up-front
  const bKeys: (string | number | null)[] = new Array(b.length);
  for (let i = 0; i < b.length; i++) {
    bKeys[i] = resolveKey(b[i]);
  }

  // Keyed reconciliation only
  const aByKey = new Map<string | number, ChildNode>();
  for (const n of a) {
    const k = resolveKey(n);
    if (k != null && !aByKey.has(k)) aByKey.set(k, n);
  }
  if (aByKey.size) {
    const used = new Set<ChildNode>();
    for (let i = 0; i < b.length; i++) {
      const k = bKeys[i];
      if (k != null) {
        const existing = aByKey.get(k);
        if (existing && !used.has(existing)) {
          b[i] = existing;
          used.add(existing);
        }
      }
    }
  }

  let bLength = b.length,
    aEnd = a.length,
    bEnd = bLength,
    aStart = 0,
    bStart = 0,
    after = a[aEnd - 1]?.nextSibling,
    map = new Map<ChildNode, number>(),
    keyIndexMap: Map<string | number, number> | undefined;

  while (aStart < aEnd || bStart < bEnd) {
    while (bStart < bEnd && isEmptyTextNode(b[bStart])) {
      b[bStart].remove();
      bStart++;
    }
    while (bEnd > bStart && isEmptyTextNode(b[bEnd - 1])) {
      b[bEnd - 1].remove();
      bEnd--;
    }
    // common prefix
    if (aStart < aEnd && bStart < bEnd && equal(a[aStart], b[bStart])) {
      aStart++;
      bStart++;
      continue;
    }
    // common suffix
    while (aStart < aEnd && bStart < bEnd && equal(a[aEnd - 1], b[bEnd - 1])) {
      aEnd--;
      bEnd--;
    }
    // append
    if (aEnd === aStart) {
      let ref: ChildNode | null = null;
      if (bEnd < bLength) {
        const candidate = a[aStart];
        if (candidate && candidate.parentNode === parentNode) {
          ref = candidate;
        } else {
          ref = parentNode.firstChild;
        }
      } else {
        ref = after ?? null;
      }
      while (bStart < bEnd) {
        const l = b[bStart++];
        parentNode.insertBefore(l, ref);
      }
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart]) || isEmptyTextNode(a[aStart]))
          a[aStart].remove();
        aStart++;
      }
    } else {
      if (map.size === 0) {
        let i = bStart;
        while (i < bEnd) map.set(b[i], i++);
        keyIndexMap = new Map<string | number, number>();
        for (let j = bStart; j < bEnd; j++) {
          const k = bKeys[j];
          if (k != null && !keyIndexMap.has(k)) keyIndexMap.set(k, j);
        }
      }
      const current = a[aStart];
      let index = map.get(current);
      if (index == null && keyIndexMap) {
        const k = resolveKey(current);
        if (k != null) index = keyIndexMap.get(k) ?? null as any;
      }
      if (index != null) {
        if (bStart < index && index < bEnd) {
          let i = aStart,
            sequence = 1,
            t;
          while (++i < aEnd && i < bEnd) {
            if ((t = map.get(a[i])) == null || t !== index + sequence) break;
            sequence++;
          }
          if (sequence > index - bStart) {
            const node = a[aStart];
            while (bStart < index) {
              parentNode.insertBefore(b[bStart++], node);
            }
          } else parentNode.replaceChild(b[bStart++], a[aStart++]);
        } else aStart++;
      } else a[aStart++]?.remove();
    }
  }
}

function childrenOf(parent: Node): ChildNode[] {
  if (!parent.hasChildNodes()) {
    return [];
  }
  const children: ChildNode[] = [];
  const toRemove: ChildNode[] = [];
  for (const node of parent.childNodes) {
    if (isEmptyTextNode(node)) {
      toRemove.push(node);
    } else {
      children.push(node);
    }
  }
  toRemove.forEach((node) => node.remove());
  return children;
}

// Keys from expando property set via props (e.g., Li({ key: id }, ...))
function resolveKey(n: ChildNode): string | number | null {
  if (n.nodeType !== Node.ELEMENT_NODE) return null;
  const anyEl = n as unknown as { key?: string | number };
  return anyEl.key ?? null;
}

function equal(node: ChildNode | null, other: ChildNode | null): boolean {
  if (node === null && other === null) return true;
  if (!node || !other) return false;
  const k1 = resolveKey(node);
  const k2 = resolveKey(other);
  if (k1 != null || k2 != null) {
    if (k1 == null || k2 == null) return false;
    if (k1 !== k2) return false;
    return node === other;
  }
  return node === other;
}

function isEmptyTextNode(node: ChildNode) {
  return node && node.nodeType === node.TEXT_NODE && !node.textContent;
}
