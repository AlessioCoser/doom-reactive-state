import { h } from '../src/dom';

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
    const element = h("div", {}, ["ciao"])
    body.appendChild(element)

    expect(body.innerHTML).toEqual("<div>ciao</div>")
  })

  it('create a div element with properties', () => {
    const element = h("div", { className: 'class1' })
    body.appendChild(element)

    expect(body.innerHTML).toEqual(`<div class="class1"></div>`)
  })
})
