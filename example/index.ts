import { h } from '../src/dom'
// we always return a DOM Element from our components

const component = h("div", { onclick: () => alert('alert') }, ["test"])

document.body.appendChild(component)