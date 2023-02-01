import { JSDOM } from 'jsdom'
const { document } = (new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`)).window;

const body = document.body

describe("dom", () => {
  beforeEach(() => {
    body.innerHTML = ''
  })

  it('create an element', () => {
    const element = h("div")
    body.appendChild(element)

    expect(body.innerHTML).toEqual("<div></div>")
  })
})

function h<K extends keyof HTMLElementTagNameMap>(tag: K): HTMLElementTagNameMap[K] {
  const el: HTMLElementTagNameMap[K] = document.createElement(tag)
  return el
}