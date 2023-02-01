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

  it('create a div element with a text inside', () => {
    const element = h("div", ["ciao"])
    body.appendChild(element)

    expect(body.innerHTML).toEqual("<div>ciao</div>")
  })
})

type Child = Node | string
function h<K extends keyof HTMLElementTagNameMap>(tag: K, children: Child[] = []): HTMLElementTagNameMap[K] {
  const el: HTMLElementTagNameMap[K] = document.createElement(tag)
  children.forEach((child) => appendChild(el, child))

  return el
}

function appendChild(el: HTMLElement, child: Child) {
  if (typeof child === 'string') {
    el.appendChild(document.createTextNode(child))
  } else {
    el.appendChild(child)
  }
}
