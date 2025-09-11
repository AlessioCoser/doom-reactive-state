/*
 * Slightly modified and tested version of:
 * https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/reconcile.js
*/
export function updateChildren(parentNode: Node, b: ChildNode[]) {
  let a = childrenOf(parentNode);

  reconcileCore(parentNode, a, b);
}

export function updateChildrenFast(parentNode: Node, prev: ChildNode[], b: ChildNode[]): ChildNode[] {
  // `prev` is the previously returned array from reconcile; it is already normalized.
  const a = prev.slice();
  reconcileCore(parentNode, a, b);
  // return the new, normalized children so callers can reuse it on next run
  return childrenOf(parentNode);
}

// Core reconcile that operates on provided `a` (previous children array) without reading DOM.
// Mutates the DOM under `parentNode`.
function reconcileCore(parentNode: Node, a: ChildNode[], b: ChildNode[]) {
  // Cache keys for b up-front to avoid repeated property reads.
  const bKeys: (string | number | null)[] = new Array(b.length);
  let bHasAnyKeys = false;
  for (let i = 0; i < b.length; i++) {
    const k = resolveKey(b[i]);
    bKeys[i] = k;
    if (k != null) bHasAnyKeys = true;
  }

  // keyed reconciliation
  const aByKey = new Map<string | number, ChildNode>();
  if (bHasAnyKeys && a.length) {
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
            b[i] = existing; // in-place substitution
            used.add(existing);
          }
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
    while (isEmptyTextNode(b[bStart])) {
      b[bStart].remove();
      bStart++;
    }

    while (isEmptyTextNode(b[bEnd - 1])) {
      b[bEnd - 1].remove();
      bEnd--;
    }

    // common prefix
    if (equal(a[aStart], b[bStart])) {
      aStart++;
      bStart++;
      continue;
    }
    // common suffix
    while (equal(a[aEnd - 1], b[bEnd - 1])) {
      aEnd--;
      bEnd--;
    }
    // append
    if (aEnd === aStart) {
      // Choose a safe anchor reference inside parentNode.
      // - If we are appending within the active window (bEnd < bLength), prefer a[aStart] when it still belongs to parentNode.
      //   Otherwise, use the firstChild as a safe anchor (or null to append).
      // - If appending to the end (bEnd === bLength), use `after` (may be null to append at end).
      let ref: ChildNode | null = null;

      if (bEnd < bLength) {
        const candidate = a[aStart];
        if (candidate && candidate.parentNode === parentNode) {
          ref = candidate;
        } else {
          ref = parentNode.firstChild; // may be null (append)
        }
      } else {
        // append to end
        ref = after ?? null;
      }

      while (bStart < bEnd) {
        const l = b[bStart++];
        parentNode.insertBefore(l, ref);
      }
      // remove
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart]) || isEmptyTextNode(a[aStart]))
          a[aStart].remove();
        aStart++;
      }
      // swap backward (guarded to 2-node window)
    } else if (
      (aEnd - aStart) === 2 && (bEnd - bStart) === 2 &&
      equal(a[aStart], b[bEnd - 1]) &&
      equal(b[bStart], a[aEnd - 1])
    ) {
      parentNode.insertBefore(a[aEnd - 1], a[aStart]);
      parentNode.insertBefore(a[aStart], a[aEnd - 2].nextSibling);
      aEnd--;
      bEnd--;
      aStart++;
      bStart++;
      // fallback to map
    } else {
      if (map.size === 0) {
        let i = bStart;
        while (i < bEnd) map.set(b[i], i++);
        // Only build key index map if the new window has any keyed items
        if (bHasAnyKeys) {
          keyIndexMap = new Map<string | number, number>();
          for (let j = bStart; j < bEnd; j++) {
            const k = bKeys[j];
            if (k != null && !keyIndexMap.has(k)) keyIndexMap.set(k, j);
          }
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
