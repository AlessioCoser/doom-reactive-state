import { expect, describe, it, beforeEach } from 'vitest'
import { Div, P, h } from '../../src/dom';
import { derive, signal } from '../../src/reactivity';

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
    const element = h("div", { children: ["ciao"] })
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
    const element = h("div", { style: { fontSize: () => `${count()}px` }, children: ["Increase"] })
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

      return h("div", { className: 'test', style: { fontSize }, onclick: increase, children: ["Click me"] })
    }
    body.appendChild(Element())

    expect(body.innerHTML).toEqual(`<div class="test" style="font-size: 10px;">Click me</div>`)

    body.querySelector('div')?.click()

    expect(body.innerHTML).toEqual(`<div class="test" style="font-size: 15px;">Click me</div>`)
  })

  it('remove a style property using an empty value', () => {
    const [visible, setVisible] = signal<string>('hidden')

    body.appendChild(h("div", { style: { visibility: () => visible() }, children: ["Click me"] }))

    expect(body.innerHTML).toEqual(`<div style="visibility: hidden;">Click me</div>`)
    setVisible('visible')
    expect(body.innerHTML).toEqual(`<div style="visibility: visible;">Click me</div>`)
    setVisible('')
    expect(body.innerHTML).toEqual(`<div style="">Click me</div>`)
  })

  it('update text child on click', () => {
    const Element = () => {
      const [count, setCount] = signal(10)

      const increase = () => setCount(count() + 5)
      const size = () => `Size: ${count()}px`

      return h("div", { onclick: increase, children: [size] })
    }
    body.appendChild(Element())

    expect(body.innerHTML).toEqual(`<div>Size: 10px</div>`)

    body.querySelector('div')?.click()

    expect(body.innerHTML).toEqual(`<div>Size: 15px</div>`)
  })

  it('update element child on click', () => {
    const Element = () => {
      const [count, setCount] = signal(10)

      const increase = () => setCount(count() + 5)

      return h("div", { onclick: increase, children: [
        h('strong', { children: [
          () => `Size: ${count()}px`
        ]})
      ]})
    }
    body.appendChild(Element())

    expect(body.innerHTML).toEqual(`<div><strong>Size: 10px</strong></div>`)

    body.querySelector('div')?.click()

    expect(body.innerHTML).toEqual(`<div><strong>Size: 15px</strong></div>`)
  })

  it('h inside h', () => {
    const [count, setCount] = signal(5)
    const increase = () => setCount(count() + 5)

    const text = () => count() >= 10 ? `Size: ${count()}px - ` : 'c'
    const howBig = () => (count() < 10) ? "CLICK ME" : (count() < 20) ? "S" : (count() < 40) ? "M" : (count() < 60) ? "L" : "XL"

    body.appendChild(h("div", { children: [
      text,
      h('strong', { children: [howBig] })
    ]}))

    expect(body.innerHTML).toEqual(`<div>c<strong>CLICK ME</strong></div>`)

    increase()

    expect(body.innerHTML).toEqual(`<div>Size: 10px - <strong>S</strong></div>`)

    increase()

    expect(body.innerHTML).toEqual(`<div>Size: 15px - <strong>S</strong></div>`)

    increase()

    expect(body.innerHTML).toEqual(`<div>Size: 20px - <strong>M</strong></div>`)
  })

  it('update children based on status', () => {
    const [count, setCount] = signal(5)
    const increase = () => setCount(count() + 5)
    const toElement = (count: number) => h('p', { children: count.toString() })
    const children = derive<Element[]>([], (current) => [...current, toElement(count())])

    body.appendChild(h("div", { children }))

    expect(body.innerHTML).toEqual(`<div><p>5</p></div>`)

    increase()
    expect(body.innerHTML).toEqual(`<div><p>5</p><p>10</p></div>`)

    increase()
    expect(body.innerHTML).toEqual(`<div><p>5</p><p>10</p><p>15</p></div>`)
  })

  it('nested elements', () => {
    const Nested = ({ name }: {name: string}) => {
      return h("p", { className: name, children: ["Nested"] })
    }
    const Element = () => {
      return h("div", { className: "Element", children: [Nested({name: 'name'})] })
    }
    body.appendChild(Element())

    expect(body.innerHTML).toEqual(`<div class="Element"><p class="name">Nested</p></div>`)
  })

  it('use html components', () => {
    const Nested = ({ name }: {name: string}) => {
      return P({ className: name, children: ["Nested"] })
    }
    const Element = () => {
      return Div({ className: "Element", children: [Nested({name: 'name'})]})
    }
    body.appendChild(Element())

    expect(body.innerHTML).toEqual(`<div class="Element"><p class="name">Nested</p></div>`)
  })
})
