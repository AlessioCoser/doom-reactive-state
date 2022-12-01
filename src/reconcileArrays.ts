// Slightly modified version of: https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/reconcile.js
export function reconcileArrays(parentNode: Node, a: Element[], b: Element[]) {
  let bLength = b.length,
    aEnd = a.length,
    bEnd = bLength,
    aStart = 0,
    bStart = 0,
    after = a[aEnd - 1]?.nextSibling,
    map = new Map<Element, number>();

  while (aStart < aEnd || bStart < bEnd) {
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
      let node = after
      if (bEnd < bLength){
        if(bStart){
          node = a[aStart]
        } else {
          node = a[aEnd - aStart]
        }
      }

      while (bStart < bEnd) {
        parentNode.insertBefore(b[bStart++], node);
      }
    // remove
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart])) a[aStart].remove();
        aStart++;
      }
    // swap backward
    } else if (equal(a[aStart], b[bEnd - 1]) && equal(b[bStart], a[aEnd - 1])) {
      parentNode.insertBefore(a[aEnd - 1], a[aStart]);
      parentNode.insertBefore(a[aStart], a[aEnd - 2].nextSibling);
      aEnd--
      bEnd--
      aStart++
      bStart++
    // fallback to map
    } else {
      if (map.size === 0) {
        let i = bStart;

        while (i < bEnd) map.set(b[i], i++);
      }

      const index = map.get(a[aStart]);
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
      } else a[aStart++].remove();
    }
  }
}

function equal(node: Element | null, other: Element | null): boolean {
  if (node === null && other === null) return true
  return node?.isEqualNode(other) || false
}