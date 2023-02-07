import { effect } from "./reactivity"
import { updateChildren } from './updateChildren'

const pass = <T>(prop: Reactive<T>): T => prop as T
const evaluate = <T>(prop: Reactive<T>): T => typeof prop !== 'function' ? prop : (prop as Function)()

type Child = Element | string
type Reactive<T> = T | (() => T)

type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>
type PartialWithStyles<T> = Partial<{ style: Reactive<Styles> } & Omit<T, 'style'>>
type WritableProperties<T extends keyof HTMLElementTagNameMap> = Omit<{
  [K in keyof HTMLElementTagNameMap[T] as K extends keyof HTMLElementTagNameMap[T] ? K : never]: Reactive<HTMLElementTagNameMap[T][K]>
}, 'ATTRIBUTE_NODE' | 'CDATA_SECTION_NODE' | 'COMMENT_NODE' | 'DOCUMENT_FRAGMENT_NODE' | 'DOCUMENT_NODE' | 'DOCUMENT_POSITION_CONTAINED_BY' | 'DOCUMENT_POSITION_CONTAINS' | 'DOCUMENT_POSITION_DISCONNECTED' | 'DOCUMENT_POSITION_FOLLOWING' | 'DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC' | 'DOCUMENT_POSITION_PRECEDING' | 'DOCUMENT_TYPE_NODE' | 'ELEMENT_NODE' | 'ENTITY_NODE' | 'ENTITY_REFERENCE_NODE' | 'NOTATION_NODE' | 'PROCESSING_INSTRUCTION_NODE' | 'TEXT_NODE' | 'accessKeyLabel' | 'assignedSlot' | 'attributes' | 'baseURI' | 'childElementCount' | 'childNodes' | 'children' | 'classList' | 'clientHeight' | 'clientLeft' | 'clientTop' | 'clientWidth' | 'dataset' | 'firstChild' | 'firstElementChild' | 'isConnected' | 'isContentEditable' | 'lastChild' | 'lastElementChild' | 'localName' | 'namespaceURI' | 'nextElementSibling' | 'nextSibling' | 'nodeName' | 'nodeType' | 'offsetHeight' | 'offsetLeft' | 'offsetParent' | 'offsetTop' | 'offsetWidth' | 'ownerDocument' | 'parentElement' | 'parentNode' | 'part' | 'prefix' | 'previousElementSibling' | 'previousSibling' | 'scrollHeight' | 'scrollWidth' | 'shadowRoot' | 'tagName' | 'ATTRIBUTE_NODE' | 'CDATA_SECTION_NODE' | 'COMMENT_NODE' | 'DOCUMENT_FRAGMENT_NODE' | 'DOCUMENT_NODE' | 'DOCUMENT_POSITION_CONTAINED_BY' | 'DOCUMENT_POSITION_CONTAINS' | 'DOCUMENT_POSITION_DISCONNECTED' | 'DOCUMENT_POSITION_FOLLOWING' | 'DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC' | 'DOCUMENT_POSITION_PRECEDING' | 'DOCUMENT_TYPE_NODE' | 'ELEMENT_NODE' | 'ENTITY_NODE' | 'ENTITY_REFERENCE_NODE' | 'NOTATION_NODE' | 'PROCESSING_INSTRUCTION_NODE' | 'TEXT_NODE' | 'accessKeyLabel' | 'assignedSlot' | 'attributes' | 'baseURI' | 'childElementCount' | 'childNodes' | 'children' | 'classList' | 'clientHeight' | 'clientLeft' | 'clientTop' | 'clientWidth' | 'dataset' | 'firstChild' | 'firstElementChild' | 'isConnected' | 'isContentEditable' | 'lastChild' | 'lastElementChild' | 'localName' | 'namespaceURI' | 'nextElementSibling' | 'nextSibling' | 'nodeName' | 'nodeType' | 'offsetHeight' | 'offsetLeft' | 'offsetParent' | 'offsetTop' | 'offsetWidth' | 'ownerDocument' | 'parentElement' | 'parentNode' | 'part' | 'prefix' | 'previousElementSibling' | 'previousSibling' | 'scrollHeight' | 'scrollWidth' | 'shadowRoot' | 'style' | 'tagName'>

type Properties<T extends keyof HTMLElementTagNameMap> = PartialWithStyles<NonFunctionProperties<WritableProperties<T>>>

type StylesDeclaration = Omit<CSSStyleDeclaration, typeof Symbol.iterator | number | 'length' | 'parentRule' | 'getPropertyPriority' | 'getPropertyValue' | 'removeProperty' | 'setProperty' | 'item'>
type Styles = { [K in keyof StylesDeclaration as K extends keyof StylesDeclaration ? K : never]?: Reactive<StylesDeclaration[K]> }
type Style = {key: keyof Styles, value: Styles[keyof Styles]}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, properties: Properties<K> = {}, children: Reactive<Child[]> = []): HTMLElementTagNameMap[K] {
  const el: HTMLElementTagNameMap[K] = document.createElement(tag)

  Object.entries(properties).forEach((property) => {
    const key = property[0] as keyof HTMLElementTagNameMap[K]
    const value = property[1] as Reactive<HTMLElementTagNameMap[K][keyof HTMLElementTagNameMap[K]]>

    if (key === 'style') {
      effect(() => {
        const styles = evaluate(value as Reactive<Styles>)
        toStyles(styles).forEach((style) => {
          el.style[style.key] = evaluate(style.value) || ''
        })
      })
      return
    }

    if ((key as String).startsWith('on')) {
      el[key] = pass(value)
      return
    }

    effect(() => { el[key] = evaluate(value) })
  })

  effect(() =>  updateChildren(el, evaluateChildNodes(children)))

  return el
}

function toStyles(styleValue: Styles): Style[] {
  return Object.entries(styleValue).map((styleAttribute) => {
    return {
      key: styleAttribute[0] as Style['key'],
      value: styleAttribute[1] as Style['value']
    }
  })
}

function evaluateChildNodes(children: Reactive<Child[]>): ChildNode[] {
  return evaluate(children).map(toChildNode)
}

function toChildNode(child: Child): ChildNode {
  return (typeof child === 'string') ?
      document.createTextNode(child)
      : child
}
