import { reconcileArrays } from '../src/reconcileArrays'
import { JSDOM } from 'jsdom'
const { document } = (new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`)).window;

const body = document.body

const p = (id: number): HTMLElement => {
  const el = document.createElement('p')
  el.setAttribute("_key", id.toString())
  return el
}

function childrenOf(parent: Element, children: Element[]): Element[] {
  children.forEach(child => parent.appendChild(child))
  return Array.from(parent.children)
}


describe("reconcile arrays", () => {
  beforeEach(() => {
    body.innerHTML = ''
  })

  test("no changes", () =>  {
    const asIs = childrenOf(body, [p(1)])
    const toBe = [p(1)]

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })

  test("append from empty", () =>  {
    const asIs = childrenOf(body, [])
    const toBe = [p(1)]

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })

  test("append element", () =>  {
    const asIs = childrenOf(body, [p(1)])
    const toBe = [p(1), p(2)]

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })

  test("append multiple element", () =>  {
    const asIs = childrenOf(body, [p(1)])
    const toBe = [p(1), p(2), p(3)]

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })

  test("prepend element", () =>  {
    const asIs = childrenOf(body, [p(1)])
    const toBe = [p(2), p(1)]

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })

  test("prepend multiple element", () =>  {
    const asIs = childrenOf(body, [p(1)])
    const toBe = [p(3), p(2), p(1)]

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })

  test("prepend middle element", () =>  {
    const asIs = childrenOf(body, [p(1), p(2)])
    const toBe = [p(1), p(3), p(2)]

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })

  test("remove child", () =>  {
    const asIs = childrenOf(body, [p(1)])
    const toBe: HTMLElement[] = []

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })

  test("remove multiple child (equals at the end)", () =>  {
    const asIs = childrenOf(body, [p(1), p(1.5), p(2)])
    const toBe = [p(2)]

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })

  test("remove multiple child (equals in the middle)", () =>  {
    const asIs = childrenOf(body, [p(1), p(2), p(3)])
    const toBe = [p(2)]

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })

  test("swap first and last nodes", () =>  {
    const asIs = childrenOf(body, [p(1), p(2)])
    const toBe = [p(2), p(1)]

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })

  test("swap first and last nodes with something in the middle", () =>  {
    const asIs = childrenOf(body, [p(1), p(1.7), p(1.3), p(2)])
    const toBe = [p(2), p(1.7), p(1.3), p(1)]

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })

  test("replace child", () =>  {
    const asIs = childrenOf(body, [p(1), p(2)])
    const toBe = [p(1), p(3)]

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })

  test("complete example", () =>  {
    const asIs = childrenOf(body, [p(1), p(2), p(3), p(4), p(5)])
    const toBe = [p(2), p(5), p(1), p(6)]

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })

  test("duplicated nodes", () =>  {
    const asIs = childrenOf(body, [p(1), p(2), p(3), p(2)])
    const toBe = [p(2), p(1), p(2), p(3)]

    reconcileArrays(body, asIs, toBe)

    expect(Array.from(body.children)).toEqual(toBe)
  })
})
