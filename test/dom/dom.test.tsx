/** @jsxImportSource ../../src/dom */
import { signal } from '../../src/reactivity';

const body = document.body

describe("dom", () => {
  beforeEach(() => {
    body.innerHTML = ''
  })

  it('create an element', () => {
    const element = <div></div>
    body.appendChild(element)

    expect(body.innerHTML).toEqual("<div></div>")
  })

  it('create a div element with a text inside', () => {
    const element = <div>ciao</div>
    body.appendChild(element)

    expect(body.innerHTML).toEqual("<div>ciao</div>")
  })

  it('create a div element with properties', () => {
    const element = <div className="class1"></div>
    body.appendChild(element)

    expect(body.innerHTML).toEqual(`<div class="class1"></div>`)
  })

  it('create a div element with style properties', () => {
    const element = <div style={{ fontSize: "15px" }}></div>
    body.appendChild(element)

    expect(body.innerHTML).toEqual(`<div style="font-size: 15px;"></div>`)
  })

  it('create a div element with reactive properties', () => {
    const element = <div className={() => 'test'} style={() => ({ padding: '5px' })}></div>
    body.appendChild(element)

    expect(body.innerHTML).toEqual(`<div class="test" style="padding: 5px;"></div>`)
  })

  it('create a div element with reactive style attributes', () => {
    const element = <div style={{ padding: () => '5px' }}></div>
    body.appendChild(element)

    expect(body.innerHTML).toEqual(`<div style="padding: 5px;"></div>`)
  })

  it('handle reactivity', () => {
    const [count, setCount] = signal(14)
    const element = <div style={{ fontSize: () => `${count()}px` }}>Increase</div>
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

      return <div className="test" style={{ fontSize }} onclick={increase}>Click me</div>
    }
    body.appendChild(Element())

    expect(body.innerHTML).toEqual(`<div class="test" style="font-size: 10px;">Click me</div>`)

    body.querySelector('div')?.click()

    expect(body.innerHTML).toEqual(`<div class="test" style="font-size: 15px;">Click me</div>`)
  })

  it('remove a style property using an empty value', () => {
    const [visibility, setVisibility] = signal<string>('hidden')

    body.appendChild(<div style={{ visibility }}>Text</div>)

    expect(body.innerHTML).toEqual(`<div style="visibility: hidden;">Text</div>`)
    setVisibility('visible')
    expect(body.innerHTML).toEqual(`<div style="visibility: visible;">Text</div>`)
    setVisibility('')
    expect(body.innerHTML).toEqual(`<div style="">Text</div>`)
  })

  it('update text child on click', () => {
    const Element = () => {
      const [count, setCount] = signal(10)

      const increase = () => setCount(count() + 5)

      return <div onclick={increase}>Size: {count}px</div>
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

      return <div onclick={increase}>
        <strong>Size: {count}px</strong>
      </div>
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

    body.appendChild(<div>{text}<strong>{howBig}</strong></div>)

    expect(body.innerHTML).toEqual(`<div>c<strong>CLICK ME</strong></div>`)

    increase()

    expect(body.innerHTML).toEqual(`<div>Size: 10px - <strong>S</strong></div>`)

    increase()

    expect(body.innerHTML).toEqual(`<div>Size: 15px - <strong>S</strong></div>`)

    increase()

    expect(body.innerHTML).toEqual(`<div>Size: 20px - <strong>M</strong></div>`)
  })

  it('nested elements', () => {
    const Nested = ({ name }: {name: string}) => {
      return <p className={name}>Nested</p>
    }
    const Element = () => {
      return <div className="Element"><Nested name={'name'} /></div>
    }
    body.appendChild(Element())

    expect(body.innerHTML).toEqual(`<div class="Element"><p class="name">Nested</p></div>`)
  })
})