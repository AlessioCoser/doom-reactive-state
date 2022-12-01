import { reconcileArrays } from '../src/reconcileArrays'
import { JSDOM } from 'jsdom'
const { document } = (new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`)).window;

const body = document.body

describe("reconcile arrays", () => {
  beforeEach(() => {
    body.innerHTML = ''
  })

  it.each([
      ["no changes", [ p(1) ], [ p(1) ]],
      ["append from empty", [  ], [ p(1) ]],
      ["append element", [ p(1) ], [ p(1), p(2) ]],
      ["append multiple element", [ p(1) ], [ p(1), p(2), p(3) ]],
      ["prepend element", [ p(1) ], [ p(2), p(1) ]],
      ["prepend multiple element", [ p(1) ], [ p(3), p(2), p(1) ]],
      ["prepend middle element", [ p(1), p(2) ], [ p(1), p(3), p(2) ]],
      ["remove child", [ p(1) ], [  ]],
      ["remove multiple children (equals at the start)", [ p(1), p(1.5), p(2) ], [ p(1) ]],
      ["remove multiple children (equals at the end)", [ p(1), p(1.5), p(2) ], [ p(2) ]],
      ["remove multiple child (equals in the middle)", [ p(1), p(2), p(3) ], [ p(2) ]],
      ["swap first and last nodes", [ p(1), p(2) ], [ p(2), p(1) ]],
      ["swap first and last nodes with 2 in the middle", [ p(1), p(2), p(3), p(4) ], [ p(4), p(2), p(3), p(1) ]],
      ["replace child", [ p(1), p(2) ], [ p(1), p(3) ]],
      ["duplicated nodes", [ p(1), p(2), p(3), p(2) ], [ p(2), p(1), p(2), p(3) ]],
      ["complete example", [ p(1), p(2), p(3), p(4), p(5) ], [ p(2), p(5), p(1), p(6) ]],
  ])('%p', (_: string, _asIs: Element[], toBe: Element[]) => {
    const asIs = childrenOf(body, _asIs)

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  });
})

function p(id: number): HTMLElement {
  const el = document.createElement('p')
  el.setAttribute("_key", id.toString())
  return el
}

function childrenOf(parent: Element, children: Element[]): Element[] {
  children.forEach(child => parent.appendChild(child))
  return Array.from(parent.children)
}
