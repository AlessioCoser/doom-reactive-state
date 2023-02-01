type Child = Node | string
type Properties<T extends keyof HTMLElementTagNameMap> = {
  [K in keyof HTMLElementTagNameMap[T] as K extends keyof HTMLElementTagNameMap[T] ? K : never]?: HTMLElementTagNameMap[T][K]
}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, properties: Properties<K> = {}, children: Child[] = []): HTMLElementTagNameMap[K] {
  const el: HTMLElementTagNameMap[K] = document.createElement(tag)

  Object.entries(properties).forEach((property) => {
    const key = property[0] as keyof HTMLElementTagNameMap[K]
    const value = property[1] as HTMLElementTagNameMap[K][keyof HTMLElementTagNameMap[K]]
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