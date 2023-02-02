import { h } from '../src/dom';
import { signal } from '../src/reactivity';

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

  it('create a div element with style properties', () => {
    const element = h("div", { style: { fontSize: '15px' } })
    body.appendChild(element)

    expect(body.innerHTML).toEqual(`<div style="font-size: 15px;"></div>`)
  })

  it('create a div element with reactive properties', () => {
    const element = h("div", { className: () => 'test', style: () => ({ padding: '5px' }) })
    body.appendChild(element)

    expect(body.innerHTML).toEqual(`<div class="test" style="padding: 5px;"></div>`)
  })

  it('create a div element with reactive style attributes', () => {
    const element = h("div", { style: { padding: () => '5px' } })
    body.appendChild(element)

    expect(body.innerHTML).toEqual(`<div style="padding: 5px;"></div>`)
  })

  it('handle reactivity', () => {
    const [count, setCount] = signal(14)
    const element = h("div", { style: { fontSize: () => `${count()}px` } }, ["Increase"])
    body.appendChild(element)

    expect(body.innerHTML).toEqual(`<div style="font-size: 14px;">Increase</div>`)

    setCount(20)

    expect(body.innerHTML).toEqual(`<div style="font-size: 20px;">Increase</div>`)
  })

  it('update div style property on click', () => {
    const Element = () => {
      const [count, setCount] = signal(10)

      const fontSize = () => `${count()}px`
      const increase = () => setCount(count() + 5)

      return h("div", { style: { fontSize }, onclick: increase }, ["Click me"])
    }
    body.appendChild(Element())

    expect(body.innerHTML).toEqual(`<div style="font-size: 10px;">Click me</div>`)

    body.querySelector('div')?.click()

    expect(body.innerHTML).toEqual(`<div style="font-size: 15px;">Click me</div>`)
  })

  it('update children on click', () => {
    const Element = () => {
      const [count, setCount] = signal(10)

      const size = () => `Size: ${count()}px`
      const increase = () => setCount(count() + 5)

      return h("div", { onclick: increase }, [size])
    }
    body.appendChild(Element())

    expect(body.innerHTML).toEqual(`<div>Size: 10px</div>`)

    body.querySelector('div')?.click()

    expect(body.innerHTML).toEqual(`<div>Size: 15px</div>`)
  })
})
