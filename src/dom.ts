type Child = Node | string
type Properties<T extends keyof HTMLElementTagNameMap> = Partial<Omit<{
  [K in keyof HTMLElementTagNameMap[T] as K extends keyof HTMLElementTagNameMap[T] ? K : never]: HTMLElementTagNameMap[T][K]
}, 'style'> & { style: Styles }>

type StylesDeclaration = Omit<CSSStyleDeclaration, 'length' | 'parentRule' | 'getPropertyPriority' | 'getPropertyValue' | 'removeProperty' | 'setProperty' | 'item' | number>
type Styles = { [K in keyof StylesDeclaration as K extends keyof StylesDeclaration ? K : never]?: StylesDeclaration[K] }
type StyleKey = keyof Styles
type StyleProps = Styles[keyof Styles]

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, properties: Properties<K> = {}, children: Child[] = []): HTMLElementTagNameMap[K] {
  const el: HTMLElementTagNameMap[K] = document.createElement(tag)

  Object.entries(properties).forEach((property) => {
    const key = property[0] as keyof HTMLElementTagNameMap[K]
    const value = property[1] as HTMLElementTagNameMap[K][keyof HTMLElementTagNameMap[K]]

    if (key === 'style') {
      Object.entries(value as Styles).forEach((styleAttribute) => {
        const attributeKey = styleAttribute[0] as StyleKey
        const attributeValue = styleAttribute[1] as StyleProps
        if(attributeValue) {
          el.style[attributeKey] = attributeValue
        }
      })
      return
    }

    el[key] = value
  })

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