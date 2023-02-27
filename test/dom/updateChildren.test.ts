import { expect, describe, it, beforeEach } from 'vitest'
import { updateChildren } from '../../src/dom/updateChildren'

const body = document.body

describe("update children", () => {
  beforeEach(() => {
    body.innerHTML = ''
  })

  describe("with Element items", () => {
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
      ["complete example", [ p(1), p(2), p(3), p(4), p(5) ], [ p(2), p(5), p(1), p(6) ]]
    ])('%p', (_: string, asIs: ChildNode[], toBe: ChildNode[]) => {
      appendChildren(body, asIs)
      testUpdateChildren(body, toBe)
    });
  })

  describe("with Text items", () => {
    it.each([
      ["no changes", [ t(1) ], [ t(1) ]],
      ["append from empty", [  ], [ t(1) ]],
      ["append element", [ t(1) ], [ t(1), t(2) ]],
      ["append multiple element", [ t(1) ], [ t(1), t(2), t(3) ]],
      ["prepend element", [ t(1) ], [ t(2), t(1) ]],
      ["prepend multiple element", [ t(1) ], [ t(3), t(2), t(1) ]],
      ["prepend middle element", [ t(1), t(2) ], [ t(1), t(3), t(2) ]],
      ["remove child", [ t(1) ], [  ]],
      ["first empty to filled", [ empty(), t(2) ], [ t(1), t(2) ]],
      ["last empty to filled", [ t(1), empty() ], [ t(1), t(2) ]],
      ["first filled to empty", [ t(1), t(2) ], [ empty(), t(2) ]],
      ["last filled to empty", [ t(1), t(2) ], [ t(1), empty() ]],
      ["remove multiple children (equals at the start)", [ t(1), t(1.5), t(2) ], [ t(1) ]],
      ["remove multiple children (equals at the end)", [ t(1), t(1.5), t(2) ], [ t(2) ]],
      ["remove multiple child (equals in the middle)", [ t(1), t(2), t(3) ], [ t(2) ]],
      ["swap first and last nodes", [ t(1), t(2) ], [ t(2), t(1) ]],
      ["swap first and last nodes with 2 in the middle", [ t(1), t(2), t(3), t(4) ], [ t(4), t(2), t(3), t(1) ]],
      ["replace child", [ t(1), t(2) ], [ t(1), t(3) ]],
      ["duplicated nodes", [ t(1), t(2), t(3), t(2) ], [ t(2), t(1), t(2), t(3) ]],
      ["complete example", [ t(1), t(2), t(3), t(4), t(5) ], [ t(2), t(5), t(1), t(6) ]]
    ])('%p', (_: string, asIs: ChildNode[], toBe: ChildNode[]) => {
      appendChildren(body, asIs)
      testUpdateChildren(body, toBe)
    });
  })

  describe("with Text and Element items", () => {
    it.each([
      ["mixed", [ p(1), t(2), p(3), t(4), t(5) ], [ t(5), p(1), t(6), p(6) ]]
    ])('%p', (_: string, asIs: ChildNode[], toBe: ChildNode[]) => {
      appendChildren(body, asIs)
      testUpdateChildren(body, toBe)
    });
  })

  describe("update two times", () => {
    it.each([
      ["first empty to filled to empty", [ empty(), t(2) ], [ t(1), t(2) ], [ empty(), t(2) ]],
      ["last empty to filled to empty", [ t(1), empty() ], [ t(1), t(2) ], [ t(1), empty() ]],
      ["first filled to empty to filled", [ t(1), t(2) ], [ empty(), t(2)  ], [ t(1), t(2) ]],
      ["last filled to empty to filled", [ t(1), t(2) ], [ t(1), empty() ], [ t(1), t(2) ]]
    ])('%p', (_: string, asIs: ChildNode[], being: ChildNode[], toBe: ChildNode[]) => {
      appendChildren(body, asIs)
      testUpdateChildren(body, being)
      testUpdateChildren(body, toBe)
    });
  })
})

function testUpdateChildren(body: Node, toBe: ChildNode[]) {
  updateChildren(body, toBe)

  expect(childrenOf(body)).toEqual(toBe.filter(withoutEmptyTextNodes))
}

function withoutEmptyTextNodes(node: ChildNode) {
  return !(node.nodeType === node.TEXT_NODE && node.textContent === '')
}

function childrenOf(parent: Node): ChildNode[] {
  if (!parent.hasChildNodes()) {
    return []
  }

  const old: ChildNode[] = []
  for (const node of parent.childNodes) {
    old.push(node)
  }
  return old
}

function appendChildren(parent: Element, children: ChildNode[]) {
  children.forEach(child => parent.appendChild(child))
}

function p(id: number): HTMLElement {
  const el = document.createElement('p')
  el.innerHTML = id.toString()
  return el
}

function t(id: number): Text {
  return document.createTextNode(id.toString())
}

function empty(): Text {
  return document.createTextNode('')
}
